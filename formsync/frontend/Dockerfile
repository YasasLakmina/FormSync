# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Shared tsconfig — frontend/tsconfig.json extends ../config/tsconfig.base.json
COPY config/ config/

# Workspace package required by file:../packages/form-types in package.json
COPY packages/form-types ./packages/form-types
WORKDIR /workspace/packages/form-types
RUN npm install && npm run build

# Destination paths are relative to WORKDIR — reset so COPY lands under /workspace
WORKDIR /workspace

# Install dependencies first (cache layer)
COPY frontend/package*.json frontend/
WORKDIR /workspace/frontend
RUN npm install

# Copy source and build
COPY frontend/ .
RUN npm run build
# Output: /workspace/frontend/dist/

# ── Serve stage (nginx) ────────────────────────────────────────
FROM nginx:alpine

# Custom nginx config (SPA routing support)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Compiled React app
COPY --from=builder /workspace/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
