// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// TODO: set your production domain here AND in src/config/site.ts (keep them in sync)
const SITE_URL = 'https://toolstackreviews.com';

export default defineConfig({
  site: SITE_URL,
  // Static by default; only /api/recommend opts into on-demand rendering
  // (prerender = false) and runs as a Vercel serverless function.
  // Deploying to Cloudflare Pages instead? Swap to @astrojs/cloudflare —
  // the endpoint code is platform-agnostic (standard Request/Response).
  adapter: vercel(),
  integrations: [
    mdx(),
    // /go/ pages are affiliate redirects — keep them out of the sitemap
    sitemap({ filter: (page) => !page.includes('/go/') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
