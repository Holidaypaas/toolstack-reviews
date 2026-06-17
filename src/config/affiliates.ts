/**
 * SINGLE SOURCE OF TRUTH for every affiliate link on the site.
 *
 * In content, never link to a vendor directly — always use the internal
 * route `/go/<toolSlug>`. That page redirects to `url` below, so updating
 * a link here updates it site-wide, and clicks can be tracked in one place.
 *
 * To add a program:
 *   1. Add an entry below (the key becomes the /go/ slug).
 *   2. Use `/go/<key>` in your MDX content and frontmatter.
 */
export interface AffiliateProgram {
  /** The real affiliate URL (with your tracking ID). */
  url: string;
  /** Human-readable program name, e.g. "Systeme.io Partner Program". */
  programName: string;
  /** Always true — affiliate links must be rel="sponsored nofollow". */
  nofollow: true;
}

export const affiliates = {
  // TODO: replace these placeholder URLs with your real affiliate links
  'systeme-io': {
    url: 'https://systeme.io/?sa=PLACEHOLDER_AFFILIATE_ID',
    programName: 'Systeme.io Partner Program',
    nofollow: true,
  },
  clickfunnels: {
    url: 'https://www.clickfunnels.com/?aff=PLACEHOLDER_AFFILIATE_ID',
    programName: 'ClickFunnels Affiliate Program',
    nofollow: true,
  },
  convertkit: {
    url: 'https://kit.com/?lmref=PLACEHOLDER_AFFILIATE_ID',
    programName: 'Kit (ConvertKit) Affiliate Program',
    nofollow: true,
  },
  mailerlite: {
    url: 'https://www.mailerlite.com/a/PLACEHOLDER_AFFILIATE_ID',
    programName: 'MailerLite Affiliate Program',
    nofollow: true,
  },
  moosend: {
    url: 'https://moosend.com/?utm_source=PLACEHOLDER_AFFILIATE_ID',
    programName: 'Moosend Affiliate Program',
    nofollow: true,
  },
} satisfies Record<string, AffiliateProgram>;

export type ToolSlug = keyof typeof affiliates;

/** Build the internal redirect path for a tool. Use this instead of raw vendor URLs. */
export function goLink(slug: ToolSlug): string {
  return `/go/${slug}/`;
}
