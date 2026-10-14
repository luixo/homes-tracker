FROM oven/bun:1.4.3-alpine AS bun

FROM node:22-alpine AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
COPY ../.. /app
WORKDIR /app

FROM base AS deps
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --production --frozen-lockfile

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --frozen-lockfile
ARG NEXT_PUBLIC_MAPBOX_API_KEY
RUN bun run --cwd apps/web build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache libcap
RUN setcap cap_net_bind_service=+ep `readlink -f \`which node\``

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

RUN chmod 0444 root.crt

USER nextjs

EXPOSE 80

CMD HOSTNAME="0.0.0.0" node apps/web/server.js
