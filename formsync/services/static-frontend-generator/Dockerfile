# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

COPY config/ config/

COPY packages/formgen-shared ./packages/formgen-shared
WORKDIR /workspace/packages/formgen-shared
RUN npm install && npm run build

WORKDIR /workspace/services/static-frontend-generator
COPY services/static-frontend-generator/package*.json ./
RUN npm install

COPY services/static-frontend-generator/ .
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /workspace/services/static-frontend-generator

COPY --from=builder /workspace/packages/formgen-shared /workspace/packages/formgen-shared

COPY services/static-frontend-generator/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /workspace/services/static-frontend-generator/dist ./dist

EXPOSE 3017

CMD ["node", "dist/server.js"]
