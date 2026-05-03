/**
 * static-frontend-generator — HTML + Bootstrap + vanilla JS from FormModel
 *
 * Port 3017 (default)
 */

import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import express from "express";
import cors from "cors";
import * as os from "os";
import * as crypto from "crypto";
import * as fs from "fs-extra";
import archiver from "archiver";
import type { FormModel } from "./types";
import {
  generateStaticBootstrapFiles,
  type StaticGeneratorWiring,
} from "./generators/static-bootstrap-generator";

const app = express();
const port = process.env.STATIC_FRONTEND_GENERATOR_PORT || 3017;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

/**
 * POST /generate
 * Body: { formModel: FormModel, preview?: boolean, wiring?: { apiBaseUrl, apiPath } }
 * - preview true → JSON { success, files: [{ path, content }] }
 * - preview false/absent → application/zip
 */
app.post("/generate", async (req, res) => {
  const {
    formModel,
    preview,
    wiring,
  }: {
    formModel?: FormModel;
    preview?: boolean;
    wiring?: StaticGeneratorWiring;
  } = req.body;

  if (!formModel) {
    return res.status(400).json({ error: "formModel is required" });
  }

  const requestId = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), `formsync-static-fe-${requestId}`);

  try {
    const filesRecord = generateStaticBootstrapFiles(formModel, wiring);

    if (preview) {
      const files = Object.entries(filesRecord).map(([p, content]) => ({
        path: p,
        content,
      }));
      res.json({ success: true, requestId, files });
      return;
    }

    await fs.ensureDir(tempDir);
    for (const [relPath, content] of Object.entries(filesRecord)) {
      const fullPath = path.join(tempDir, relPath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content, "utf8");
    }

    const slug = String(formModel.name || "form")
      .toLowerCase()
      .replace(/\s+/g, "-");
    res.attachment(`${slug}-html-bootstrap.zip`);
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(tempDir, false);
    archive.finalize();

    res.on("finish", () => {
      fs.remove(tempDir).catch(() => {});
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${requestId}] Generate failed:`, message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Generation failed", message });
    }
    fs.remove(tempDir).catch(() => {});
  }
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "static-frontend-generator",
    uptime: process.uptime(),
  });
});

app.listen(port, () => {
  console.log(`🚀 static-frontend-generator at http://localhost:${port}`);
  console.log(`   POST /generate — FormModel → ZIP or JSON files (preview)`);
  console.log(`   GET  /health`);
});
