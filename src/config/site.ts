/**
 * Sitewide settings. Change the blog name / author here once and it updates everywhere.
 */
export const SITE = {
  // TODO: replace with your real blog name
  name: 'ToolStack Reviews',
  // TODO: keep in sync with `site` in astro.config.mjs
  url: 'https://toolstackreviews.com',
  description:
    'Honest, hands-on reviews and comparisons of software tools for US-based freelancers and solopreneurs.',
  tagline: 'Software reviews you can actually trust.',
  locale: 'en_US',
  // TODO: replace with your name — also update src/content/authors/
  defaultAuthorId: 'alex-carter',
  social: {
    // TODO: replace with your real profiles (used in Organization JSON-LD)
    twitter: 'https://twitter.com/toolstackreviews',
    linkedin: 'https://www.linkedin.com/company/toolstackreviews',
  },
} as const;
