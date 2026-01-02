
import express from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as crypto from 'crypto';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import { BackendGenerator } from './generator/BackendGenerator';
import { ZipService } from './service/ZipService';
import { SchemaApiClient } from './client/SchemaApiClient';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Allow larger schemas

// Services
const generator = new BackendGenerator();
const zipService = new ZipService();
const schemaClient = new SchemaApiClient({
    baseUrl: process.env.SCHEMA_API_URL || 'http://localhost:3000/schema' // Assuming schema-api is at 3000
});

/**
 * POST /generate
 * Body: { schema: object, schemaId?: string, config?: object }
 */
app.post('/generate', async (req, res) => {
    let { schema, schemaId, config } = req.body;

    // Fetch schema if ID provided
    if (schemaId && !schema) {
        try {
            console.log(`[Request] Fetching schema ${schemaId}...`);
            const fetchedPayload = await schemaClient.fetchSchema(schemaId);
            // Schema payload from API might wrap the content, or BE the content. 
            // Based on schema.service, it returns the Schema entity which has a 'content' field.
            schema = {
                name: fetchedPayload.name,
                version: fetchedPayload.version?.toString(),
                content: fetchedPayload.content
            };
            console.log(`[Request] Fetched schema: ${schema.name}`);
        } catch (err: any) {
            return res.status(404).json({ error: `Failed to fetch schema ${schemaId}: ${err.message}` });
        }
    }

    if (!schema) {
        return res.status(400).json({ error: 'Schema or Schema ID is required' });
    }

    const requestId = crypto.randomUUID();
    const tempDir = path.join(os.tmpdir(), `formsync-gen-${requestId}`);

    console.log(`[${requestId}] Received generation request`);

    try {
        // 1. Create unique temp dir
        await fs.ensureDir(tempDir);

        // 2. Run Generation
        // Override outputDir to point to temp dir
        const genConfig = {
            ...(config || {}),
            outputDir: tempDir
        };

        await generator.generate(schema, genConfig);

        // 3. Zip the output
        const archive = await zipService.zipDirectory(tempDir);

        // 4. Send Response
        res.attachment('generated-backend.zip');
        res.setHeader('Content-Type', 'application/zip');

        archive.pipe(res);

        // 5. Cleanup (after response finishes)
        res.on('finish', () => {
            fs.remove(tempDir).catch(err => console.error(`[${requestId}] Cleanup failed:`, err));
            console.log(`[${requestId}] Completed and cleaned up`);
        });

    } catch (error: any) {
        console.error(`[${requestId}] Generation failed:`, error);
        // If headers not sent, send error response
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Generation failed',
                message: error.message
            });
        }
        // Attempt cleanup
        fs.remove(tempDir).catch(() => { });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Backend DTO Generator API listening at http://localhost:${port}`);
});
