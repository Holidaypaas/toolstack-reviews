import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../config/site';

export async function GET(context: APIContext) {
  const [reviews, comparisons, guides, roundups] = await Promise.all([
    getCollection('reviews'),
    getCollection('comparisons'),
    getCollection('guides'),
    getCollection('roundups'),
  ]);

  const items = [
    ...reviews.map((e) => ({ entry: e, link: `/reviews/${e.id}/` })),
    ...comparisons.map((e) => ({ entry: e, link: `/vs/${e.id}/` })),
    ...guides.map((e) => ({ entry: e, link: `/blog/${e.id}/` })),
    ...roundups.map((e) => ({ entry: e, link: `/best/${e.id}/` })),
  ].sort(
    (a, b) => b.entry.data.publishDate.valueOf() - a.entry.data.publishDate.valueOf()
  );

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: items.map(({ entry, link }) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishDate,
      link,
    })),
    customData: '<language>en-us</language>',
  });
}
