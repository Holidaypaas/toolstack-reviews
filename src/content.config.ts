import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Tool categories — each maps to a glyph in src/components/Glyph.astro */
export const CATEGORIES = [
  'email',
  'funnels',
  'invoicing',
  'ai-writing',
  'scheduling',
  'crm',
  'hosting',
  'productivity',
] as const;

const category = z.enum(CATEGORIES);

/** Sub-scores from the /how-we-test rubric, 0–10. Overall = their mean. */
const scores = z.object({
  easeOfUse: z.number().min(0).max(10),
  value: z.number().min(0).max(10),
  features: z.number().min(0).max(10),
  support: z.number().min(0).max(10),
});

/**
 * GEO: self-contained 60-80 word summary AI search engines can cite verbatim.
 * Must name the tool, include the verdict, and read with zero context.
 */
const quickAnswer = z
  .string()
  .min(200, 'Quick answers should be a full 60-80 word paragraph')
  .max(700, 'Keep quick answers under ~80 words');

/** GEO: 4-6 verifiable stats shown near the top with an as-of date. */
const keyFacts = z
  .array(z.object({ label: z.string(), value: z.string() }))
  .min(4)
  .max(6);

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/reviews' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(170, 'Keep meta descriptions under 170 chars'),
      toolName: z.string(),
      category,
      /** Internal /go/ path — real URLs live in src/config/affiliates.ts */
      affiliateUrl: z.string().startsWith('/go/'),
      scores,
      pros: z.array(z.string()).min(1),
      cons: z.array(z.string()).min(1),
      pricingFrom: z.string(),
      publishDate: z.coerce.date(),
      lastUpdated: z.coerce.date(),
      author: reference('authors'),
      featuredImage: image(),
      verdict: z.string().max(300),
      quickAnswer,
      keyFacts: keyFacts.optional(),
      /** Real screenshots from testing — rendered as captioned figures. */
      screenshots: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string(),
          })
        )
        .optional(),
    }),
});

const comparisons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/comparisons' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(170),
      toolA: z.string(),
      toolB: z.string(),
      winner: z.string(),
      category: category.optional(),
      quickAnswer,
      keyFacts: keyFacts.optional(),
      publishDate: z.coerce.date(),
      lastUpdated: z.coerce.date(),
      author: reference('authors'),
      featuredImage: image().optional(),
    }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(170),
      category: category.optional(),
      publishDate: z.coerce.date(),
      lastUpdated: z.coerce.date(),
      author: reference('authors'),
      featuredImage: image().optional(),
    }),
});

/** Listicles served at /best/[slug] (e.g. "Best email marketing tools"). */
const roundups = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/roundups' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(170),
      category: category.optional(),
      publishDate: z.coerce.date(),
      lastUpdated: z.coerce.date(),
      author: reference('authors'),
      featuredImage: image().optional(),
    }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      bio: z.string(),
      avatar: image(),
      role: z.string(),
      twitter: z.string().url().optional(),
      linkedin: z.string().url().optional(),
    }),
});

export const collections = { reviews, comparisons, guides, roundups, authors };
