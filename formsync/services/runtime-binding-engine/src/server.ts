import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import express from "express";
import cors from "cors";
import * as os from "os";
import * as fs from "fs-extra";
import { randomUUID } from "crypto";
import { SpringBootGenerator } from "./generator/SpringBootGenerator";
import { ZipService } from "./service/ZipService";
import { SchemaApiClient } from "./client/SchemaApiClient";

const app = express();
const port = process.env.RUNTIME_ENGINE_PORT || 3013;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Services
const generator = new SpringBootGenerator();
const zipService = new ZipService();
const schemaClient = new SchemaApiClient({
  baseUrl: process.env.SCHEMA_API_URL || "http://localhost:3000/schema",
});

/**
 * POST /generate
 *
 * Generates a complete, ready-to-run Spring Boot backend server from a JSON Schema.
 *
 * Body:
 *   - schema: The JSON Schema object (can be passed directly or nested in content)
 *   - schemaId: ID to fetch schema from Schema API (alternative to schema)
 *   - config: { basePackage, serverPort, includeSwagger, database }
 *   - preview: If true, returns file list as JSON instead of a zip
 */
app.post("/generate", async (req, res) => {
  let { schema, schemaId, config } = req.body;

  // Allow passing schema directly in body
  if (
    !schema &&
    !schemaId &&
    (req.body.type || req.body.properties || req.body.$schema)
  ) {
    schema = req.body;
  }

  // Fetch schema from Schema API if ID is provided
  if (schemaId && !schema) {
    try {
      console.log(`[Request] Fetching schema ${schemaId}...`);
      const fetchedPayload = await schemaClient.fetchSchema(schemaId);
      schema = {
        name: fetchedPayload.name,
        version: fetchedPayload.version?.toString(),
        content: fetchedPayload.content,
      };
      console.log(`[Request] Fetched schema: ${schema.name}`);
    } catch (err: any) {
      return res
        .status(404)
        .json({ error: `Failed to fetch schema ${schemaId}: ${err.message}` });
    }
  }

  if (!schema) {
    return res.status(400).json({ error: "Schema or Schema ID is required" });
  }

  const requestId = randomUUID();
  const tempDir = path.join(os.tmpdir(), `formsync-springboot-${requestId}`);

  console.log(`[${requestId}] Received Spring Boot generation request`);

  try {
    await fs.ensureDir(tempDir);

    const genConfig = {
      ...(config || {}),
      outputDir: tempDir,
    };

    await generator.generate(schema, genConfig);

    // Preview mode: return file contents as JSON
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

      res.json({
        success: true,
        requestId,
        files,
      });

      fs.remove(tempDir).catch((err) =>
        console.error(`[${requestId}] Cleanup failed:`, err),
      );
      return;
    }

    // Default mode: return a zip file
    const archive = await zipService.zipDirectory(tempDir);

    res.attachment("springboot-server.zip");
    res.setHeader("Content-Type", "application/zip");

    archive.pipe(res);

    res.on("finish", () => {
      fs.remove(tempDir).catch((err) =>
        console.error(`[${requestId}] Cleanup failed:`, err),
      );
      console.log(`[${requestId}] Completed and cleaned up`);
    });
  } catch (error: any) {
    console.error(`[${requestId}] Generation failed:`, error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Generation failed",
        message: error.message,
      });
    }
    fs.remove(tempDir).catch(() => {});
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "runtime-binding-engine",
    uptime: process.uptime(),
  });
});

app.listen(port, () => {
  console.log(
    `🚀 Runtime Binding Engine listening at http://localhost:${port}`,
  );
  console.log(`   POST /generate  — Generate a complete Spring Boot server`);
  console.log(`   GET  /health    — Health check`);
});
