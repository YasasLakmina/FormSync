# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Shared tsconfig — services extend ../../config/tsconfig.base.json
COPY config/ config/

# Install dependencies first (cache layer)
COPY services/api-gateway/package*.json services/api-gateway/
WORKDIR /workspace/services/api-gateway
RUN npm install

# Copy source and build
COPY services/api-gateway/ .
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Compiled output
COPY --from=builder /workspace/services/api-gateway/dist ./dist

# Production dependencies only
COPY services/api-gateway/package*.json ./
RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "dist/index.js"]
