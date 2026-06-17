import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { buildCatalog, type CatalogTool } from '../../lib/catalog';

export const prerender = false;

/**
 * AI Tool Finder endpoint. The model may ONLY recommend tools from the
 * catalog built out of our reviews collection — it returns slugs + reasons,
 * and we join those back to real catalog data server-side, so it can never
 * invent tools, scores, or links.
 */

const MAX_QUERY_LENGTH = 600;
const MODEL = 'claude-sonnet-4-6';

// --- Rate limiting: 5 requests/hour per IP -------------------------------
// In-memory and therefore per-serverless-instance (best effort). Good enough
// to protect the API bill; upgrade to Vercel KV / Upstash for a hard limit.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Prune the map occasionally so it can't grow unbounded
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

// --- Strict output schema (enforced by the API via structured outputs) ----
const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'A slug copied exactly from the catalog' },
          reason: {
            type: 'string',
            description:
              "One sentence tailored to the visitor's situation explaining why this tool fits",
          },
        },
        required: ['slug', 'reason'],
        additionalProperties: false,
      },
    },
    message: {
      type: 'string',
      description:
        'Shown above the recommendations. If nothing in the catalog fits, say so honestly here and return an empty recommendations array.',
    },
  },
  required: ['recommendations', 'message'],
  additionalProperties: false,
} as const;

function systemPrompt(catalog: CatalogTool[]): string {
  return [
    'You are the tool recommender for ToolStack Reviews, a site that hand-tests software for US freelancers and solopreneurs.',
    'A visitor will describe their situation. Recommend 3-5 tools — ONLY from the catalog below, identified by their exact `slug`.',
    'Rules:',
    '- Never recommend, mention, or allude to any tool not in the catalog.',
    '- Each reason must be one sentence, specific to what the visitor said (their role, pain point, or budget) — not a generic blurb.',
    '- Respect stated budgets using the pricingFrom field.',
    '- Prefer higher-scored tools when two fit equally well.',
    "- If the visitor's need genuinely doesn't match anything in the catalog (e.g. they need video editing and we only cover marketing tools), return an empty recommendations array and use `message` to say so honestly and suggest they browse our reviews. Never force a bad match.",
    '',
    `CATALOG (JSON): ${JSON.stringify(catalog.map(({ slug, toolName, category, pricingFrom, score, oneLineVerdict }) => ({ slug, toolName, category, pricingFrom, score, oneLineVerdict })))}`,
  ].join('\n');
}

interface ModelOutput {
  recommendations: { slug: string; reason: string }[];
  message: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let ip = 'unknown';
  try {
    ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress;
  } catch {
    /* clientAddress can throw in some local contexts */
  }

  if (rateLimited(ip)) {
    return json(
      { error: 'rate_limited', message: 'Too many requests — try again in an hour.' },
      429
    );
  }

  let query = '';
  let chips: Record<string, string> = {};
  try {
    const body = await request.json();
    query = String(body.query ?? '').slice(0, MAX_QUERY_LENGTH).trim();
    chips = {
      role: String(body.role ?? ''),
      teamSize: String(body.teamSize ?? ''),
      budget: String(body.budget ?? ''),
    };
  } catch {
    return json({ error: 'bad_request', message: 'Invalid JSON body.' }, 400);
  }

  if (!query) {
    return json({ error: 'bad_request', message: 'Describe your situation first.' }, 400);
  }

  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  const catalog = await buildCatalog();
  const fallback = {
    fallback: true,
    message: 'Our recommender is taking a break — browse our top-rated tools instead.',
    recommendations: catalog.slice(0, 3).map((tool) => ({ ...tool, reason: tool.oneLineVerdict })),
  };

  if (!apiKey) {
    console.error('[tool-finder] ANTHROPIC_API_KEY is not set');
    return json(fallback);
  }

  // Log the (anonymized) query — these are future article ideas.
  console.log(
    JSON.stringify({ event: 'tool_finder_query', query, ...chips, ts: new Date().toISOString() })
  );

  const userMessage = [
    `Visitor's situation: ${query}`,
    chips.role && `Role: ${chips.role}`,
    chips.teamSize && `Team size: ${chips.teamSize}`,
    chips.budget && `Monthly budget: ${chips.budget}`,
  ]
    .filter(Boolean)
    .join('\n');

  const client = new Anthropic({ apiKey });
  const validSlugs = new Set(catalog.map((tool) => tool.slug));

  // Structured outputs guarantee schema-valid JSON; retry once on any failure.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        thinking: { type: 'disabled' },
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
        },
        system: systemPrompt(catalog),
        messages: [{ role: 'user', content: userMessage }],
      });

      const text = response.content.find((block) => block.type === 'text')?.text ?? '';
      const parsed = JSON.parse(text) as ModelOutput;

      // Join slugs back to catalog data — the AI never supplies scores/links.
      const recommendations = parsed.recommendations
        .filter((rec) => validSlugs.has(rec.slug))
        .slice(0, 5)
        .map((rec) => {
          const tool = catalog.find((t) => t.slug === rec.slug)!;
          return { ...tool, reason: rec.reason };
        });

      return json({ fallback: false, message: parsed.message, recommendations });
    } catch (error) {
      console.error(`[tool-finder] attempt ${attempt + 1} failed:`, error);
      if (error instanceof Anthropic.RateLimitError) break; // retrying won't help the bill
    }
  }

  return json(fallback);
};
