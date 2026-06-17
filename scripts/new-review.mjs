#!/usr/bin/env node
/**
 * Scaffold a new review from templates/review.mdx.
 *
 * Usage:  npm run new:review -- "Tool Name"
 * Creates: src/content/reviews/<tool-slug>-review.mdx
 *          src/assets/images/<tool-slug>.svg (placeholder)
 */
import fs from 'node:fs';
import path from 'node:path';

const name = process.argv.slice(2).join(' ').trim();
if (!name) {
  console.error('Usage: npm run new:review -- "Tool Name"');
  process.exit(1);
}

const slug = name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
const today = new Date().toISOString().slice(0, 10);
const year = today.slice(0, 4);

const root = path.resolve(import.meta.dirname, '..');
const dest = path.join(root, 'src', 'content', 'reviews', `${slug}-review.mdx`);
const imageDest = path.join(root, 'src', 'assets', 'images', `${slug}.svg`);

if (fs.existsSync(dest)) {
  console.error(`Already exists: ${path.relative(root, dest)}`);
  process.exit(1);
}

const template = fs.readFileSync(path.join(root, 'templates', 'review.mdx'), 'utf8');
const content = template
  .replaceAll('{{TOOL_NAME}}', name)
  .replaceAll('{{TOOL_SLUG}}', slug)
  .replaceAll('{{DATE}}', today)
  .replaceAll('{{YEAR}}', year);

fs.writeFileSync(dest, content);

if (!fs.existsSync(imageDest)) {
  const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- TODO: replace with a real screenshot of ${name} -->
  <rect width="1200" height="630" fill="#f0fdfa"/>
  <rect x="80" y="80" width="1040" height="470" rx="16" fill="#ffffff" stroke="#99f6e4" stroke-width="3"/>
  <text x="600" y="330" font-family="system-ui, sans-serif" font-size="40" font-weight="bold" fill="#134e4a" text-anchor="middle">${name} — placeholder image</text>
</svg>\n`;
  fs.writeFileSync(imageDest, placeholderSvg);
}

console.log(`Created ${path.relative(root, dest)}`);
console.log(`Created ${path.relative(root, imageDest)} (placeholder)`);
console.log('');
console.log('Next steps:');
console.log(`  1. Add "${slug}" to src/config/affiliates.ts with your affiliate URL`);
console.log('  2. Fill in the TODOs in the new .mdx file');
console.log('  3. Replace the placeholder featured image with a real screenshot');
