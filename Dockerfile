FROM node:22-alpine AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS builder
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache libcap
RUN setcap cap_net_bind_service=+ep `readlink -f \`which node\``

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/ ./.next/

RUN wget "https://storage.yandexcloud.net/cloud-certs/CA.pem" -O /app/.next/root.crt
RUN chmod 0444 /app/.next/root.crt

USER nextjs

EXPOSE 443
EXPOSE 80

ENV PORT 80

CMD ["pnpm", "start"]