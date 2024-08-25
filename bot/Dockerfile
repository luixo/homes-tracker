FROM node:22-alpine
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

ENV NODE_ENV production

RUN wget "https://storage.yandexcloud.net/cloud-certs/CA.pem" -O /app/root.crt
RUN chmod 0444 /app/root.crt

CMD ["pnpm", "run", "bot:run"]