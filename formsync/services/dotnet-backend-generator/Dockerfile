# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace/services

COPY config/ /workspace/config/

COPY services/schema-openapi ./schema-openapi
WORKDIR /workspace/services/schema-openapi
RUN npm install && npm run build

WORKDIR /workspace/services/dotnet-backend-generator
COPY services/dotnet-backend-generator/package*.json ./
RUN npm install

COPY services/dotnet-backend-generator/ .
RUN npm run build
RUN cp -r src/templates dist/templates || true

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /workspace/services

COPY --from=builder /workspace/services/schema-openapi ./schema-openapi

WORKDIR /workspace/services/dotnet-backend-generator
COPY services/dotnet-backend-generator/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /workspace/services/dotnet-backend-generator/dist ./dist

EXPOSE 3016

CMD ["node", "dist/index.js"]
