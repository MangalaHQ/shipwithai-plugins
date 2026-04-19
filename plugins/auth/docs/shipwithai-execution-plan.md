# ShipWithAI Skills Kit — Full Execution Plan

> Author: Ethan | Date: 2026-02-25
> Status: Draft v1.0 — Product Blueprint + Marketing & Launch Plan
> Companion doc: `shipwithai-product-strategy.md`

---

## PART 1: PRODUCT BLUEPRINT

---

### 1.1 SKILL.md Format — Standard You Need to Follow

Each skill consists of 1 folder containing a `SKILL.md` file + accompanying resources. Standard format:

```yaml
---
name: skill-name              # Required. Lowercase, use hyphens. Max 64 characters
description: Short description # Required. Max 200 characters. Determines when Claude activates skill
license: MIT                   # Optional
version: 1.0.0                 # Optional
---

# Skill Name

## Purpose (2-3 sentences)

## Usage Guide

## Examples

## Additional Reference
- See `references/detailed-guide.md` for detailed guide
```

**Important rules:**

| Rule | Details |
|------|---------|
| SKILL.md max 150 lines | Detailed parts move to `references/` |
| Each reference file max 150 lines | Split if longer |
| Description determines auto-trigger | Write specific use cases, not generic |
| Progressive disclosure | Only load context when needed |
| Write concisely, imperative | "Do X" instead of "You should consider doing X" |

**Standard directory structure for 1 skill:**

```
auth-setup/
├── SKILL.md                  # Main file (< 150 lines)
├── references/               # Detailed docs, load on-demand
│   ├── better-auth-guide.md
│   ├── clerk-guide.md
│   └── common-patterns.md
├── scripts/                  # Executable code (not loaded into context)
│   ├── setup-auth.ts
│   └── setup-auth.test.ts
└── assets/                   # Templates, output files
    ├── auth-schema.prisma
    └── middleware-template.ts
```

---

### 1.2 Skills List — Detailed for Each

#### TIER 1: Starter Kit ($49) — 8 Skills

---

**SKILL #1: auth-setup** ⭐ First build (from money tracking app)

```yaml
---
name: auth-setup
description: Set up authentication from scratch. Supports Better Auth, Clerk, Auth.js. Handles social login, email verification, session management, middleware, role-based access. Use for any new project needing user auth.
version: 1.0.0
---
```

| Item | Details |
|------|---------|
| **Purpose** | Complete auth setup for new project in < 30 minutes |
| **Input from user** | "Set up auth for my Next.js app with Google + GitHub login" |
| **Output** | Auth config, schema, middleware, login/register pages, protected routes |
| **Time saved** | 1-2 days → 30 minutes |

**SKILL.md needs to cover:**
1. Ask user to choose provider (Better Auth / Clerk / Auth.js)
2. Ask which social logins needed (Google, GitHub, Discord...)
3. Setup database schema for users/sessions/accounts
4. Create middleware to protect routes
5. Create login/register UI components
6. Setup email verification flow
7. Configure environment variables

**References to write:**
- `references/better-auth-guide.md` — Step-by-step for Better Auth
- `references/clerk-guide.md` — Step-by-step for Clerk
- `references/authjs-guide.md` — Step-by-step for Auth.js
- `references/common-patterns.md` — Protected routes, RBAC, session refresh

**Assets to prepare:**
- `assets/schema-prisma.template` — Prisma schema template
- `assets/schema-drizzle.template` — Drizzle schema template
- `assets/middleware.template.ts` — Middleware template

**Acceptance criteria:**
- [ ] Claude can setup complete auth in 1 conversation
- [ ] Supports at least 2 auth providers
- [ ] Includes social login, email verify, protected routes
- [ ] Works with Next.js App Router
- [ ] User doesn't need to read external docs

---

**SKILL #2: database-setup**

```yaml
---
name: database-setup
description: Initialize database with ORM setup, schema design, migrations, and seeding. Supports Drizzle ORM and Prisma. Handles PostgreSQL, MySQL, SQLite. Use for new projects needing database configuration.
version: 1.0.0
---
```

| Item | Details |
|------|---------|
| **Purpose** | Setup database + ORM + migration in 15 minutes |
| **Input** | "Set up PostgreSQL with Drizzle for my SaaS app" |
| **Output** | ORM config, schema files, migration scripts, seed data |
| **Time saved** | 4-8 hours → 15 minutes |

**SKILL.md needs to cover:**
1. Ask for ORM (Drizzle / Prisma) + database (Postgres / MySQL / SQLite)
2. Create connection config + env vars
3. Design schema based on app type (SaaS, e-commerce, blog...)
4. Setup migration workflow
5. Create seed script for development
6. Setup database client singleton

**References:**
- `references/drizzle-patterns.md` — Common Drizzle patterns, relations, queries
- `references/prisma-patterns.md` — Prisma-specific patterns
- `references/schema-templates.md` — Pre-built schemas for SaaS, e-commerce, blog

**Acceptance criteria:**
- [ ] Schema + migration runs successfully after setup
- [ ] Seed data populates for dev environment
- [ ] Supports both Drizzle and Prisma

---

**SKILL #3: payment-integration**

```yaml
---
name: payment-integration
description: Integrate payment processing with Stripe, Polar, or Lemon Squeezy. Handles checkout sessions, webhooks, subscriptions, one-time payments, customer portal. Use when adding billing to any app.
version: 1.0.0
---
```

| Item | Details |
|------|---------|
| **Purpose** | Complete payment integration with webhook verification |
| **Input** | "Add Stripe subscription billing to my SaaS" |
| **Output** | Checkout flow, webhook handler, subscription management, customer portal |
| **Time saved** | 1-2 days → 45 minutes |

**SKILL.md needs to cover:**
1. Ask for provider (Stripe / Polar / Lemon Squeezy)
2. Ask for model (subscription / one-time / usage-based)
3. Setup checkout session creation
4. Webhook endpoint + signature verification
5. Subscription lifecycle (create, update, cancel, resume)
6. Customer portal / billing management
7. Pricing table component

**References:**
- `references/stripe-guide.md` — Stripe-specific flows
- `references/polar-guide.md` — Polar setup + webhooks
- `references/lemon-squeezy-guide.md` — Lemon Squeezy integration
- `references/webhook-patterns.md` — Idempotency, retry handling, error recovery

**Acceptance criteria:**
- [ ] Checkout → payment → webhook → database update works end-to-end
- [ ] Webhook has signature verification
- [ ] Subscription cancel/resume works

---

**SKILL #4: landing-page**

```yaml
---
name: landing-page
description: Generate high-converting landing pages with hero, features, pricing, testimonials, FAQ, and CTA sections. Supports Next.js, React, HTML. Optimized for conversion and SEO. Use when creating marketing pages.
version: 1.0.0
---
```

| Item | Details |
|------|---------|
| **Purpose** | Generate beautiful, conversion-optimized landing page in 20 minutes |
| **Input** | "Create a landing page for my AI writing tool, target indie hackers" |
| **Output** | Full landing page with hero, features, pricing, testimonials, CTA |
| **Time saved** | 4-8 hours → 20 minutes |

**SKILL.md needs to cover:**
1. Ask for product name, tagline, target audience
2. Ask for needed sections (hero, features, pricing, testimonials, FAQ, CTA)
3. Generate copy for each section (based on target audience)
4. Responsive design (mobile-first)
5. Dark/light mode support
6. SEO meta tags, Open Graph

**References:**
- `references/copy-formulas.md` — Conversion copywriting patterns (PAS, AIDA, BAB)
- `references/section-templates.md` — Template for each section type

**Assets:**
- `assets/landing-tailwind.template` — Tailwind CSS landing template
- `assets/landing-shadcn.template` — shadcn/ui landing template

**Acceptance criteria:**
- [ ] Landing page renders immediately, responsive
- [ ] Copy matches target audience
- [ ] Has interactive pricing table

---

**SKILL #5: email-setup**

```yaml
---
name: email-setup
description: Configure transactional and marketing emails with Resend or Plunk. Create email templates, verification flows, welcome sequences, notification systems. Use when adding email to any app.
version: 1.0.0
---
```

| Item | Details |
|------|---------|
| **Purpose** | Setup complete email system for app |
| **Input** | "Set up transactional emails with Resend for my SaaS" |
| **Output** | Email client config, templates (welcome, verify, reset, invoice), sending functions |
| **Time saved** | 3-5 hours → 15 minutes |

**SKILL.md needs to cover:**
1. Ask for provider (Resend / Plunk)
2. Setup email client + API key
3. Create React Email templates (welcome, verify, password reset, invoice)
4. Helper functions for sending emails
5. Domain verification instructions

**References:**
- `references/resend-guide.md` — Resend API patterns
- `references/email-templates.md` — Template gallery

**Acceptance criteria:**
- [ ] Can send email from app immediately after setup
- [ ] Has at least 4 email templates
- [ ] Templates use React Email, render beautifully

---

**SKILL #6: deploy-production**

```yaml
---
name: deploy-production
description: Deploy applications to Vercel, Cloudflare Pages, or Railway. Handles environment variables, domain setup, CI/CD, preview deployments. Use when deploying any web app to production.
version: 1.0.0
---
```

| Item | Details |
|------|---------|
| **Purpose** | Deploy app to production in 10 minutes |
| **Input** | "Deploy my Next.js app to Vercel with custom domain" |
| **Output** | Deploy config, env vars setup, domain config, CI/CD pipeline |
| **Time saved** | 2-4 hours → 10 minutes |

**SKILL.md needs to cover:**
1. Ask for platform (Vercel / Cloudflare / Railway)
2. Create deploy config (vercel.json / wrangler.toml)
3. Setup environment variables
4. Custom domain + SSL
5. Preview deployments for PRs
6. Basic CI/CD with GitHub Actions

**References:**
- `references/vercel-guide.md`
- `references/cloudflare-guide.md`
- `references/railway-guide.md`

**Acceptance criteria:**
- [ ] App deploys successfully to production
- [ ] Custom domain works
- [ ] Preview deploy for each PR

---

**SKILL #7: seo-analytics**

```yaml
---
name: seo-analytics
description: Set up SEO optimization and analytics tracking. Handles meta tags, sitemap, robots.txt, Open Graph, structured data, PostHog/Plausible analytics. Use when launching any public-facing app.
version: 1.0.0
---
```

| Item | Details |
|------|---------|
| **Purpose** | SEO + analytics setup for newly launched app |
| **Input** | "Add SEO and PostHog analytics to my Next.js app" |
| **Output** | Meta tags, sitemap, robots.txt, OG images, analytics integration |
| **Time saved** | 2-3 hours → 15 minutes |

**SKILL.md needs to cover:**
1. Dynamic meta tags per page
2. Auto-generated sitemap.xml
3. robots.txt configuration
4. Open Graph + Twitter Card meta
5. JSON-LD structured data
6. PostHog or Plausible analytics setup
7. Core Web Vitals monitoring

**Acceptance criteria:**
- [ ] Lighthouse SEO score > 90
- [ ] Analytics tracking works
- [ ] Sitemap auto-generates

---

**SKILL #8: ship-saas-workflow**

```yaml
---
name: ship-saas-workflow
description: Complete workflow orchestrating all skills to ship a SaaS from idea to production. Coordinates auth, database, payment, landing page, email, deploy, and SEO setup. Use when starting a new SaaS project from scratch.
version: 1.0.0
---
```

| Item | Details |
|------|---------|
| **Purpose** | Orchestrate all skills to ship SaaS from zero |
| **Input** | "I want to build a SaaS for X. Help me ship it." |
| **Output** | Full project setup: auth + db + payment + landing + email + deploy + SEO |
| **Time saved** | 5-7 days → 2-3 hours |

**SKILL.md needs to cover:**
1. Interview user: What does your SaaS do? Target audience? Pricing model?
2. Suggest tech stack based on requirements
3. Orchestrate each skill in order: database → auth → core features → payment → email → landing → SEO → deploy
4. Final checklist before launch
5. Post-launch monitoring setup

This is the **hero skill** — encompasses all, creates "wow moment" for user.

**Acceptance criteria:**
- [ ] User says "build me a SaaS for X" → Claude self-orchestrates entirely
- [ ] Each step calls correct sub-skill
- [ ] Finally has complete deployable app

---

#### TIER 2: Pro Kit ($99) — 7 Additional Skills

| # | Skill | Short Description | Build after Tier 1 |
|---|-------|------|-----|
| 9 | `admin-dashboard` | Generate admin panel: CRUD, user management, analytics charts | Week 5-6 |
| 10 | `api-design` | RESTful/tRPC API scaffolding, validation, docs (Swagger) | Week 5-6 |
| 11 | `testing-cicd` | Vitest/Playwright setup, GitHub Actions CI/CD pipeline | Week 6-7 |
| 12 | `monitoring-alerts` | Sentry error tracking, LogSnag events, uptime monitoring | Week 6-7 |
| 13 | `multi-project-reuse` | Package config/components → reuse across projects | Week 7 |
| 14 | `ai-integration` | Add AI features (OpenAI/Claude API, streaming, RAG basic) | Week 7-8 |
| 15 | `saas-agents` | 3 pre-built agents: Planner, Code Reviewer, Deployer | Week 8 |

Each Tier 2 skill will be detailed similarly to Tier 1 when build begins.

---

### 1.3 Kit Structure — Complete Directory Structure

```
shipwithai-starter-kit/
├── install.sh                          # Auto-install (Linux/macOS)
├── install.ps1                         # Auto-install (Windows)
├── README.md                           # Getting started (< 100 lines)
├── LICENSE                             # License file
├── CHANGELOG.md                        # Version history
│
├── skills/
│   ├── auth-setup/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   ├── better-auth-guide.md
│   │   │   ├── clerk-guide.md
│   │   │   ├── authjs-guide.md
│   │   │   └── common-patterns.md
│   │   ├── scripts/
│   │   │   └── verify-auth-setup.ts
│   │   └── assets/
│   │       ├── schema-prisma.template
│   │       ├── schema-drizzle.template
│   │       └── middleware.template.ts
│   │
│   ├── database-setup/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── assets/
│   │
│   ├── payment-integration/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── assets/
│   │
│   ├── landing-page/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── assets/
│   │
│   ├── email-setup/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── assets/
│   │
│   ├── deploy-production/
│   │   ├── SKILL.md
│   │   └── references/
│   │
│   ├── seo-analytics/
│   │   ├── SKILL.md
│   │   └── references/
│   │
│   └── ship-saas-workflow/             # Hero skill — orchestrates all
│       ├── SKILL.md
│       └── references/
│           └── launch-checklist.md
│
├── agents/                             # (Pro Kit only)
│   ├── planner.md
│   ├── reviewer.md
│   └── deployer.md
│
└── workflows/                          # (Pro Kit only)
    └── full-stack-ship.md
```

---

### 1.4 Build Order — Order to Build Each Skill

Order based on dependencies and value:

```
Week 1:
  Day 1-2: auth-setup        ← You already have code from money tracking app
  Day 3:   database-setup    ← Auth depends on DB, build consecutively
  Day 4-5: payment-integration

Week 2:
  Day 1-2: landing-page + email-setup
  Day 3:   deploy-production + seo-analytics
  Day 4-5: ship-saas-workflow (orchestrator) + testing everything

Week 3:
  Day 1-2: Test entire kit on real project (example: build new micro-SaaS)
  Day 3:   Fix bugs, polish, write README
  Day 4-5: Package kit, setup delivery
```

**Principle: Each skill must be tested on real project before shipping.**

---

### 1.5 Quality Checklist — For Each Skill Before Shipping

- [ ] SKILL.md < 150 lines
- [ ] Description < 200 characters, specific
- [ ] Each reference file < 150 lines
- [ ] Test on real project (not just demo)
- [ ] Claude understands instructions without user needing to explain further
- [ ] Works with Next.js App Router (primary framework)
- [ ] Env vars have `.env.example`
- [ ] No broken references/links
- [ ] Dogfood: you use this skill for next project

---

## PART 2: MARKETING & LAUNCH PLAN

---

### 2.1 Payment & Delivery Setup

**Platform: Polar (recommended instead of Lemon Squeezy)**

| Criteria | Polar | Lemon Squeezy |
|----------|-------|---------------|
| Fee | 4% + $0.40 | 5% + $0.50 |
| MoR (tax compliance) | Yes | Yes |
| Developer-focused | Very good | Average |
| GitHub integration | Native | No |
| Stability (2026) | Stable | Transitioning to Stripe, has reported issues |
| Setup time | 15-30 min | 15-30 min |

**Why choose Polar:** Lower fees, developer-focused (right target audience), GitHub native integration (buyer can link GitHub account), not affected by Stripe acquisition transition.

**Alternative:** If you want to be safe, use Lemon Squeezy — proven with TypingMind ($1M+ revenue).

**Setup checklist:**
- [ ] Create Polar/Lemon Squeezy account
- [ ] Create 2 products: Starter Kit ($49), Pro Kit ($99)
- [ ] Setup discount code: `EARLYBIRD` (50% off, limit 50 uses)
- [ ] Setup webhook → auto-deliver download link
- [ ] Test checkout flow end-to-end
- [ ] Create "combo" product: Starter + Pro = $129 (save $19)

**Delivery method:**
- Option A: GitHub private repo → buyer receives invite after purchase (recommended)
- Option B: Download link (zip file) via Polar/Lemon Squeezy
- Option C: Both — GitHub repo + zip backup

---

### 2.2 Landing Page — shipwithai.io/kit

**Page structure:**

```
1. HERO
   Headline: "Ship Your SaaS in Hours, Not Weeks"
   Subhead: "8 battle-tested Claude Code skills that handle auth, payments,
             database, deploy — so you can focus on what makes your app unique."
   CTA: "Get the Kit — $49" (primary) | "See what's inside" (secondary)
   Social proof: "Used by X developers" | "Saves 5-7 days per project"

2. PROBLEM
   "Every new project = same 2-3 days of setup hell"
   - Auth: OAuth, email verify, sessions, middleware... again
   - Payment: Stripe webhooks, subscription logic... again
   - Deploy: CI/CD, env vars, domain, SSL... again

3. SOLUTION — WHAT'S INSIDE
   Grid of 8 skills with icons:
   - Auth Setup (1-2 days → 30 min)
   - Database Setup (4-8 hrs → 15 min)
   - Payment Integration (1-2 days → 45 min)
   - Landing Page (4-8 hrs → 20 min)
   - Email Setup (3-5 hrs → 15 min)
   - Deploy to Production (2-4 hrs → 10 min)
   - SEO + Analytics (2-3 hrs → 15 min)
   - Ship SaaS Workflow (orchestrates all)

4. DEMO
   Embedded video (2-3 min): "Watch me ship a SaaS from scratch"
   Or GIF animation showing workflow

5. PRICING
   Two columns:
   | Starter Kit $49     | Pro Kit $99              |
   | 8 core skills       | 15 skills + 3 agents     |
   | Auth, DB, Payment...| + Admin, API, Testing... |
   | Lifetime updates    | Lifetime updates         |
   | Community access    | Priority support         |

6. FAQ
   - "What is a Claude Code skill?"
   - "Do I need Claude Max?"
   - "What frameworks are supported?"
   - "Can I use this for commercial projects?"
   - "What if it doesn't work for me?" (30-day refund)

7. FINAL CTA
   "Stop wasting days on setup. Start shipping."
   [Get the Kit — $49]
```

---

### 2.3 X/Twitter Content Strategy

**Account setup:**
- Handle: @shipwithai (or @ethancodes or similar)
- Bio: "Building tools to help you ship SaaS faster with AI. Creator of ShipWithAI Kit."
- Pinned tweet: Kit launch tweet

**Content calendar — 8 weeks:**

| Week | Topic | Example tweets |
|------|-------|---|
| 1-2 | Build in public: auth skill | "Day 1: Packaging my auth setup into a Claude Code skill. It took me 2 days to build auth for my money tracker. Goal: make it 30 minutes for everyone." |
| 3 | Build in public: payment + db | "Just finished the payment-integration skill. Stripe checkout + webhooks + subscription management. Claude handles it all in 45 min." |
| 4 | Kit preview + teaser | "8 skills. 5-7 days saved per project. Launching next week. Drop a 🔥 if you want early access." |
| 5 | LAUNCH | "ShipWithAI Kit is live! 8 Claude Code skills to ship your SaaS in hours. $49 one-time. Early bird: 50% off for first 50 buyers." |
| 6 | Social proof + tips | Share customer feedback, tips using each skill |
| 7 | Content marketing | Thread: "How I ship a SaaS from zero in 2 hours (step by step)" |
| 8 | Product Hunt prep | Teaser for PH launch |

**Most effective tweet formats for dev tools:**
- Before/after comparisons: "Auth setup: 2 days → 30 minutes"
- Screen recordings (GIF/video): Show Claude using your skill
- Code snippets: Interesting patterns in your skills
- Revenue/metrics sharing: Build in public numbers
- Threads: Deep dives into each skill

**Daily engagement routine (15 min/day):**
- Reply to 5-10 tweets in #ClaudeCode #IndieHackers
- Quote tweet 1-2 relevant posts
- Like/bookmark 10-20 posts from target audience

---

### 2.4 Blog Content — shipwithai.io/blog

**Write 6 blog posts in 8 weeks:**

| # | Title | SEO keyword | When |
|---|-------|-------------|------|
| 1 | "How I Set Up Auth in 30 Minutes with Claude Code" | claude code auth setup | Week 3 |
| 2 | "The 5 Skills Every Claude Code User Needs" | claude code skills essential | Week 4 |
| 3 | "Claude Code vs Manual Setup: Auth, Payment, Deploy Compared" | claude code vs manual | Week 5 |
| 4 | "I Shipped a SaaS in 2 Hours — Here's the Exact Workflow" | ship saas fast ai | Week 6 |
| 5 | "Why One-Time Payment Beats Subscription for Dev Tools" | dev tools pricing | Week 7 |
| 6 | "Behind the Scenes: Building ShipWithAI Kit (Revenue, Lessons)" | build in public revenue | Week 8 |

Each post: 1,000-1,500 words, includes CTA linking to kit, has screenshots/GIFs.

---

### 2.5 Marketplace Submission

**Starting weeks 1-2 (free skills):**

| Marketplace | How to submit | Link |
|-------------|---|---|
| SkillsMP | Submit form on website | skillsmp.com |
| BuildWithClaude | GitHub PR or form | buildwithclaude.com |
| Anthropic Official | GitHub PR (must meet quality bar) | github.com/anthropics/claude-plugins-official |
| AgentSkills.in | Submit form | agentskills.in |
| Claude Marketplaces | Submit form | claudemarketplaces.com |

**Strategy:** Publish 3 skills free (auth-setup basic, database-setup basic, seo-analytics). Each free skill has note: "This is the free version. Get the full kit with 8 skills at shipwithai.io/kit".

---

### 2.6 Product Hunt Launch

**Timeline: Week 8-10 (after 20-30 sales + testimonials)**

**4 weeks before launch:**
- [ ] Create "Coming Soon" page on Product Hunt
- [ ] Collect emails from interested people
- [ ] Find hunter with reputation (or launch yourself)
- [ ] Prepare assets: logo, screenshots, GIF demo, 2-min video

**1 week before:**
- [ ] Finalize tagline (< 60 characters): "Ship your SaaS in hours with Claude Code skills"
- [ ] Prepare maker comment (first comment explaining why you built this)
- [ ] Schedule social media posts for launch day
- [ ] Email list notification
- [ ] Choose launch day: Tuesday, Wednesday or Thursday

**Launch day:**
- [ ] Launch 00:01 PST (to get full 24h)
- [ ] Post maker comment immediately
- [ ] Share on X/Twitter, LinkedIn, Indie Hackers, Reddit
- [ ] Reply to every comment in first 3 hours (critical for algorithm)
- [ ] DO NOT ask directly for upvotes — PH algorithm detects this

**After launch:**
- [ ] Thank you email to supporters
- [ ] Offer limited-time deal for PH visitors
- [ ] Write recap blog post
- [ ] Share metrics (traffic, sales, lessons learned)

**Target: Top 5 Product of the Day.** Need ~200-350 upvotes. Focus on authentic engagement, no gaming.

---

### 2.7 Alternative Launch Platforms

Beyond Product Hunt, submit to:

| Platform | URL | Cost | Audience |
|----------|-----|------|----------|
| OpenHunts | openhunts.com | Free | Indie hackers, 14.3% conversion rate |
| BetaList | betalist.com | Free/$129 | Early adopters |
| Indie Hackers | indiehackers.com/products | Free | Solo founders |
| Hacker News (Show HN) | news.ycombinator.com | Free | Technical audience |
| Dev.to | dev.to | Free | Developers |
| Reddit r/SideProject | reddit.com/r/SideProject | Free | Side project builders |
| Reddit r/ClaudeAI | reddit.com/r/ClaudeAI | Free | Claude users |

---

## PART 3: CONSOLIDATED TIMELINE — 10 WEEKS

```
WEEK 1 ─────────────────────────────────────────────────
  ├── Day 1-2: Build auth-setup skill (from money tracking app)
  ├── Day 3:   Build database-setup skill
  ├── Day 4-5: Build payment-integration skill
  ├── Daily:   Tweet build progress (start X/Twitter presence)
  └── End:     Publish 1-2 free skills to marketplaces

WEEK 2 ─────────────────────────────────────────────────
  ├── Day 1:   Build landing-page skill
  ├── Day 2:   Build email-setup skill
  ├── Day 3:   Build deploy-production + seo-analytics skills
  ├── Day 4-5: Build ship-saas-workflow (orchestrator)
  └── Daily:   Tweet build progress

WEEK 3 ─────────────────────────────────────────────────
  ├── Day 1-3: TEST entire kit on real new project
  │            (example: build new micro-SaaS from scratch using kit)
  ├── Day 4:   Fix bugs, polish, write README
  ├── Day 5:   Record demo video (2-3 min)
  ├── Blog:    Publish post #1 "Auth in 30 Minutes"
  └── Submit:  3 free skills to all marketplaces

WEEK 4 ─────────────────────────────────────────────────
  ├── Day 1-2: Setup Polar/Lemon Squeezy + checkout
  ├── Day 3:   Build landing page at shipwithai.io/kit
  ├── Day 4-5: Test purchase flow end-to-end
  ├── Blog:    Publish post #2 "5 Essential Skills"
  └── Twitter: Teaser tweets, countdown to launch

WEEK 5 ─────────────────────────────────────────────────
  ├── LAUNCH WEEK
  ├── Day 1:   Soft launch on X/Twitter
  ├── Day 2:   Post on Indie Hackers, Reddit
  ├── Day 3-5: Engage, reply comments, collect feedback
  ├── Blog:    Publish post #3 "Claude Code vs Manual"
  ├── Promo:   EARLYBIRD 50% off (limit 50 buyers)
  └── Goal:    10-20 first sales

WEEK 6-7 ───────────────────────────────────────────────
  ├── Iterate based on customer feedback
  ├── Fix issues, improve skills
  ├── Start building Tier 2 skills (Pro Kit)
  ├── Collect testimonials from early buyers
  ├── Blog:    Publish posts #4, #5
  ├── Twitter: Share customer stories, tips
  └── Goal:    30-50 total sales

WEEK 8 ─────────────────────────────────────────────────
  ├── Launch Pro Kit ($99)
  ├── Blog:    Publish post #6 "Behind the Scenes"
  └── Prep:    Product Hunt launch assets

WEEK 9-10 ──────────────────────────────────────────────
  ├── Product Hunt launch
  ├── Submit to OpenHunts, BetaList, Hacker News
  ├── Post-launch engagement
  └── Goal:    50-100 total sales, $3k-5k total revenue
```

---

## PART 4: FINANCIAL SUMMARY

### Startup costs: ~$0

| Item | Cost | Note |
|------|------|------|
| Polar/Lemon Squeezy | Free | Only pay fee on sale |
| shipwithai.io hosting | Already have | Existing infrastructure |
| Domain | Already have | shipwithai.io |
| Claude Code subscription | Already have | You already use |
| Demo video recording | Free | OBS/Loom free |
| Product Hunt launch | Free | No fee required |

### Revenue Targets

| Milestone | When | Revenue |
|-----------|------|---------|
| First sale | Week 5 | $25 (earlybird) |
| 50 sales | Week 7-8 | ~$2,000-3,000 |
| 100 sales | Week 10-12 | ~$5,000-7,000 |
| $5k MRR equivalent | Month 4-5 | Sustainable income |

### Revenue per sale (after fees)

| Tier | Price | Polar fee (4%+$0.40) | Net |
|------|-------|----------------------|-----|
| Starter Kit | $49 | ~$2.36 | $46.64 |
| Pro Kit | $99 | ~$4.36 | $94.64 |
| Combo | $129 | ~$5.56 | $123.44 |

---

## Questions to Decide Before Starting

1. **Which auth provider is default?** Better Auth (you already used for money tracking) or Clerk?
2. **Framework focus:** Next.js App Router only, or support Nuxt/SvelteKit too?
3. **Checkout platform:** Polar or Lemon Squeezy?
4. **Delivery:** GitHub private repo or download zip?
5. **X/Twitter handle:** @shipwithai or different handle?
6. **Target launch date:** Which week do you want soft launch?
7. **Earlybird pricing:** 50% off ($25) for first 50 people, OK?

---

*Next step: Answer 7 questions above → Start building auth-setup skill (Day 1)*
