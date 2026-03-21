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

- Vercel production deploys run from `.github/workflows/vercel-deploy.yml` and publish the frontend from `apps/web`
- Rivet managed runner deploys run from `.github/workflows/rivet-deploy.yml` using `rivet-dev/deploy-action@v1`
- PR preview namespaces for Vercel are configured by `.github/workflows/rivet-preview.yml` using `rivet-dev/preview-namespace-action@v1`

### Required GitHub Secrets

- `RIVET_CLOUD_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RIVET_PUBLIC_ENDPOINT_PRODUCTION`

### Notes

- The frontend reads `RIVET_PUBLIC_ENDPOINT` at build time; when not set the endpoint is left empty (RivetKit defaults to the local dev server)
- The Docker image for Rivet Cloud runs `pnpm --filter server start:runner`, which starts the actor runner without the local dev HTTP server
- The single Vercel deployment is the web app; the backend runtime itself deploys to Rivet Cloud
- For local manual Vercel deploys, use `vercel --cwd apps/web`
