import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import JSZip from 'jszip';
import { generateBackendFromSchema, createBackendZip, EntitySchema, GeneratedArtifact } from './index';
import { PluginRegistry } from '@formsync/plugins';
import { SpringBootGeneratorPlugin } from './plugins/SpringBootGeneratorPlugin';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to Backend-DTO Generator API. Use POST /generate to create backend code.');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', component: 'backend-dto-generator' });
});

// Register standard plugins
const registry = PluginRegistry.getInstance();
const springBootPlugin = new SpringBootGeneratorPlugin();
registry.registerGenerator(springBootPlugin);

app.post('/generate', async (req: Request, res: Response): Promise<void> => {
    try {
        const schema = req.body as EntitySchema;
        if (!schema || !schema.entityName || !schema.fields) {
            res.status(400).json({ error: 'Invalid schema. entityName and fields are required.' });
            return;
        }

        console.log(`Received generation request for ${schema.entityName}`);

        // Use plugin system
        const generator = registry.getGenerator('spring-boot-generator');
        if (!generator) {
            throw new Error('Default generator (spring-boot-generator) not found in registry');
        }

        const result = await generator.generate(schema);
        const zipBuffer = await createBackendZip(result);

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=backend-${schema.entityName}.zip`);
        res.set('Content-Length', zipBuffer.length.toString());

        res.send(zipBuffer);

    } catch (error) {
        console.error('Generation failed:', error);
        res.status(500).json({ error: 'Generation failed', details: (error as Error).message });
    }
});

app.post('/generate/all', async (req: Request, res: Response): Promise<void> => {
    try {
        const schema = req.body.schema as EntitySchema;
        if (!schema || !schema.entityName || !schema.fields) {
            res.status(400).json({ error: 'Invalid schema. entityName and fields are required.' });
            return;
        }

        console.log(`Received UI preview generation request for ${schema.entityName}`);

        // Use plugin system
        const generator = registry.getGenerator('spring-boot-generator');
        if (!generator) {
            throw new Error('Default generator not found');
        }

        const result = await generator.generate(schema);

        // Map internal result structure to UI response format
        // This mapping logic remains here as the plugin returns the raw internal structure

        const formatArtifact = (a: GeneratedArtifact) => `// --- ${a.filename} ---\n${a.content}\n\n`;
        const formatArtifacts = (list: GeneratedArtifact[]) => list.map(formatArtifact).join("");

        let backendCode = "";
        if (result.model) backendCode += formatArtifact(result.model);
        if (result.repository) backendCode += formatArtifact(result.repository);
        if (result.service) backendCode += formatArtifact(result.service);

        // commonArtifacts is an array
        if (result.commonArtifacts) backendCode += formatArtifacts(result.commonArtifacts);

        let dtoCode = "";
        if (result.dto) dtoCode += formatArtifact(result.dto);

        const responseData = {
            frontend: "// Frontend generation is not supported by this backend service.",
            backend: backendCode,
            dtos: dtoCode,
            tests: "// Tests generation is not supported by this backend service."
        };
        res.json(responseData);
    } catch (error) {
        console.error('UI Generation failed:', error);
        res.status(500).json({ error: 'Generation failed', details: (error as Error).message });
    }
});

app.listen(port, () => {
    console.log(`Backend-DTO Generator Server running on http://localhost:${port}`);
    console.log(`POST /generate with JSON body to get a zip file.`);
});
