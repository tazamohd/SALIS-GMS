FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# The migration runner is loaded by tsx at runtime; ship the source + folder.
COPY --from=builder /app/server/scripts ./server/scripts
COPY --from=builder /app/server/config.ts ./server/config.ts
COPY --from=builder /app/migrations ./migrations
EXPOSE 5000
# Entrypoint: apply pending migrations, then start the server. If migrations
# fail the container exits non-zero and the orchestrator can decide whether to
# retry or roll back (sh -c so the chained command exits with the right code).
CMD ["sh", "-c", "npm run db:migrate && node dist/index.js"]
