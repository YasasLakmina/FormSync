import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import express from "express";
import cors from "cors";
import * as os from "os";
import * as fs from "fs-extra";
import { randomUUID } from "crypto";
import { NodeBackendGenerator } from "./generator/NodeBackendGenerator";
import { ZipService } from "./service/ZipService";
import { SchemaApiClient } from "./client/SchemaApiClient";

const app = express();
const port = process.env.NODE_BACKEND_GENERATOR_PORT || 3015;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const generator = new NodeBackendGenerator();
const zipService = new ZipService();
const schemaClient = new SchemaApiClient({
  baseUrl: process.env.SCHEMA_API_URL || "http://localhost:3000/schema",
});

app.post("/generate", async (req, res) => {
  let { schema, schemaId, config } = req.body;

  if (!schema && !schemaId && (req.body.type || req.body.properties || req.body.$schema)) {
    schema = req.body;
  }

  if (schemaId && !schema) {
    try {
      const fetchedPayload = await schemaClient.fetchSchema(schemaId);
      schema = {
        name: fetchedPayload.name,
        version: fetchedPayload.version?.toString(),
        content: fetchedPayload.content,
      };
    } catch (err: any) {
      return res.status(404).json({ error: `Failed to fetch schema ${schemaId}: ${err.message}` });
    }
  }

  if (!schema) {
    return res.status(400).json({ error: "Schema or Schema ID is required" });
  }

  const requestId = randomUUID();
  const tempDir = path.join(os.tmpdir(), `formsync-node-backend-${requestId}`);

  try {
    await fs.ensureDir(tempDir);

    const genConfig = {
      ...(config || {}),
      outputDir: tempDir,
    };

    await generator.generate(schema, genConfig);

    if (req.body.preview) {
      const files: Array<{ path: string; content: string }> = [];

      const readFiles = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await readFiles(fullPath);
          } else {
            const content = await fs.readFile(fullPath, "utf8");
            const relativePath = path.relative(tempDir, fullPath);
            files.push({ path: relativePath, content });
          }
        }
      };

      await readFiles(tempDir);
      res.json({ success: true, requestId, files });
      fs.remove(tempDir).catch(() => {});
      return;
    }

    const archive = await zipService.zipDirectory(tempDir);
    res.attachment("node-express-backend.zip");
    res.setHeader("Content-Type", "application/zip");
    archive.pipe(res);

    res.on("finish", () => {
      fs.remove(tempDir).catch(() => {});
    });
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Generation failed", message: error.message });
    }
    fs.remove(tempDir).catch(() => {});
  }
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "node-backend-generator",
    uptime: process.uptime(),
  });
});

app.listen(port, () => {
  console.log(`Node Backend Generator listening at http://localhost:${port}`);
});
