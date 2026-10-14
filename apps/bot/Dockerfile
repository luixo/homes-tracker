FROM oven/bun:1.4.3-alpine AS bun

FROM node:22-alpine
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --production --frozen-lockfile

ENV NODE_ENV=production

RUN chmod 0444 ./root.crt

CMD bun run --cwd apps/bot start
