# ToolStack Reviews editorial style guide

Every article on this site must follow these rules. Read this file in full before writing or editing any article content. "Article content" includes MDX bodies AND the frontmatter strings that render on the page (description, verdict, quickAnswer, FAQ answers).

## Voice

- Write like a sharp, friendly software reviewer talking to one busy freelancer who is about to waste money on the wrong tool. Direct address ("you"), plain English, contractions.
- Take positions. Say what's worth paying for and what isn't, and why. Every recommendation must name its trade-off.
- Be blunt about downsides: "skip it, the reporting is too thin to run a business on."

## First-person rule

This site's credibility is hands-on testing, so first-person testing claims ("I built the same funnel in both tools") are the backbone of every review. Two hard rules:

1. Every first-person claim must describe testing that actually happened. Never invent an anecdote for color.
2. Until your real testing notes replace the placeholders, every unverified claim keeps its `{/* TODO: ... */}` comment so it can't slip into publication.

Editorial opinions ("honest take:", "our recommendation:") are always allowed.

## Banned patterns

- Banned words/phrases: "delve", "in today's world", "it's worth noting", "whether you're a seasoned pro or", "unlock", "elevate", "supercharge", "game-changer", "look no further", "hidden gem", "seamless", "robust", "leverage" (as a verb), "in conclusion", "ultimately, the choice is yours".
- No intro paragraphs that restate the title or warm up. The QuickAnswer box answers the core question before the body starts; the body's first section goes straight to substance.
- No conclusion sections that summarize what was just said. End with a specific next action or a pointed final recommendation.
- Maximum one bulleted list per ~500 words. Default to paragraphs. Bullets only for genuinely list-shaped information (plan limits, prices, checklists).
- Never reuse the meta description as the article's opening paragraph or as the quickAnswer.

## Concreteness

- Every article must include real numbers: prices, plan limits, contact caps, build times, our 0-10 scores. Flag any unverified figure with `{/* TODO: verify */}` so it gets fact-checked before publishing.
- Name specific tools and plans ("Systeme.io's Startup plan at $27/mo"), not "many platforms."
- Vary paragraph length deliberately. Some paragraphs should be one sentence. Some should be five.
- Structure articles around the 6-8 real questions a freelancer googling this topic actually wants answered. Section headings ARE those questions (this also feeds the GEO layer).

## Humanizer patterns (from Wikipedia's "Signs of AI writing")

These patterns are statistical fingerprints of AI text. Avoid all of them:

- **Em dash budget: maximum 2 per article**, counting rendered frontmatter strings. Replace the rest with commas, parentheses, colons, or a new sentence. (En dashes in numeric ranges like $40–$100 don't count.)
- **No negative parallelisms.** Never "it's not just X, it's Y" or "not only... but also."
- **No copula avoidance.** Write "is", "has", "are" instead of "serves as", "boasts", "features", "stands as", "represents", "offers a".
- **No -ing tack-on clauses** that add fake depth: "...ensuring a smooth workflow", "...highlighting the value", "...reflecting the platform's commitment". Cut them or make them their own concrete sentence.
- **No vague attribution.** Never "experts say", "many users report", "industry sources suggest". Attribute to something specific ("Systeme.io's June 2026 pricing page", "our 30-day test") or state it as our editorial position.
- **No inflated-significance language**: "testament to", "pivotal", "crucial role", "evolving landscape", "underscores", "marks a shift".
- **No rule-of-three padding.** Lists of three are fine only when there are genuinely three things; don't force a triple for rhythm.
- **No synonym cycling.** Call a funnel a funnel every time; don't rotate through "funnel / pipeline / customer journey" to avoid repetition.
- **No false ranges**: "from solopreneurs to side-hustlers" style constructions where the two ends aren't a real scale.
- **No arrow chains** ("signup → funnel → profit") in article prose. Write sentences.
- **Sentence case headings** ("How much does Systeme.io cost?"), never Title Case.
- **Straight quotes** ("), not curly quotes.
- **No emojis** anywhere in articles.
- **Minimal bold.** Bold only genuinely scannable data points (prices, plan names, scores), never for rhetorical emphasis, and never as bolded-header-plus-colon list items.
- **No generic upbeat endings** ("your business will thank you", "happy building").

## Self-review pass (required before showing output)

After drafting, review and fix:

1. Any sentence that sounds like AI filler.
2. Any paragraph that makes no concrete claim.
3. Any place that hedges ("it depends on your needs") instead of recommending.
4. Any two consecutive paragraphs of identical length and rhythm.
5. Count the em dashes. More than 2: cut until under budget.

## Reference article

`src/content/reviews/systeme-io-review.mdx` is the approved voice reference. Match its tone, rhythm, and concreteness in all other articles.
