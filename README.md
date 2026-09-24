# Studyfold

Upload a PDF — a lecture handout, a textbook chapter, an article — and get back:

- **Study notes**, organized into sections
- **Flashcards** (front/back) you can flip through
- A **multiple-choice quiz** that scores itself

Built with Next.js (App Router) + TypeScript, Tailwind CSS v4, `pdf-parse` for text
extraction, and the Anthropic API (Claude) to generate the study materials.

## How it works

1. The frontend (`app/page.tsx`) sends the uploaded PDF to `POST /api/generate` as
   multipart form data.
2. The API route (`app/api/generate/route.ts`) extracts the PDF's text with
   `pdf-parse`, sends that text to Claude with a system prompt that forces a strict
   JSON response, validates the shape of what comes back, and returns it.
3. The frontend renders the result in a tabbed dashboard
   (`components/ResultsPanel.tsx` + `NotesView` / `FlashcardsView` / `QuizView`).

All the "knobs" you're likely to want to change — which Claude model is used, file
size limits, how much extracted text gets sent to the model — live in one file:
`lib/constants.ts`.

## Project structure

```
app/
  api/generate/route.ts   # backend: PDF -> text -> Claude -> validated JSON
  layout.tsx              # fonts + metadata
  page.tsx                # upload -> loading -> results state machine
  globals.css             # design tokens (colors/fonts) + a few custom bits
components/
  UploadZone.tsx          # drag-and-drop file picker
  ResultsPanel.tsx         # folder-tab switcher (Notes / Flashcards / Quiz)
  NotesView.tsx            # renders the AI's Markdown notes
  FlashcardsView.tsx       # flip cards + prev/next
  QuizView.tsx              # one-question-at-a-time MCQ + scoring
lib/
  types.ts                # shared TypeScript types for the AI's JSON output
  constants.ts            # model name + size/length limits
```

## Prerequisites

- Node.js 20.9 or newer
- An Anthropic API key: https://console.anthropic.com/settings/keys (new accounts
  get a small free credit grant; beyond that this uses pay-as-you-go billing)
- A free GitHub account and a free Vercel account, for deployment

## 1. Run it locally

```bash
# from inside the project folder
npm install
cp .env.local.example .env.local
# now open .env.local and paste in your real key
npm run dev
```

Open http://localhost:3000 and upload a PDF.

### Environment variables

Only one is required, in `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Never commit `.env.local` — it's already listed in `.gitignore`.

## 2. Push it to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Studyfold"
```

Then create a new, empty repository on GitHub (github.com → **New repository** —
don't initialize it with a README, since you already have one), and:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

## 3. Deploy on Vercel (free tier)

1. Go to https://vercel.com and sign in (GitHub sign-in is easiest).
2. Click **Add New… → Project**, then **Import** the GitHub repo you just pushed.
   Vercel auto-detects Next.js — you don't need to change any build settings.
3. Before clicking Deploy, open **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your real key
4. Click **Deploy**. After the build finishes you'll get a live `*.vercel.app` URL.

Every future `git push` to `main` automatically redeploys.

## Limits to know about

- **File size**: capped at 4 MB (`MAX_FILE_SIZE_BYTES` in `lib/constants.ts`).
  Serverless hosts — Vercel included — cap request bodies on their free/hobby
  tiers (around 4.5 MB), so this stays safely under that. If you're on a paid
  plan with a higher limit, you can raise this constant.
- **Scanned/image-only PDFs won't work.** Text extraction needs a real text
  layer; a PDF that's just photographed/scanned pages has none. Adding OCR
  (e.g. Tesseract.js) is a natural next step if you need this.
- **Very long documents get truncated** to the first ~100,000 characters
  (`MAX_EXTRACT_CHARS`) before being sent to Claude, to keep cost and response
  time predictable. The UI tells the user when this happened.
- **Generation can take 20–60 seconds** for longer documents. Vercel's Hobby
  plan defaults to a 10-second function timeout unless you enable Fluid
  Compute (Vercel's dashboard will prompt you, or see
  [Vercel's function duration docs](https://vercel.com/docs/functions/configuring-functions/duration)) — the route
  already sets `maxDuration = 60` in `app/api/generate/route.ts`, but your plan's
  ceiling wins if it's lower.
- **No auth, no rate limiting, no persistence.** Nothing is saved after you
  leave the page — every upload is a fresh, stateless request. Fine for
  personal/demo use; add auth and a rate limiter before sharing a link
  publicly, or people could run up your Anthropic bill.

## Troubleshooting

- **"Server is missing an ANTHROPIC_API_KEY"** — you haven't set the env var
  (locally in `.env.local`, or in Vercel's Project Settings → Environment
  Variables), or you forgot to restart `npm run dev` after adding it.
- **"Setting up fake worker failed" / PDF parsing errors** — `pdf-parse` (v2)
  relies on a `pdf.js` worker that bundlers like Next.js's Turbopack/Webpack
  can't always resolve automatically. This project already includes the fix
  (`import "pdf-parse/worker"` at the top of `route.ts`, plus
  `serverExternalPackages` in `next.config.ts`) — if you see this error after
  modifying those files, check they're still in place. Full details:
  [pdf-parse troubleshooting guide](https://github.com/mehmet-kozan/pdf-parse/blob/main/docs/troubleshooting.md).
- **429 / rate limited** — you've hit Anthropic's rate limits for your account
  tier; wait a moment and retry, or check your usage at
  https://console.anthropic.com.

## Ideas for extending this

- OCR fallback for scanned PDFs (e.g. Tesseract.js)
- Stream Claude's response so the UI can show real progress instead of staged
  fake-progress messages
- Let students export flashcards to Anki, or notes to PDF/Markdown download
- Save results (e.g. in Postgres/Supabase) so a link can be revisited later
- Basic auth + per-user rate limiting before making this a public multi-user
  product
