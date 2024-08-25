# Homes tracker Georgia

## Deploy on Yandex

`npm version --no-git-tag-version patch`

Decide if you need to build general image / bot image.
`npm run docker:build`
`npm run bot:docker:build`

Verify that local profile contains `export DOCKER_PREFIX=cr.yandex/<registry>`
Decide if you need to publish general image / bot image.
`npm run docker:publish`
`npm run bot:docker:publish`
