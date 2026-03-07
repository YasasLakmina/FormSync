# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Shared tsconfig — services extend ../../config/tsconfig.base.json
COPY config/ config/

# Install dependencies first (cache layer)
COPY services/backend-dto-generator/package*.json services/backend-dto-generator/
WORKDIR /workspace/services/backend-dto-generator
RUN npm install

# Copy source and build
# postbuild automatically copies templates → dist/apps/backend-dto-generator/src/templates/
COPY services/backend-dto-generator/ .
RUN npm run build
# cpx postbuild copies to a wrong nested path; copy templates to the correct location
RUN cp -r src/templates dist/templates

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Compiled output + embedded templates (from postbuild cpx step)
COPY --from=builder /workspace/services/backend-dto-generator/dist ./dist

# Production dependencies only
COPY services/backend-dto-generator/package*.json ./
RUN npm install --omit=dev

EXPOSE 3012

CMD ["node", "dist/index.js"]
