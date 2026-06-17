# ToolStack Reviews

SEO-focused affiliate blog built with [Astro](https://astro.build), MDX, Tailwind CSS, and TypeScript. Static output, zero JS by default, deployable anywhere.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321 (includes the /api/recommend endpoint)
npm run build      # builds static pages + the serverless function (Vercel adapter)
```

> Note: `astro preview` is not supported with the Vercel adapter. Use
> `npm run dev` locally, or `npx vercel dev` to emulate the deployed setup.

## Before launch — find every `TODO`

The site ships with placeholders marked `TODO` throughout. At minimum:

1. **Blog name & URL** — [src/config/site.ts](src/config/site.ts) and `site` in [astro.config.mjs](astro.config.mjs) (keep in sync)
2. **Author** — [src/content/authors/alex-carter.json](src/content/authors/alex-carter.json) + avatar image
3. **Affiliate URLs** — [src/config/affiliates.ts](src/config/affiliates.ts) (all are `PLACEHOLDER_AFFILIATE_ID`)
4. **Seed content claims** — every `TODO` comment in `src/content/` marks an unverified placeholder claim
5. **Legal pages** — have a lawyer review the disclosure/privacy/terms placeholder copy
6. **OG image** — replace `public/og-default.png`

## How to add a new review

1. **Scaffold it:**
   ```bash
   npm run new:review -- "Notion"
   ```
   This creates `src/content/reviews/notion-review.mdx` from [templates/review.mdx](templates/review.mdx) plus a placeholder featured image at `src/assets/images/notion.svg`.

2. **Register the affiliate program** in [src/config/affiliates.ts](src/config/affiliates.ts):
   ```ts
   notion: {
     url: 'https://affiliate.notion.so/YOUR_ID',
     programName: 'Notion Affiliate Program',
     nofollow: true,
   },
   ```
   The key (`notion`) becomes the redirect slug: `/go/notion/`.

3. **Fill in the frontmatter and body.** The schema (title, category, `scores` — four 0–10 sub-scores from the rubric, pros, cons, verdict, …) is enforced at build time by [src/content.config.ts](src/content.config.ts) — the build fails loudly if a field is missing. The overall score (e.g. 8.4) is computed as the mean of the sub-scores; the score card, listing badges, OG image, and JSON-LD all derive from it automatically.

4. **Replace the placeholder image** with a real screenshot (any format; it's optimized at build).

5. `npm run build` — done. The review appears at `/reviews/notion-review/`, in the homepage grid, the reviews index, the sitemap, and the RSS feed automatically.

The VerdictBox, ProsCons, FTC disclosure, TOC, byline, and JSON-LD (Product + Review + Article + BreadcrumbList) are all rendered automatically from frontmatter — you only write the article body.

## How to add an affiliate program (without a review)

Add an entry to [src/config/affiliates.ts](src/config/affiliates.ts), then link to `/go/<key>/` anywhere in content. Never paste a raw vendor URL into content — `/go/` links are the single point of update and carry click tracking + `rel="sponsored"`.

## Content collections

| Collection | Folder | Route |
|---|---|---|
| `reviews` | `src/content/reviews/` | `/reviews/[slug]` |
| `comparisons` | `src/content/comparisons/` | `/vs/[slug]` |
| `guides` | `src/content/guides/` | `/blog/[slug]` |
| `roundups` (listicles) | `src/content/roundups/` | `/best/[slug]` |
| `authors` (data) | `src/content/authors/` | referenced by `author:` frontmatter |

## Environment variables

Copy `.env.example` → `.env`:

| Var | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | **Server-only.** Powers the AI Tool Finder (`/api/recommend`). Without it the finder shows top-rated tools as a fallback. |
| `PUBLIC_EMAIL_FORM_ACTION` | Form action URL for the email signup (MailerLite etc.) |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Enables Plausible analytics |
| `PUBLIC_GA4_ID` | Enables GA4 (ignored if Plausible is set) |

Affiliate clicks are pushed to `window.dataLayer` as `affiliate_click` / `affiliate_redirect` events — wire them into GTM or your analytics when ready.

## Deploy

### Vercel

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Astro** (auto-detected). Build command `npm run build`, output `dist/` — defaults are correct.
3. Add the `PUBLIC_*` env vars in Project Settings → Environment Variables.
4. Set your production domain, then update `site` in `astro.config.mjs` + `src/config/site.ts` and redeploy.

### Cloudflare Pages

1. Push to GitHub and create a project at the Cloudflare dashboard → Workers & Pages → Create → Pages.
2. Framework preset: **Astro**. Build command `npm run build`, output directory `dist`.
3. Add the `PUBLIC_*` env vars under Settings → Environment variables.
4. Same domain-update step as above.

**Optional — true 301 affiliate redirects:** the `/go/` pages work everywhere as static meta-refresh redirects. On Cloudflare you can add a `public/_redirects` file (or `vercel.json` `redirects` on Vercel) generated from `src/config/affiliates.ts` for server-side 301s; content URLs don't change either way.

## AI Tool Finder

`/tool-finder` lets visitors describe their business and get a 3–5 tool stack. How it stays honest:

- The serverless function (`src/pages/api/recommend.ts`, the only non-static route) builds a **catalog from the reviews collection** — tool names, our scores, verdicts, and `/go/` links.
- Claude (`claude-sonnet-4-6`, structured outputs) may only return catalog **slugs + one-sentence reasons**; we join slugs back to real data server-side, so it can never invent tools, scores, or links.
- No-match cases return an honest "nothing fits" message instead of a forced recommendation; an AI-disclosure line renders under every result set.
- IP rate limit: 5 requests/hour (in-memory, per instance — upgrade to KV for a hard limit). Queries are logged anonymously to the function console as future article ideas.
- Deploying to Cloudflare Pages instead of Vercel? Swap `@astrojs/vercel` for `@astrojs/cloudflare` in `astro.config.mjs` — the endpoint uses standard Request/Response and needs no changes.

## GEO (AI search) layer

The site is optimized to be cited by AI search engines (ChatGPT, Claude, Perplexity, Copilot):

- **robots.txt** explicitly allows GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Bingbot, and CCBot. ⚠️ **On Cloudflare, disable "Block AI bots"** (Security → Bots) or these rules are overridden at the network level.
- **`/llms.txt`** is generated at build time from the content collections — site summary plus every review (title, score, as-of date, verdict, URL) and comparison.
- **`quickAnswer` frontmatter** (required on reviews/comparisons) renders as the `<QuickAnswer>` box in the first 200 words — a 60-80 word self-contained answer engines can quote verbatim.
- **`keyFacts` frontmatter** renders the dated `<KeyFacts>` box and feeds `PropertyValue` entries into the Product JSON-LD (standalone uses emit their own ItemList schema).
- Section headings are written as searcher questions; the `<FAQ>` component auto-emits FAQPage schema; `dateModified` is on Article and Review schema, with the "Last updated" badge at the top of every post.

## Design system

Tokens live in [src/styles/global.css](src/styles/global.css) (`@theme`): paper/ink surfaces, teal accent (CTAs/links only), amber reserved for score elements, cool-gray `line` borders. Sora for headings, Inter for body, **JetBrains Mono for every number on the site** (scores, prices, dates in card footers). The test-score system is `ScoreCard` (verdict box + homepage hero) and `ScoreBadge` (cards, comparison tables); category glyphs live in `Glyph.astro`. Motion is limited to meter fills on scroll, 2px card lifts, and the one-time hero rise — all behind `prefers-reduced-motion`.

## Architecture notes

- **One layout chain:** `BaseLayout` (head/SEO/header/footer) → `ArticleLayout` (byline, disclosure, sticky TOC, end-of-post signup) → per-collection templates in `src/pages/`.
- **SEO:** canonical URLs, OG/Twitter meta, `sitemap-index.xml`, `robots.txt` (blocks `/go/`), RSS at `/rss.xml`, and JSON-LD (Organization sitewide, Product+Review on reviews, Article on posts, FAQPage via the `<FAQ>` component, BreadcrumbList on all content pages).
- **No client JS** except the 12-line affiliate click tracker and optional analytics.
- TODO: add a cookie-consent banner before introducing marketing/ad cookies.
