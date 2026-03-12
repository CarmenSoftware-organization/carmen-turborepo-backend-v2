FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*

# Install bun for dependency management
RUN npm install -g bun

# Copy root package files
COPY package.json .
COPY bun.lock .
COPY tsconfig.json .
COPY turbo.json .

# Copy packages and this app only
COPY packages ./packages
COPY apps/micro-cronjob ./apps/micro-cronjob

# Remove root postinstall script to prevent premature turbo build:package during install
# (prisma-types-generator has a known bug with @default("") fields)
RUN node -e "const p=require('./package.json'); delete p.scripts.postinstall; require('fs').writeFileSync('./package.json', JSON.stringify(p, null, 2))"

# Install dependencies (|| true tolerates bun workspace hoisting warnings for non-critical packages)
RUN bun install || true

# Generate Prisma clients and build shared packages
RUN bun run db:generate && bun run build:package

# Fix broken bun workspace symlinks: rebuild local node_modules with npm
# (bun build bundler can't follow bun's .bun cache symlinks)
WORKDIR /app/apps/micro-cronjob
RUN rm -rf node_modules && npm install --legacy-peer-deps
RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*

# Install bun for runtime
RUN npm install -g bun

# Copy root package files
COPY package.json .
COPY bun.lock .
COPY tsconfig.json .

# Copy built packages from builder (including their dist folders)
COPY --from=builder /app/packages ./packages

# Copy app files from builder
COPY --from=builder /app/apps/micro-cronjob/tsconfig.json ./apps/micro-cronjob/
COPY --from=builder /app/apps/micro-cronjob/package.json ./apps/micro-cronjob/
COPY --from=builder /app/apps/micro-cronjob/dist ./apps/micro-cronjob/dist
COPY --from=builder /app/apps/micro-cronjob/prisma ./apps/micro-cronjob/prisma

# Install production dependencies
ENV NODE_ENV=production
RUN bun install --no-save --ignore-scripts || true


WORKDIR /app/apps/micro-cronjob

EXPOSE 5012
EXPOSE 6012

CMD ["bun", "start:prod"]
