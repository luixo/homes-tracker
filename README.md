# Homes tracker Georgia

## Prerequisites

You'll need Bun and Node.js (see `packageManager` and `engines` in `package.json`).

# Development

Run `bun install` to install packages.

Run local web:

```
bun run web:dev
```

Run local bot:

```
bun run bot:start
```

## Deploy on Yandex

Please make sure `DOCKER_PREFIX` is located in `.env.local` or `.env` file

1. Update version:

```
# Web
bun pm --cwd apps/web version patch
# Bot
bun pm --cwd apps/bot version patch
```

1. Build, tag and push an image:

```
# Web
bunx --no-install dotenv -c -- bun run --cwd apps/web docker:all
# Bot
bunx --no-install dotenv -c -- bun run --cwd apps/bot docker:all

# All
bunx --no-install dotenv -c -- bun run --cwd apps/web docker:all && bunx --no-install dotenv -c -- bun run --cwd apps/bot docker:all
```
