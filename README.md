# Edverse — New Hire Onboarding

An interactive onboarding academy for our employees. New hires work through
courses of bite-sized, interactive lessons; the team authors content from
reusable blocks and knowledge checks.

Built with **Next.js 16** (App Router) · **React 19** · **Tailwind CSS v4**.
Branding: Edverse blue with Lora (display) + Inter (body).

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

- `/` — landing page with the course list
- `/learn/[courseId]` — the learner experience (pull-out menu, Next/Previous, progress)

## What's here (Phase 1)

The full **learner experience**, driven by a local seed course
(`src/data/sample-course.ts`) so it runs with zero backend setup.

**Content blocks** (`src/components/blocks`)
- Text, Text + Image, Callout, Accordion, Flip cards, Video (YouTube / direct URL / raw embed), Knowledge check

**Interactive quizzes** (`src/components/quiz`) — all self-grading with feedback
- Multiple choice · Multiple answer · True/False · Ordering (drag) · Drag-and-drop categorise · Matching · Fill-the-gap

**Learner runtime** (`src/components/learn`)
- Pull-out left sidebar with module/lesson tree, Next/Previous navigation,
  per-lesson completion + progress bar (persisted to `localStorage`).

The domain model in `src/lib/types.ts` is the single source of truth shared by
the runtime, the (upcoming) authoring UI, and the database schema.

## Roadmap (Phase 2)

- Supabase: Postgres schema for courses/modules/lessons/blocks + auth + storage
- Authoring UI to create/edit courses and quizzes (replacing the seed file)
- Per-user progress + completion records in the database
- Deploy to Vercel

## Branding

The logo is an inline SVG (`src/components/brand/Logo.tsx`). Drop the official
`logo.svg`/`logo.png` into `public/` to swap it in.
