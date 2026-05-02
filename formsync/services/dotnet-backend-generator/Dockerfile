# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Shared tsconfig — services extend ../../config/tsconfig.base.json
COPY config/ config/

# Install dependencies first (cache layer)
COPY services/dotnet-backend-generator/package*.json services/dotnet-backend-generator/
WORKDIR /workspace/services/dotnet-backend-generator
RUN npm install

# Copy source and build
COPY services/dotnet-backend-generator/ .
RUN npm run build
RUN cp -r src/templates dist/templates || true

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /workspace/services/dotnet-backend-generator/dist ./dist

COPY services/dotnet-backend-generator/package*.json ./
RUN npm install --omit=dev

EXPOSE 3016

CMD ["node", "dist/index.js"]
