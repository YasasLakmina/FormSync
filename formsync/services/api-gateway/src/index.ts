/**
 * FormSync API Gateway
 *
 * Single entry point (port 3000) that routes requests to the correct microservice.
 *
 * Route map:
 *   /schema/*          → schema-enhancement-engine  (3010)
 *   /auth/*            → user-management-service     (3011)
 *   /users/*           → user-management-service     (3011)
 *   /template*         → user-management-service     (3011)
 *   /dto/*             → backend-dto-generator        (3012)  rewrite → /
 *   /runtime/*         → runtime-binding-engine       (3013)  rewrite → /
 *   /formgen/*         → formgen-service              (3014)  rewrite → /
 *   /bundle/*          → formgen-service              (3014)  rewrite → /
 *   /node-backend/*    → node-backend-generator       (3015)  rewrite → /
 *   GET /health        → aggregate health of all services
 *   GET /              → gateway info
 */

import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { SERVICES } from "./config/services";
import { healthHandler } from "./health/health.handler";

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// ─── Global middleware ────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, cb) => {
      // No origin = same-origin request (e.g. nginx proxy) — always allow
      if (!origin) return cb(null, true);
      // Local dev
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return cb(null, true);
      }
      // Production — allow whatever FRONTEND_URL is set to
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return cb(null, true);
      }
      // In Docker, nginx proxies requests so origin may match the server's public address
      // Allow all origins in production since the gateway is not publicly exposed
      if (process.env.NODE_ENV === "production") {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(morgan(":method :url :status :response-time ms"));

// ─── Gateway info ─────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({
    name: "FormSync API Gateway",
    version: "1.0.0",
    port: PORT,
    routes: {
      "/schema/*": `${SERVICES.schemaEnhancementEngine.url} — ${SERVICES.schemaEnhancementEngine.description}`,
      "/auth/*": `${SERVICES.userManagementService.url} — auth endpoints`,
      "/users/*": `${SERVICES.userManagementService.url} — user management`,
      "/template*": `${SERVICES.userManagementService.url} — template management`,
      "/dto/*": `${SERVICES.backendDtoGenerator.url} — ${SERVICES.backendDtoGenerator.description}`,
      "/runtime/*": `${SERVICES.runtimeBindingEngine.url} — ${SERVICES.runtimeBindingEngine.description}`,
      "/formgen/*": `${SERVICES.formgenService.url} — ${SERVICES.formgenService.description}`,
      "/bundle/*": `${SERVICES.formgenService.url} — fullstack bundle generation`,
      "/node-backend/*": `${SERVICES.nodeBackendGenerator.url} — ${SERVICES.nodeBackendGenerator.description}`,
    },
    docs: {
      "schema-enhancement-engine": `${SERVICES.schemaEnhancementEngine.url}/api/docs`,
      "user-management-service": `${SERVICES.userManagementService.url}/api`,
    },
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", healthHandler);

// ─── Proxy helpers ────────────────────────────────────────────────────────────

/**
 * Standard proxy — calls fixRequestBody so that JSON bodies that were
 * consumed by express.json() are re-serialised onto the proxy request.
 */
function proxy(target: string, options: Record<string, any> = {}) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      proxyReq: fixRequestBody,
      error: (err, _req, res: any) => {
        console.error(`[Gateway] Proxy error → ${target}:`, err.message);
        if (!res.headersSent) {
          res.status(502).json({
            error: "Bad Gateway",
            message: `Upstream service unavailable: ${target}`,
          });
        }
      },
    },
    ...options,
  });
}

/**
 * Raw-stream proxy — does NOT call fixRequestBody.
 * Use this for multipart/form-data uploads so that the raw byte stream
 * (including file buffers) is forwarded untouched to the downstream service.
 * Calling fixRequestBody on a multipart body corrupts the stream and causes
 * the downstream service to receive an empty/broken file.
 */
function proxyRaw(target: string, options: Record<string, any> = {}) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      error: (err, _req, res: any) => {
        console.error(`[Gateway] Proxy error → ${target}:`, err.message);
        if (!res.headersSent) {
          res.status(502).json({
            error: "Bad Gateway",
            message: `Upstream service unavailable: ${target}`,
          });
        }
      },
    },
    ...options,
  });
}

// ─── Route proxies ────────────────────────────────────────────────────────────

// Schema Enhancement Engine — multipart file upload route (MUST be before /schema)
// Uses proxyRaw so the raw multipart stream is forwarded without being corrupted.
app.use(
  "/schema/parse-srs",
  proxyRaw(SERVICES.schemaEnhancementEngine.url, {
    pathRewrite: () => `/schema/parse-srs`,
  }),
);

// Schema Enhancement Engine  →  /schema/*  (preserve /schema prefix)
app.use(
  "/schema",
  proxy(SERVICES.schemaEnhancementEngine.url, {
    pathRewrite: (path) => `/schema${path}`,
  }),
);

// User Management Service  →  /auth/*, /users/*, /template* (preserve prefixes)
app.use(
  "/auth",
  proxy(SERVICES.userManagementService.url, {
    pathRewrite: (path) => `/auth${path}`,
  }),
);
app.use(
  "/users",
  proxy(SERVICES.userManagementService.url, {
    pathRewrite: (path) => `/users${path}`,
  }),
);
app.use(
  "/template",
  proxy(SERVICES.userManagementService.url, {
    pathRewrite: (path) => `/template${path}`,
  }),
);
app.use(
  "/project",
  proxy(SERVICES.userManagementService.url, {
    pathRewrite: (path) => `/project${path}`,
  }),
);

// Backend DTO Generator  →  /dto/*  rewrite to /
app.use(
  "/dto",
  proxy(SERVICES.backendDtoGenerator.url, {
    pathRewrite: { "^/dto": "" },
  }),
);

// Runtime Binding Engine  →  /runtime/*  rewrite to /
app.use(
  "/runtime",
  proxy(SERVICES.runtimeBindingEngine.url, {
    pathRewrite: { "^/runtime": "" },
  }),
);

// Formgen Service  →  /formgen/*  rewrite to /
app.use(
  "/formgen",
  proxy(SERVICES.formgenService.url, {
    pathRewrite: { "^/formgen": "" },
  }),
);

// Fullstack bundle endpoint  →  /bundle/*  rewrite to /
app.use(
  "/bundle",
  proxy(SERVICES.formgenService.url, {
    pathRewrite: { "^/bundle": "" },
  }),
);

// Node Backend Generator  →  /node-backend/*  rewrite to /
app.use(
  "/node-backend",
  proxy(SERVICES.nodeBackendGenerator.url, {
    pathRewrite: { "^/node-backend": "" },
  }),
);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log("");
  console.log("┌─────────────────────────────────────────────────────┐");
  console.log(`│  🚀  FormSync API Gateway  →  http://localhost:${PORT}  │`);
  console.log("├─────────────────────────────────────────────────────┤");
  console.log(`│  /schema/*   →  schema-enhancement-engine  :3010    │`);
  console.log(`│  /auth/*     →  user-management-service    :3011    │`);
  console.log(`│  /users/*    →  user-management-service    :3011    │`);
  console.log(`│  /template*  →  user-management-service    :3011    │`);
  console.log(`│  /dto/*      →  backend-dto-generator       :3012   │`);
  console.log(`│  /runtime/*  →  runtime-binding-engine      :3013   │`);
  console.log(`│  /formgen/*  →  formgen-service             :3014   │`);
  console.log(`│  /bundle/*   →  formgen-service             :3014   │`);
  console.log(`│  /node-backend/* → node-backend-generator   :3015   │`);
  console.log(`│  /health     →  aggregate health check              │`);
  console.log("└─────────────────────────────────────────────────────┘");
  console.log("");
});
