# ── Build stage ────────────────────────────────────────────────
FROM node:20-slim AS builder

# Ensure openssl matches the runtime stage so Prisma generates correct binaries
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Shared tsconfig — services extend ../../config/tsconfig.base.json
COPY config/ config/

# Install dependencies first (cache layer)
COPY services/user-management-service/package*.json services/user-management-service/
WORKDIR /workspace/services/user-management-service
RUN npm install

# Copy source and build
COPY services/user-management-service/ .
RUN npx prisma generate
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-slim

# Required by Prisma on Debian/slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Compiled output
COPY --from=builder /workspace/services/user-management-service/dist ./dist

# All node_modules (includes prisma CLI needed for migrate deploy)
COPY --from=builder /workspace/services/user-management-service/node_modules ./node_modules

# Generated Prisma client
COPY --from=builder /workspace/services/user-management-service/generated ./generated

# Prisma schema (needed by migrate deploy)
COPY services/user-management-service/prisma ./prisma

EXPOSE 3011

# Run DB migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
