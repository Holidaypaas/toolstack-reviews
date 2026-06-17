import { SITE } from '../config/site';

export interface Crumb {
  name: string;
  /** Absolute or root-relative URL */
  url: string;
}

const absolute = (url: string) =>
  url.startsWith('http') ? url : new URL(url, SITE.url).href;

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    sameAs: [SITE.social.twitter, SITE.social.linkedin],
  };
}

export function personSchema(author: {
  name: string;
  role: string;
  twitter?: string;
  linkedin?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role,
    url: `${SITE.url}/about/`,
    sameAs: [author.twitter, author.linkedin].filter(Boolean),
  };
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absolute(crumb.url),
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishDate: Date;
  lastUpdated: Date;
  authorName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: absolute(opts.url),
    ...(opts.image ? { image: absolute(opts.image) } : {}),
    datePublished: opts.publishDate.toISOString(),
    dateModified: opts.lastUpdated.toISOString(),
    author: { '@type': 'Person', name: opts.authorName, url: `${SITE.url}/about/` },
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

/**
 * Product + nested Review schema for review pages (eligible for star rich
 * results). Uses the site's 10-point test-score scale via bestRating.
 */
export function productReviewSchema(opts: {
  toolName: string;
  description: string;
  url: string;
  image?: string;
  /** Overall test score, 0–10. */
  rating: number;
  publishDate: Date;
  lastUpdated: Date;
  authorName: string;
  /** Verifiable stats (from the KeyFacts box) attached as PropertyValues. */
  keyFacts?: { label: string; value: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.toolName,
    description: opts.description,
    ...(opts.image ? { image: absolute(opts.image) } : {}),
    ...(opts.keyFacts && opts.keyFacts.length > 0
      ? {
          additionalProperty: opts.keyFacts.map((fact) => ({
            '@type': 'PropertyValue',
            name: fact.label,
            value: fact.value,
          })),
        }
      : {}),
    review: {
      '@type': 'Review',
      name: `${opts.toolName} review`,
      url: absolute(opts.url),
      datePublished: opts.publishDate.toISOString(),
      dateModified: opts.lastUpdated.toISOString(),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: opts.rating,
        bestRating: 10,
        worstRating: 0,
      },
      author: { '@type': 'Person', name: opts.authorName, url: `${SITE.url}/about/` },
      publisher: { '@id': `${SITE.url}/#organization` },
    },
  };
}
