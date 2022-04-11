# Install dependencies only when needed
FROM amd64/node:16-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./ 
RUN npm ci

# Production image, copy all the files and run next
FROM amd64/node:16-alpine AS runner
WORKDIR /app
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV production

RUN wget "https://storage.yandexcloud.net/cloud-certs/CA.pem" -O /app/root.crt
RUN chmod 0444 /app/root.crt

CMD ["npm", "run", "bot:dev"]