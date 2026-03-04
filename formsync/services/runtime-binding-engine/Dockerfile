# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Shared tsconfig — services extend ../../config/tsconfig.base.json
COPY config/ config/

# Install dependencies first (cache layer)
COPY services/runtime-binding-engine/package*.json services/runtime-binding-engine/
WORKDIR /workspace/services/runtime-binding-engine
RUN npm install

# Copy source and build
# postbuild automatically copies Handlebars templates:
#   src/templates/**/*.{hbs,yml} → dist/apps/runtime-binding-engine/src/templates/
COPY services/runtime-binding-engine/ .
RUN npm run build
# cpx postbuild copies to a wrong nested path; copy templates to the correct location
RUN cp -r src/templates dist/templates

# ── Runtime stage ──────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Compiled output + embedded Handlebars templates (from postbuild cpx step)
COPY --from=builder /workspace/services/runtime-binding-engine/dist ./dist

# node_modules from builder (avoids reinstall)
COPY --from=builder /workspace/services/runtime-binding-engine/node_modules ./node_modules

EXPOSE 3013

CMD ["node", "dist/index.js"]
