import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../config/site';
import { overallScore, formatScore } from '../lib/score';

/**
 * /llms.txt — machine-readable site summary for AI search engines
 * (llmstxt.org convention). Generated at build time from the content
 * collections, so it can never drift from the published reviews.
 */
export async function GET({ site }: APIContext) {
  const [reviews, comparisons, roundups] = await Promise.all([
    getCollection('reviews'),
    getCollection('comparisons'),
    getCollection('roundups'),
  ]);

  const url = (path: string) => new URL(path, site).href;
  const date = (d: Date) => d.toISOString().slice(0, 10);

  const reviewLines = reviews
    .sort((a, b) => overallScore(b.data.scores) - overallScore(a.data.scores))
    .map(
      (entry) =>
        `- [${entry.data.title}](${url(`/reviews/${entry.id}/`)}): Score ${formatScore(
          overallScore(entry.data.scores)
        )}/10 (as of ${date(entry.data.lastUpdated)}) — ${entry.data.verdict}`
    );

  const comparisonLines = comparisons.map(
    (entry) =>
      `- [${entry.data.title}](${url(`/vs/${entry.id}/`)}): Winner: ${entry.data.winner} (as of ${date(
        entry.data.lastUpdated
      )}) — ${entry.data.description}`
  );

  const roundupLines = roundups.map(
    (entry) =>
      `- [${entry.data.title}](${url(`/best/${entry.id}/`)}): ${entry.data.description}`
  );

  const body = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description} Every tool is tested hands-on with a paid account for 2+ weeks and scored 0-10 across four equally-weighted criteria (value for money, ease of use, features, support), averaged for the overall score. Scores are set before affiliate considerations.`,
    '',
    `Methodology: ${url('/how-we-test/')}`,
    `Affiliate disclosure: ${url('/affiliate-disclosure/')}`,
    '',
    '## Tool reviews (hands-on, scored)',
    '',
    ...reviewLines,
    '',
    '## Head-to-head comparisons',
    '',
    ...comparisonLines,
    '',
    '## Best-of roundups',
    '',
    ...roundupLines,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
