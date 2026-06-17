import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { SITE } from '../../config/site';
import { overallScore, formatScore } from '../../lib/score';

/**
 * Build-time OG image generation: one 1200x630 PNG per post at
 * /og/<collection>/<id>.png — title + score + site branding in the
 * "testing bench" palette.
 */
const [reviews, comparisons, guides, roundups] = await Promise.all([
  getCollection('reviews'),
  getCollection('comparisons'),
  getCollection('guides'),
  getCollection('roundups'),
]);

interface OgPage {
  title: string;
  description: string;
}

const pages: Record<string, OgPage> = Object.fromEntries([
  ...reviews.map((entry) => [
    `reviews/${entry.id}`,
    {
      title: entry.data.title,
      description: `Tested score: ${formatScore(overallScore(entry.data.scores))}/10 · ${SITE.name}`,
    },
  ]),
  ...comparisons.map((entry) => [
    `vs/${entry.id}`,
    {
      title: entry.data.title,
      description: `Winner: ${entry.data.winner} · ${SITE.name}`,
    },
  ]),
  ...guides.map((entry) => [
    `blog/${entry.id}`,
    { title: entry.data.title, description: SITE.name },
  ]),
  ...roundups.map((entry) => [
    `best/${entry.id}`,
    { title: entry.data.title, description: SITE.name },
  ]),
]);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page: OgPage) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[250, 250, 248]],
    border: { color: [13, 148, 136], width: 16, side: 'block-end' },
    padding: 72,
    font: {
      title: {
        color: [26, 29, 33],
        size: 60,
        weight: 'Bold',
        lineHeight: 1.2,
      },
      description: {
        color: [13, 148, 136],
        size: 30,
        weight: 'SemiBold',
      },
    },
  }),
});
