# Tokna

AI-powered cloud cost optimization platform.

## Structure

```
tokna/
├── apps/
│   └── web/          # Next.js 14 marketing + dashboard app
└── .github/
    └── workflows/
        └── deploy-web.yml  # Cloud Run deployment
```

## Development

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

Pushes to `main` that touch `apps/web/**` automatically deploy to Cloud Run (`tokna-web`, `us-central1`).

**Required GitHub Secret:** `GOOGLE_CREDENTIALS` — GCP service account JSON with Cloud Run and Artifact Registry access.

## Tech Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Node 20
- Docker + Google Cloud Run
