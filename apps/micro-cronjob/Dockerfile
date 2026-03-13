# ============================================================
# Stage 1: Prune monorepo
# ============================================================
FROM node:22-bookworm-slim AS pruner
WORKDIR /app
RUN npm install -g turbo@2
COPY . .
RUN turbo prune micro-cronjob --docker

# ============================================================
# Stage 2: Install dependencies + build (Elysia/Bun service)
# ============================================================
FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*
RUN npm install -g bun

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

# Remove postinstall to prevent premature turbo build:package
RUN node -e "const p=require('./package.json'); delete p.scripts.postinstall; require('fs').writeFileSync('./package.json', JSON.stringify(p, null, 2))"
RUN bun install || true

COPY --from=pruner /app/out/full/ .
COPY tsconfig.json .

RUN bun run db:generate && bun run build:package

# Fix bun workspace symlinks: rebuild local node_modules with npm
WORKDIR /app/apps/micro-cronjob
RUN rm -rf node_modules && npm install --legacy-peer-deps
RUN npm run build

# ============================================================
# Stage 3: Production runner
# ============================================================
FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*
RUN npm install -g bun

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
ENV NODE_ENV=production
RUN bun install --no-save --ignore-scripts || true

COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/micro-cronjob/dist ./apps/micro-cronjob/dist
COPY --from=builder /app/apps/micro-cronjob/package.json ./apps/micro-cronjob/
COPY --from=builder /app/apps/micro-cronjob/tsconfig.json ./apps/micro-cronjob/
COPY --from=builder /app/apps/micro-cronjob/prisma ./apps/micro-cronjob/prisma

WORKDIR /app/apps/micro-cronjob

EXPOSE 5012
EXPOSE 6012

CMD ["bun", "start:prod"]
