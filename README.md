# Taxly — AI Tax Assistant for Accountants

![Frontend](https://img.shields.io/badge/frontend-React%2018-blue)
![Language](https://img.shields.io/badge/language-TypeScript-3178C6)
![Backend](https://img.shields.io/badge/backend-Supabase-3ECF8E)
![Hosting](https://img.shields.io/badge/hosting-Netlify-00C7B7)
![Build](https://img.shields.io/badge/build-Vite-646CFF)

Taxly is an AI-powered tax workflow platform built for accountants to reduce manual prep work, centralize client financial data, and surface actionable tax insights.

## Why Taxly
Tax prep teams spend too much time on repetitive work: collecting files, extracting values, validating entries, and monitoring deadlines. Taxly is designed to automate those steps and keep accountants focused on high-value advisory work.

## Core Capabilities
- Document ingestion and processing workflows
- Authenticated client/accountant experiences
- Dashboard analytics and alerts
- Expense and tax calculation modules
- Email integration scaffolding
- AI assistant interface for tax support use cases

## Tech Stack
### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router DOM, Framer Motion, Recharts, Lucide, React Hot Toast

### Backend
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row-Level Security (RLS)
- Supabase Storage-ready architecture

### Deployment
- Netlify (GitHub-connected production deploys)

## Architecture
```text
React + Vite (Client)
        |
        v
Supabase (Auth + Postgres + RLS + Storage)
        |
        v
Analytics / Alerts / Document & Tax Workflows
```

## Repository Structure
```text
Taxly/
├── src/                    # React application (pages, components, services)
├── supabase/
│   └── migrations/         # SQL migrations for schema, RLS, and performance fixes
├── netlify.toml            # Netlify build configuration
├── package.json            # Scripts and dependencies
└── README.md
```

## Local Development
### Prerequisites
- Node.js 18+
- npm 9+

### Install and Run
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## Environment Variables
Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

Note: `VITE_*` values are bundled to the frontend by design.

## Supabase Setup
Run migrations in the Supabase SQL Editor in this order:

1. `supabase/migrations/20251022212436_initial_schema.sql`
2. `supabase/migrations/20251027194201_fix_security_and_performance_issues.sql`

Skip duplicate legacy baseline migrations unless intentionally rebuilding older states.

## Netlify Deployment
Taxly is configured for Netlify deploys from GitHub.

Recommended settings:
- Branch: `main`
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: blank

Set in Netlify environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Current Status
- Frontend is live and deployable from GitHub to Netlify.
- Supabase migrations are available for fresh project setup.
- Some strict TypeScript/lint debt remains and can be resolved iteratively.

## Roadmap
### Phase 1 (Stabilization)
- Resolve strict TypeScript and lint issues
- Normalize migration history and schema references
- Harden auth/profile data model consistency

### Phase 2 (Product Depth)
- Production-grade document/OCR pipeline
- Expanded AI extraction and reasoning workflows
- Stronger email ingestion and parsing automation

### Phase 3 (Scale)
- Multi-accountant workspace features
- Advanced compliance monitoring and predictive insights
- Operational observability and quality analytics

## Contributing
1. Create a feature branch from `main`
2. Implement and test changes locally
3. Open a pull request with a clear summary
4. Ensure build passes before merge

## License
Private/internal project. Update this section if you later open-source Taxly.
