# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Logo.ai — an AI logo generator built with **Next.js 14 (App Router)**, **TypeScript**, and **React 18**. Features a prelaunch landing page with countdown/waitlist, Clerk authentication, a multi-step onboarding wizard that collects brand preferences, AI-powered logo generation via Replicate, and a dashboard to view saved logos. Launch date: March 20, 2026.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build — run before PRs to catch type/route errors
npm start            # Serve production build locally
```

No test runner, linter, or formatter is configured.

## Architecture

### Two main flows

1. **Landing page** (`app/page.tsx`, ~1,180 lines) — Prelaunch marketing page with countdown timer, email waitlist signup, FAQ, and marketing sections. All copy lives in **uppercase config objects** at the top (`HERO`, `WHAT_YOU_GET`, `HOW_IT_WORKS`, `USE_EVERYWHERE`, `WHO_ITS_FOR`, `WHY_JOIN`, `FAQ_ITEMS`, `FINAL_CTA`, `FOOTER`). Edit copy there — don't hard-code text in JSX.

2. **Authenticated app** — After sign-up via Clerk, users go through onboarding then land on the dashboard:
   - `app/onboarding/page.tsx` (~1,930 lines) — 8-step wizard collecting brand name, description, products, tagline, impression words, color palette, and logo type. Each step fetches AI suggestions from `/api/ai-suggest`. Final step generates logos via `/api/ai-logo`.
   - `app/dashboard/page.tsx` — Displays saved logos fetched from `/api/logos`.

### Auth & middleware

- **Clerk** handles all auth (`@clerk/nextjs`). `ClerkProvider` wraps the app in `app/layout.tsx` with a dark theme.
- **`middleware.ts`** — Clerk middleware protects `/dashboard(.*)` and `/onboarding(.*)` routes. Unauthenticated users are redirected to sign-in.
- Auth pages at `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx`.

### API routes

| Route | Purpose |
|---|---|
| `app/api/waitlist/route.ts` | POST (email signup) and GET (waitlist count) — Supabase |
| `app/api/onboarding/route.ts` | POST — saves onboarding profile to `onboarding_profiles` table (upserts by `user_id`) |
| `app/api/ai-suggest/route.ts` | POST — AI suggestions for each onboarding step via Replicate (`anthropic/claude-opus-4.6`) |
| `app/api/ai-logo/route.ts` | POST — generates N logo prompts via Claude Opus 4.6, then renders them with Replicate image models (`google/nano-banana`); saves to Supabase Storage (`logos` bucket) and `logos` table |
| `app/api/logos/route.ts` | GET — fetches user's saved logos from Supabase |

All authenticated API routes use `auth()` from `@clerk/nextjs/server`. All Supabase access uses the service role key (server-only).

### Styling

- **`app/globals.css`** (~2,900 lines) — Complete design system using CSS custom properties. Dark theme (`#050010` background). No Tailwind or CSS modules.
- **`app/layout.tsx`** — Loads 9 Google Fonts via `next/font/google` as CSS variables (`--font-sora`, `--font-dm-sans`, `--font-space-mono`, `--font-playfair`, `--font-oswald`, `--font-comfortaa`, `--font-bebas`, `--font-fredoka`, `--font-ibm-mono`).
- Onboarding and dashboard pages re-declare their own Sora/IBM Plex Mono font instances (client components can't use server-side font variables directly).

### Backend — Supabase tables

- **`waitlist`** — email signups (public landing page)
- **`onboarding_profiles`** — brand preferences per user (keyed by `user_id` from Clerk)
- **`logos`** — saved generated logos with SVG content, colors, and metadata
- **`logos` storage bucket** — stores rendered logo images

### Environment variables (`.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL` — Public Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only secret; never prefix with `NEXT_PUBLIC_`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk public key
- `CLERK_SECRET_KEY` — Clerk server secret
- `REPLICATE_API_TOKEN` — Replicate API key for AI suggestions and logo generation

### Static pages

`app/about/page.tsx`, `app/press/page.tsx`, `app/privacy/page.tsx` — standalone informational pages with their own layouts.

## Code Conventions

- TypeScript React function components, `"use client"` directive on interactive pages
- Two-space indentation, double quotes, trailing commas in multi-line objects
- `const` for component-level data, camelCase variables, PascalCase components
- Path alias `@/*` maps to project root (configured in `tsconfig.json`)
- CSS custom properties in `globals.css`; no Tailwind or CSS modules
- New UI elements go in `components/` and get imported into pages
- Commit style: imperative, scope-prefixed (e.g., `feat: refresh hero gradient`, `fix: gate countdown timer`), first line under 72 chars
