# Homes tracker Georgia

## Deploy on Yandex

Please make sure `DOCKER_PREFIX` is located in `.env.local` or `.env` file

1. Update version:

```
# Web
pnpm --filter @/web exec pnpm version patch
# Bot
pnpm --filter @/bot exec pnpm version patch
```

1. Build an image:

```
# Web
pnpm docker build @/web
# Bot
pnpm docker build @/bot
```

1. Push image to the registry:

```
# dotenv needed for `DOCKER_PREFIX` env variable
# Web
pnpm exec dotenv -c -- pnpm docker publish @/web
# Bot
pnpm exec dotenv -c -- pnpm docker publish @/bot
```

One-liner:

```
# Web
pnpm --filter @/web exec pnpm version patch && pnpm docker build @/web && pnpm exec dotenv -c -- pnpm docker publish @/web
# Bot
pnpm --filter @/bot exec pnpm version patch && pnpm docker build @/bot && pnpm exec dotenv -c -- pnpm docker publish @/bot
```
