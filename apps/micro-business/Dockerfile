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

# Copy all packages and apps (bun workspace requires all workspace members)
COPY packages ./packages
COPY apps ./apps

# Install dependencies (--ignore-scripts prevents premature postinstall db:generate,
# || true tolerates bun workspace hoisting warnings that exit non-zero)
RUN bun install --ignore-scripts || true

# Generate Prisma clients and build shared packages
RUN bun run db:generate && bun run build:package

WORKDIR /app/apps/micro-business
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

# Copy app tsconfig for path resolution
COPY --from=builder /app/apps/micro-business/tsconfig.json ./apps/micro-business/
COPY --from=builder /app/apps/micro-business/package.json ./apps/micro-business/
COPY --from=builder /app/apps/micro-business/dist ./apps/micro-business/dist

# Install production dependencies
ENV NODE_ENV=production
RUN bun install --no-save --ignore-scripts || true

WORKDIR /app/apps/micro-business

EXPOSE 5020
EXPOSE 6020

CMD ["bun", "start:prod"]
