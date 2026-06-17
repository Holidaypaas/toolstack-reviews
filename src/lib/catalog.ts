import { getCollection } from 'astro:content';
import { overallScore } from './score';

/**
 * The tool catalog the AI Tool Finder recommends from — generated from the
 * reviews content collection, so the model can ONLY surface tools we've
 * actually tested, with our real scores and links.
 */
export interface CatalogTool {
  slug: string;
  toolName: string;
  category: string;
  pricingFrom: string;
  /** Our overall test score, 0–10. */
  score: number;
  oneLineVerdict: string;
  reviewPath: string;
  /** Internal affiliate redirect, e.g. /go/systeme-io/ */
  goPath: string;
}

export async function buildCatalog(): Promise<CatalogTool[]> {
  const reviews = await getCollection('reviews');
  return reviews
    .map((entry) => ({
      slug: entry.id,
      toolName: entry.data.toolName,
      category: entry.data.category,
      pricingFrom: entry.data.pricingFrom,
      score: overallScore(entry.data.scores),
      oneLineVerdict: entry.data.verdict,
      reviewPath: `/reviews/${entry.id}/`,
      goPath: entry.data.affiliateUrl,
    }))
    .sort((a, b) => b.score - a.score);
}
