# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace/services

COPY config/ /workspace/config/

COPY services/schema-openapi ./schema-openapi
WORKDIR /workspace/services/schema-openapi
RUN npm install && npm run build

WORKDIR /workspace/services/runtime-binding-engine
COPY services/runtime-binding-engine/package*.json ./
RUN npm install

COPY services/runtime-binding-engine/ .
RUN npm run build
RUN cp -r src/templates dist/templates

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /workspace/services

COPY --from=builder /workspace/services/schema-openapi ./schema-openapi

WORKDIR /workspace/services/runtime-binding-engine
COPY services/runtime-binding-engine/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /workspace/services/runtime-binding-engine/dist ./dist

EXPOSE 3013

CMD ["node", "dist/index.js"]
