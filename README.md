# cosmodrone

Multiplayer game scaffold with a Vite + React + Tailwind frontend and a RivetKit backend.

## Workspace

- `apps/web` - React client connected to a sample `droneRoom` actor
- `apps/server` - Hono + RivetKit backend exposing `/api/rivet/*`

## Commands

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm format`

## Deployment

- Vercel production deploys run from `.github/workflows/vercel-deploy.yml` and deploy both `apps/web` and `apps/server` as separate Vercel projects
- Rivet managed runner deploys run from `.github/workflows/rivet-deploy.yml` using `rivet-dev/deploy-action@v1`
- PR preview namespaces for Vercel are configured by `.github/workflows/rivet-preview.yml` using `rivet-dev/preview-namespace-action@v1`

### Required GitHub Secrets

- `RIVET_CLOUD_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_WEB_ORG_ID`
- `VERCEL_WEB_PROJECT_ID`
- `VERCEL_SERVER_ORG_ID`
- `VERCEL_SERVER_PROJECT_ID`
- `RIVET_ENDPOINT_PRODUCTION`
- `RIVET_PUBLIC_ENDPOINT_PRODUCTION`

### Notes

- The frontend reads `RIVET_PUBLIC_ENDPOINT` at build time and falls back to `/api/rivet` for local development
- The Docker image for Rivet Cloud runs `pnpm --filter server start:runner`, which starts the actor runner without the local dev HTTP server
- The Hono app is exported from `apps/server/src/app.ts` for Vercel and still runs locally via `apps/server/src/server.ts`
- For local manual Vercel deploys, use `vercel --cwd apps/web` and `vercel --cwd apps/server`
