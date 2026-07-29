# AnalyticSaaS — AnalyticProject

Next.js application for the AnalyticSaaS MVP (AI-assisted micro-SaaS idea discovery).

Product requirements and architecture live in the repo root: [`../docs/`](../docs/).

## Prerequisites

- Node.js 20+
- npm or pnpm

## Setup

```bash
npm ci
cp .env.example .env.local   # optional until F0-02 (Prisma)
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Dev server at [http://localhost:3010](http://localhost:3010) |
| `npm run build` | Production build |
| `npm run start` | Start production server on port 3010 |
| `npm test` | Vitest unit/smoke tests |
| `npm run lint` | ESLint |

```bash
npm run lint && npm test && npm run build
npm run dev
```

Health check (with dev server running):

```bash
curl -s http://localhost:3010/api/health
# {"ok":true}
```

## Project structure

```
AnalyticProject/
├── src/
│   ├── app/           # App Router pages and API routes
│   │   └── api/health/  # GET /api/health
│   ├── domain/        # Domain logic (from F4)
│   └── lib/           # Shared utilities
├── .env.example
├── eslint.config.mjs
├── vitest.config.ts
└── package.json
```

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Vitest for tests
- Prisma + PostgreSQL (F0-02+)

## Documentation

- [Architecture](../docs/ARCHITECTURE.md)
- [API contract](../docs/API.md)
- [Roadmap](../docs/ROADMAP.md)
- [MVP scope](../docs/MVP_SCOPE.md)
