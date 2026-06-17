import type { APIContext } from 'astro';

/**
 * GEO (AI search) policy: AI crawlers are explicitly ALLOWED — being cited
 * by ChatGPT/Claude/Perplexity answers is a traffic channel for this site.
 *
 * ⚠️ If deploying to Cloudflare: disable the "Block AI bots" / "AI Scrapers
 * and Crawlers" setting (Security → Bots), or it will override everything
 * below at the network level and these bots will never see the site.
 */
const AI_BOTS = [
  'GPTBot', // OpenAI / ChatGPT search
  'ClaudeBot', // Anthropic crawler
  'Claude-Web', // Anthropic user-triggered fetches
  'PerplexityBot', // Perplexity search
  'Google-Extended', // Google AI (Gemini) training/grounding
  'Bingbot', // Bing + Copilot
  'CCBot', // Common Crawl (feeds many AI systems)
];

export function GET({ site }: APIContext) {
  const aiBotBlocks = AI_BOTS.map((bot) =>
    [`User-agent: ${bot}`, 'Allow: /', 'Disallow: /go/'].join('\n')
  );

  const body =
    [
      '# AI crawlers explicitly welcome — see /llms.txt for a machine-readable site summary.',
      ...aiBotBlocks,
      // Affiliate redirects stay blocked for everyone
      ['User-agent: *', 'Allow: /', 'Disallow: /go/'].join('\n'),
      `Sitemap: ${new URL('sitemap-index.xml', site)}`,
    ].join('\n\n') + '\n';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
