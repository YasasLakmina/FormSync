# ── Build stage ────────────────────────────────────────────────
FROM node:20-slim AS builder

# Ensure openssl matches the runtime stage so Prisma generates correct binaries
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Shared tsconfig — services extend ../../config/tsconfig.base.json
COPY config/ config/

# Install dependencies first (cache layer)
COPY services/schema-enhancement-engine/package*.json services/schema-enhancement-engine/
WORKDIR /workspace/services/schema-enhancement-engine
RUN npm install

# Copy source and build
COPY services/schema-enhancement-engine/ .
RUN npx prisma generate
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-slim

# Required by Prisma on Debian/slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Compiled output
COPY --from=builder /workspace/services/schema-enhancement-engine/dist ./dist

# All node_modules (includes prisma CLI needed for migrate deploy)
COPY --from=builder /workspace/services/schema-enhancement-engine/node_modules ./node_modules

# Generated Prisma client
COPY --from=builder /workspace/services/schema-enhancement-engine/generated ./generated

# Prisma schema (needed by migrate deploy)
COPY services/schema-enhancement-engine/prisma ./prisma

EXPOSE 3010

# Run DB migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
