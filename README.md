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

1. Build, tag and push an image:

```
# Web
pnpx dotenv-cli -c -- pnpm --filter @/web docker:all
# Bot
pnpx dotenv-cli -c -- pnpm --filter @/bot docker:all

# All
pnpx dotenv-cli -c -- pnpm docker:all
```
