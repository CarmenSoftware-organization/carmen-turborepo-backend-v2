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

WORKDIR /app/apps/micro-notification
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

# Copy all packages (with generated clients and built dist) from builder
COPY --from=builder /app/packages ./packages

# Copy app
COPY --from=builder /app/apps/micro-notification/tsconfig.json ./apps/micro-notification/
COPY --from=builder /app/apps/micro-notification/package.json ./apps/micro-notification/
COPY --from=builder /app/apps/micro-notification/dist ./apps/micro-notification/dist

# Install production dependencies
ENV NODE_ENV=production
RUN bun install --no-save --ignore-scripts || true

WORKDIR /app/apps/micro-notification

# Service ports
ENV NOTIFICATION_SERVICE_HOST=0.0.0.0
ENV NOTIFICATION_SERVICE_TCP_PORT=5006
ENV NOTIFICATION_SERVICE_HTTP_PORT=6006

EXPOSE 5006
EXPOSE 6006

CMD ["bun", "run", "start:prod"]
