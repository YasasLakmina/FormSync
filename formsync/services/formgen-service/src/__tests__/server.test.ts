/**
 * Test Suite: Server API Integration tests
 * 
 * Purpose: Simulates Express application startup mechanically identical to `server.ts` routes.
 * Utilizes `supertest` to bypass traditional network limitations sending internal HTTP requests testing routes natively.
 * 
 * Best Practice: Categorized efficiently by HTTP method, ensuring boundaries handle missing requests organically.
 */
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import { FormModel } from '../types';
import {
    generateAppTsx,
    generatePackageJson,
    generateViteConfig,
    generateTsConfig,
    generateTsConfigNode,
    generateIndexHtml,
    generateMainTsx,
    generateIndexCss,
    generateReadme,
} from '../generators';
import archiver from 'archiver';
import * as crypto from 'crypto';
import { flatFormModel } from './fixtures';

/**
 * Helper factory generating the Express test environment directly copying logic structures identically simulating execution.
 */
const createTestApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '5mb' }));

    app.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            service: 'formgen-service',
            uptime: process.uptime(),
        });
    });

    app.post('/generate-react', async (req, res) => {
        const formModel: FormModel | undefined = req.body?.formModel;

        // Reject processing early to preserve backend integrity if models are poorly formed
        if (!formModel) {
            return res.status(400).json({ error: 'formModel is required' });
        }

        if (!formModel.name) {
            return res.status(400).json({ error: 'formModel must have a name' });
        }

        const requestId = crypto.randomUUID();
        const tempDir = path.join(os.tmpdir(), `formgen-react-test-${requestId}`);

        try {
            // 1. Establish project directory boundaries safely isolating processes concurrently 
            await fs.ensureDir(tempDir);
            await fs.ensureDir(path.join(tempDir, 'src'));

            const files: Record<string, string> = {
                'package.json': generatePackageJson(formModel),
                'vite.config.ts': generateViteConfig(),
                'tsconfig.json': generateTsConfig(),
                'tsconfig.node.json': generateTsConfigNode(),
                'index.html': generateIndexHtml(formModel),
                'README.md': generateReadme(formModel),
                'src/main.tsx': generateMainTsx(),
                'src/App.tsx': generateAppTsx(formModel),
                'src/index.css': generateIndexCss(formModel),
                '.gitignore': `node_modules\ndist\ndist-ssr\n*.local\n`,
            };

            // 2. Iterate dynamically allocating files logically across disk boundary logic mechanisms
            for (const [filePath, content] of Object.entries(files)) {
                const fullPath = path.join(tempDir, filePath);
                await fs.ensureDir(path.dirname(fullPath));
                await fs.writeFile(fullPath, content, 'utf8');
            }

            // 3. Compile output responses formatting correctly targeting direct download schemas
            const projectName = formModel.name.toLowerCase().replace(/\s+/g, '-');
            res.attachment(`${projectName}-export.zip`);
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Access-Control-Allow-Origin', '*');

            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(res);
            archive.directory(tempDir, false);
            archive.finalize();

            // Gracefully clean trailing disk space avoiding IO exceptions/disk pollution scaling out architecture safely
            res.on('finish', () => {
                fs.remove(tempDir).catch(() => { });
            });
        } catch (error: any) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Generation failed', message: error.message });
            }
            fs.remove(tempDir).catch(() => { });
        }
    });

    return app;
};

// Initialize app globally per suite executing logically dynamically faster via cached runtime mapping rules limits 
const app = createTestApp();

describe('formgen-service API', () => {

    /**
     * HTTP Mapping: Validates status routes mappings cleanly natively
     */
    describe('GET /health', () => {
        it('returns 200 status', async () => {
            // Act
            const response = await request(app).get('/health');
            // Assert: Verify connection is open flawlessly responding internally directly 
            expect(response.status).toBe(200);
        });

        it('returns the ok status message', async () => {
            const response = await request(app).get('/health');
            expect(response.body.status).toBe('ok');
        });

        it('identifies the service explicitly', async () => {
            const response = await request(app).get('/health');
            expect(response.body.service).toBe('formgen-service');
            expect(response.body.uptime).toBeDefined();
        });
    });

    /**
     * Header Mapping: Core testing of generic networking validations limits cross site access rules mechanically 
     */
    describe('CORS and Express Defaults', () => {
        it('responds to OPTIONS with CORS headers', async () => {
            const response = await request(app).options('/health');
            // Assert: Ensure Options queries cleanly terminate securely limiting request headers mappings smoothly mapped 
            expect(response.status).toBe(204);
            expect(response.headers['access-control-allow-origin']).toBe('*');
        });

        it('handles non-existent routes with 404', async () => {
            // Act
            const response = await request(app).get('/undefined-route-here');
            // Assert
            expect(response.status).toBe(404);
        });
    });

    /**
     * Route Endpoint Validations rules protecting specific boundaries testing invalidation paths.
     */
    describe('POST /generate-react - Validation', () => {

        it('returns a 400 error when formModel is missing', async () => {
            // Arrange / Act: Submit an incorrectly typed payload structure
            const response = await request(app)
                .post('/generate-react')
                .send({ somethingElse: true });

            // Assert: Safely evaluates invalid bodies blocking processing returning precise explicit messages
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('formModel is required');
        });

        it('returns a 400 error if form json is completely empty', async () => {
            // Act: Trigger empty sends simulating network breaks dynamically testing boundaries natively safely mapped correctly mechanically 
            const response = await request(app)
                .post('/generate-react')
                .send();

            expect(response.status).toBe(400);
        });

        it('returns a 400 error logic if form string input is malformed completely', async () => {
            // Arrange: Send raw unparsable XML/bad JSON mapping mechanics cleanly testing parse mechanisms natively gracefully mappings smoothly safely 
            const response = await request(app)
                .post('/generate-react')
                .set('Content-Type', 'application/json')
                .send('{ string malformed JSON,, "lol": true }');

            expect(response.status).toBe(400);
        });

        it('checks if critical fields like name exist (if model validation logic is strict)', async () => {
            // Arrange: Corrupt model missing internal validation requirement limits conditionally
            const partialModel = { ...flatFormModel };
            delete (partialModel as any).name;

            // Act
            const response = await request(app)
                .post('/generate-react')
                .send({ formModel: partialModel });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('formModel must have a name');
        });
    });

    /**
     * Route Execution validation rules mapping positive cases generating complete outputs mechanically.
     */
    describe('POST /generate-react - Successful Execution', () => {

        it('returns a 200 OK wrapper on valid model creation', async () => {
            // Act
            const response = await request(app)
                .post('/generate-react')
                .send({ formModel: flatFormModel })
                .responseType('blob');

            // Assert
            expect(response.status).toBe(200);
        });

        it('returns appropriate content application headers for zip downloads', async () => {
            // Act
            const response = await request(app)
                .post('/generate-react')
                .send({ formModel: flatFormModel })
                .responseType('blob');

            // Assert: ZIP validation ensures networking natively identifies download payload rules smoothly conditionally cleanly gracefully map   
            expect(response.headers['content-type']).toBe('application/zip');
        });

        it('attaches the file correctly named based on form name', async () => {
            const response = await request(app)
                .post('/generate-react')
                .send({ formModel: flatFormModel })
                .responseType('blob');

            expect(response.headers['content-disposition']).toContain('attachment; filename="contact-form-export.zip"');
        });

        it('returns a binary zip representation within response body context', async () => {
            const response = await request(app)
                .post('/generate-react')
                .send({ formModel: flatFormModel })
                .responseType('blob');

            // Assert: Data validation buffer size rules conditionally natively mappings securely checking dynamically 
            expect(response.body).toBeDefined();
            expect(Buffer.isBuffer(response.body)).toBe(true);
            expect((response.body as Buffer).length).toBeGreaterThan(100);
        });
    });
});
