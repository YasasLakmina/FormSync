import * as path from "path";
import * as crypto from "crypto";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import express, { Express } from "express";
import cors from "cors";
import * as os from "os";
import * as fs from "fs-extra";
import { BackendGenerator } from "./generator/BackendGenerator";
import { ZipService } from "./service/ZipService";
import { SchemaApiClient } from "./client/SchemaApiClient";

export interface ServerDeps {
  generator?: BackendGenerator;
  zipService?: ZipService;
  schemaClient?: SchemaApiClient;
}

export function createApp(deps: ServerDeps = {}): Express {
  const generator = deps.generator ?? new BackendGenerator();
  const zipService = deps.zipService ?? new ZipService();
  const schemaClient =
    deps.schemaClient ??
    new SchemaApiClient({
      baseUrl: process.env.SCHEMA_API_URL || "http://localhost:3000/schema",
    });

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  /**
   * POST /generate
   * Body: { schema: object, schemaId?: string, config?: object, preview?: boolean }
   */
  app.post("/generate", async (req, res) => {
    let { schema, schemaId, config } = req.body;

    if (
      !schema &&
      !schemaId &&
      (req.body.type || req.body.properties || req.body.$schema)
    ) {
      schema = req.body;
    }

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

    const requestId = crypto.randomUUID();
    const tempDir = path.join(os.tmpdir(), `formsync-gen-${requestId}`);

    console.log(`[${requestId}] Received generation request`);

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
        res.json({ success: true, files });
        fs.remove(tempDir).catch((err) =>
          console.error(`[${requestId}] Cleanup failed:`, err),
        );
        return;
      }

      const archive = await zipService.zipDirectory(tempDir);
      res.attachment("generated-backend.zip");
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

  return app;
}

const app = createApp();
const port = process.env.DTO_GENERATOR_PORT || 3012;

if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `Backend DTO Generator API listening at http://localhost:${port}`,
    );
  });
}
