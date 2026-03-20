# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Shared tsconfig — services extend ../../config/tsconfig.base.json
COPY config/ config/

COPY packages/form-types ./packages/form-types
WORKDIR /workspace/packages/form-types
RUN npm install && npm run build

WORKDIR /workspace
COPY packages/formgen-shared ./packages/formgen-shared
WORKDIR /workspace/packages/formgen-shared
RUN npm install && npm run build

WORKDIR /workspace/services/formgen-service
COPY services/formgen-service/package*.json ./
RUN npm install

COPY services/formgen-service/ .
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /workspace/services/formgen-service

COPY --from=builder /workspace/packages/formgen-shared /workspace/packages/formgen-shared
COPY --from=builder /workspace/packages/form-types /workspace/packages/form-types

COPY services/formgen-service/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /workspace/services/formgen-service/dist ./dist

EXPOSE 3014

CMD ["node", "dist/server.js"]
