# SALIS-GMS — single-stage image (dev deps are needed for the build + the
# tsx-based migrator and drizzle-kit). Good for demo/self-host deploys.
FROM node:20-slim

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci

# App source + build.
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# On boot: apply migrations, seed demo data (idempotent — tolerate re-runs),
# then start the production server.
CMD ["sh", "-c", "npm run db:migrate && (npm run db:seed:demo || echo 'seed skipped') && npm start"]
