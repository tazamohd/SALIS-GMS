---
name: marketing-content-studio
description: Reusable marketing & content prompt templates for the SALIS automotive super app (KSA/GCC, Arabic-first, two-sided marketplace). Use to produce social posts, viral hooks, short-video scripts, blogs, SEO content, ad copy, cold/lifecycle emails, subject lines, landing pages, marketing personas/audience analysis, sales funnels, pitches, and pricing/branding guidance. Distilled from 70 marketing GPT helpers into native templates. Invoke for any content-creation, copywriting, social, SEO, email, or campaign task.
license: MIT
metadata:
  author: SALIS — distilled from 70 GPT helpers
  domain: marketing
  triggers: social media, viral hook, video script, blog, SEO, ad copy, cold email, subject line, landing page, persona, audience, sales funnel, pitch, branding, copywriting, content calendar
---

# Marketing Content Studio

Native, reusable prompt templates for the `marketing-growth-lead` agent (and any agent doing
marketing work). Distilled from the 70-GPT catalog (`docs/super-app/marketing/gpt-helpers-catalog.md`).

## Global context to apply to every template
- **Product:** SALIS automotive super app — garage booking, parts, roadside, fleet, insurance,
  rentals, ride-share. Two-sided: **demand** (car owners/fleets) + **supply** (garages/drivers/partners).
- **Market:** Saudi Arabia / GCC. **Arabic-first**, English secondary. Respect local culture and
  seasonality (Ramadan, Hajj, National Day, school terms).
- **Always specify:** which audience (demand vs supply), which mini-app, the goal (install / booking /
  partner sign-up / retention), the channel, and the single CTA.
- **Always output:** Arabic + English variants when the asset is customer-facing.

## Templates

### 1. Social post (per platform)
> Write {N} {platform: Instagram/TikTok/Snapchat/X/LinkedIn} posts for SALIS targeting {audience}.
> Goal: {goal}. Tone: {tone}. Include a strong hook in line 1, {emoji?}, 3–5 hashtags, one CTA.
> Provide Arabic + English. Tailor length/format to the platform.

### 2. Viral hook generator
> Generate 10 scroll-stopping hooks (≤12 words) for {topic, e.g. "book car service in 60 seconds"}
> aimed at {audience} on {platform}. Mix curiosity, pain-point, and bold-claim styles. Arabic + English.

### 3. Short-video / Reel / Shorts script
> Write a {15–45}s vertical video script for {mini-app}. Structure: Hook (0–3s) → Problem → SALIS
> solution demo → Proof/benefit → CTA. Include on-screen text, voiceover, and shot notes. Arabic + English.

### 4. Content calendar / planner
> Build a {weekly/monthly} content calendar for SALIS across {channels}. Balance demand vs supply
> content, mix formats (educational, social proof, promo, UGC), map to funnel stage, align to KSA
> seasonality. Output a table: date · channel · format · topic · CTA · audience.

### 5. Blog / SEO article
> Write an SEO blog for SALIS on "{keyword}". Search intent: {informational/commercial}. Include
> title (≤60 chars), meta description (≤155), H2/H3 outline, 800–1200 words, internal-link
> suggestions, and an FAQ. Optimize for Arabic + English search where relevant.

### 6. SEO / ASO keywords
> Produce a keyword map for {mini-app}: primary + secondary + long-tail (Arabic + English), search
> intent, and difficulty notes. For app stores, give ASO title/subtitle/keyword-field suggestions.

### 7. Ad copy (paid)
> Write {N} ad variations for {Meta/Snapchat/TikTok/Google} promoting {mini-app} to {audience}.
> Provide headline (≤30), primary text (≤125), description, and CTA. A/B angles: price, convenience,
> trust, speed. Arabic + English. Note targeting/creative direction.

### 8. Cold / partner-acquisition email (supply side)
> Write a cold outreach email to {garages/tow operators/rental cos/insurers} to join SALIS as supply.
> Personalized opener, 1 clear value prop, social proof, low-friction CTA, ≤150 words. Arabic + English.
> Provide a 3-email follow-up sequence.

### 9. Lifecycle / CRM email & push (demand side)
> Write a {welcome/winback/cross-sell/loyalty} {email/push/SMS} for SALIS users. Segment: {segment}.
> Goal: {goal}. Keep push ≤2 lines; email with subject + preheader + body + CTA. Arabic + English.
> Suggest the trigger and timing.

### 10. Email subject lines
> Generate 15 subject lines for {campaign} to {audience}. Mix curiosity, benefit, urgency, personalized.
> Keep ≤45 chars, mobile-first. Arabic + English. Flag the 3 strongest and why.

### 11. Landing page copy
> Write landing-page copy for {mini-app/campaign}: hero headline + subhead, 3 benefit blocks,
> social proof, FAQ, and primary CTA. Conversion-focused, Arabic + English, RTL-aware.

### 12. Marketing persona / audience analysis
> Build {N} marketing personas for {demand or supply} in KSA/GCC: demographics, jobs-to-be-done,
> pains, channels, objections, and the message that converts each. Include an automotive context
> (vehicle type, garage relationship, fleet size, etc.).

### 13. Sales funnel / GTM
> Design a funnel for {mini-app}: awareness → consideration → conversion → retention → referral.
> For each stage give the channel, message, asset, and metric. Note the supply/demand balance and
> the launch sequence vs. the wave schedule.

### 14. Pitch / one-liner
> Craft a {investor/partner/press} pitch for SALIS: 1-line hook, problem, solution, why-now (KSA
> market + regulation), traction ask. Provide a 30-second and a 2-minute version. Arabic + English.

### 15. Branding & pricing helpers
> Branding: define voice, tone, and 5 messaging pillars for SALIS (trust, speed, transparency,
> local, all-in-one). Pricing: suggest promo/credit/loyalty mechanics for {mini-app} that grow
> both sides without eroding margin; note KSA payment context (mada/STC Pay/Apple Pay).

## Usage notes
- Pick the template, fill the {placeholders}, apply the global context.
- For campaigns, chain templates (persona → funnel → ad copy → subject lines → lifecycle).
- Keep brand voice consistent; hand final assets to `docs-specialist` for the brand library.
