# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Shared tsconfig — services extend ../../config/tsconfig.base.json
COPY config/ config/

# Install dependencies first (cache layer)
COPY services/formgen-service/package*.json services/formgen-service/
WORKDIR /workspace/services/formgen-service
RUN npm install

# Copy source and build
COPY services/formgen-service/ .
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Compiled output
COPY --from=builder /workspace/services/formgen-service/dist ./dist

# Production dependencies only
COPY services/formgen-service/package*.json ./
RUN npm install --omit=dev

EXPOSE 3014

CMD ["node", "dist/server.js"]
