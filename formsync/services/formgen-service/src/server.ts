/**
 * formgen-service — React Code Generator Microservice
 *
 * Exposes react-generator and templates as a REST API.
 * Previously this logic ran client-side in formgen-ui; it now runs here.
 *
 * Port: 3003
 *
 * Endpoints:
 *   POST /generate-react  — accepts a FormModel, returns a React app ZIP
 *   GET  /health          — health check
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import archiver from 'archiver';
import { FormModel } from './types';
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
} from './generators';

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

/**
 * POST /generate-react
 * Body: { formModel: FormModel }
 * Response: ZIP blob containing a complete standalone Vite + React app
 */
app.post('/generate-react', async (req, res) => {
    const { formModel }: { formModel: FormModel } = req.body;

    if (!formModel) {
        return res.status(400).json({ error: 'formModel is required' });
    }

    const requestId = crypto.randomUUID();
    const tempDir = path.join(os.tmpdir(), `formgen-react-${requestId}`);

    console.log(`[${requestId}] Generating React app for form: "${formModel.name}"`);

    try {
        await fs.ensureDir(tempDir);
        await fs.ensureDir(path.join(tempDir, 'src'));

        // Generate all project files
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

        // Write all files to temp dir
        for (const [filePath, content] of Object.entries(files)) {
            const fullPath = path.join(tempDir, filePath);
            await fs.ensureDir(path.dirname(fullPath));
            await fs.writeFile(fullPath, content, 'utf8');
        }

        // Zip and stream back
        const projectName = formModel.name.toLowerCase().replace(/\s+/g, '-');
        res.attachment(`${projectName}-export.zip`);
        res.setHeader('Content-Type', 'application/zip');

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);
        archive.directory(tempDir, false);
        archive.finalize();

        res.on('finish', () => {
            fs.remove(tempDir).catch(err =>
                console.error(`[${requestId}] Cleanup failed:`, err)
            );
            console.log(`[${requestId}] Done.`);
        });

    } catch (error: any) {
        console.error(`[${requestId}] Generation failed:`, error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Generation failed', message: error.message });
        }
        fs.remove(tempDir).catch(() => { });
    }
});

/**
 * GET /health
 */
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'formgen-service', uptime: process.uptime() });
});

app.listen(port, () => {
    console.log(`🚀 formgen-service listening at http://localhost:${port}`);
    console.log(`   POST /generate-react  — Generate a standalone React app ZIP`);
    console.log(`   GET  /health          — Health check`);
});
