# Homes tracker Georgia

## Deploy on Yandex

`pnpm update:patch`

Decide if you need to build general image / bot image.
`pnpm docker:build`
`pnpm bot:docker:build`

Verify that local profile contains `export DOCKER_PREFIX=cr.yandex/<registry>`
Decide if you need to publish general image / bot image.
`pnpm docker:publish`
`pnpm bot:docker:publish`
