# Build context must be the repo root (`docker build -f apps/web/Dockerfile .`),
# not apps/web — this is an npm workspaces monorepo, so the lockfile lives at
# the root and apps/web imports @agridealer/contracts, which has to be
# compiled to dist/ first (packages/contracts has no source-linking, just
# published dist/cjs + dist/esm output apps/web imports from).
FROM node:20-alpine AS build
WORKDIR /repo

# Copy only the manifests needed to resolve the workspace graph before the
# rest of the source, so `npm ci` gets its own Docker layer and is skipped
# on rebuilds that only change application code.
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN npm ci

COPY . .

# Vite inlines VITE_* vars into the bundle at build time (no runtime env
# injection here), so a build for one environment can't be promoted to
# another without rebuilding — acceptable for now since only one deploy
# target exists; revisit with a runtime env-config.js if that changes.
ARG VITE_API_BASE_URL
ARG VITE_ROOT_DOMAIN
ARG VITE_SENTRY_DSN
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ROOT_DOMAIN=$VITE_ROOT_DOMAIN \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build --workspace=packages/contracts
RUN npm run build --workspace=apps/web

FROM nginx:1.27-alpine AS production
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
