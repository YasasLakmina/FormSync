import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';
import * as os from 'os';
import * as fs from 'fs-extra';
import { randomUUID } from 'crypto';
import { DotNetGenerator } from './generator/DotNetGenerator';
import { ZipService } from './service/ZipService';
import { SchemaApiClient } from './client/SchemaApiClient';

const app = express();
const port = process.env.DOTNET_BACKEND_GENERATOR_PORT || 3016;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const generator = new DotNetGenerator();
const zipService = new ZipService();
const schemaClient = new SchemaApiClient({
  baseUrl: process.env.SCHEMA_API_URL || 'http://localhost:3000/schema',
});

/**
 * POST /generate
 *
 * Generates a complete ASP.NET Core Web API backend from a JSON Schema.
 *
 * Body:
 *   - schema: The JSON Schema object
 *   - schemaId: ID to fetch schema from Schema API (alternative to schema)
 *   - config: { namespace, serverPort, includeSwagger }
 *   - preview: If true, returns file list as JSON instead of a zip
 */
app.post('/generate', async (req, res) => {
  let { schema, schemaId, config } = req.body;

  if (!schema && !schemaId && (req.body.type || req.body.properties || req.body.$schema)) {
    schema = req.body;
  }

  if (schemaId && !schema) {
    try {
      const fetched = await schemaClient.fetchSchema(schemaId);
      schema = { name: fetched.name, version: fetched.version?.toString(), content: fetched.content };
    } catch (err: any) {
      return res.status(404).json({ error: `Failed to fetch schema ${schemaId}: ${err.message}` });
    }
  }

  if (!schema) {
    return res.status(400).json({ error: 'Schema or Schema ID is required' });
  }

  const requestId = randomUUID();
  const tempDir = path.join(os.tmpdir(), `formsync-dotnet-${requestId}`);

  try {
    await fs.ensureDir(tempDir);

    await generator.generate(schema, { ...(config || {}), outputDir: tempDir });

    if (req.body.preview) {
      const files: Array<{ path: string; content: string }> = [];

      const readFiles = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await readFiles(fullPath);
          } else {
            const content = await fs.readFile(fullPath, 'utf8');
            files.push({ path: path.relative(tempDir, fullPath), content });
          }
        }
      };

      await readFiles(tempDir);
      res.json({ success: true, requestId, files });
      fs.remove(tempDir).catch(() => {});
      return;
    }

    const archive = await zipService.zipDirectory(tempDir);
    res.attachment('dotnet-webapi-server.zip');
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    res.on('finish', () => {
      fs.remove(tempDir).catch(() => {});
      console.log(`[${requestId}] Completed and cleaned up`);
    });
  } catch (error: any) {
    console.error(`[${requestId}] Generation failed:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Generation failed', message: error.message });
    }
    fs.remove(tempDir).catch(() => {});
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dotnet-backend-generator', uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(`🚀 .NET Backend Generator listening at http://localhost:${port}`);
  console.log(`   POST /generate  — Generate a complete ASP.NET Core Web API server`);
  console.log(`   GET  /health    — Health check`);
});
