import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { BackendGenerator } from './BackendGenerator';

describe('BackendGenerator', () => {
    let generator: BackendGenerator;
    let tempDir: string;

    beforeEach(() => {
        generator = new BackendGenerator();
        tempDir = path.join(os.tmpdir(), `formsync-gen-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    });

    afterEach(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true });
        }
    });

    it('should generate pom.xml and entity/repository/service/controller for root entity', async () => {
        const schema = {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' }
            }
        };

        await generator.generate(schema, { outputDir: tempDir });

        expect(fs.existsSync(path.join(tempDir, 'pom.xml'))).toBe(true);

        const packagePath = 'com/app';
        const modelDir = path.join(tempDir, 'src', 'main', 'java', packagePath, 'model');
        const repoDir = path.join(tempDir, 'src', 'main', 'java', packagePath, 'repository');
        const serviceDir = path.join(tempDir, 'src', 'main', 'java', packagePath, 'service');
        const controllerDir = path.join(tempDir, 'src', 'main', 'java', packagePath, 'controller');

        expect(fs.existsSync(path.join(modelDir, 'ExampleApp.java'))).toBe(true);
        expect(fs.existsSync(path.join(repoDir, 'ExampleAppRepository.java'))).toBe(true);
        expect(fs.existsSync(path.join(serviceDir, 'ExampleAppService.java'))).toBe(true);
        expect(fs.existsSync(path.join(controllerDir, 'ExampleAppController.java'))).toBe(true);

        const entityContent = fs.readFileSync(path.join(modelDir, 'ExampleApp.java'), 'utf-8');
        expect(entityContent).toContain('public class ExampleApp');
        expect(entityContent).toContain('package com.app.model');
    });

    it('should use schema name and content when provided (SchemaPayload shape)', async () => {
        const schema = {
            name: 'MyApp',
            content: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            }
        };

        await generator.generate(schema, { outputDir: tempDir });

        const packagePath = 'com/myapp';
        const modelDir = path.join(tempDir, 'src', 'main', 'java', packagePath, 'model');
        expect(fs.existsSync(path.join(modelDir, 'MyApp.java'))).toBe(true);

        const entityContent = fs.readFileSync(path.join(modelDir, 'MyApp.java'), 'utf-8');
        expect(entityContent).toContain('public class MyApp');
    });

    it('should respect config.basePackage', async () => {
        const schema = {
            name: 'Order',
            content: {
                type: 'object',
                properties: { id: { type: 'string' } }
            }
        };

        await generator.generate(schema, {
            outputDir: tempDir,
            basePackage: 'com.company.orders'
        });

        const packagePath = 'com/company/orders';
        const modelDir = path.join(tempDir, 'src', 'main', 'java', packagePath, 'model');
        expect(fs.existsSync(path.join(modelDir, 'Order.java'))).toBe(true);

        const entityContent = fs.readFileSync(path.join(modelDir, 'Order.java'), 'utf-8');
        expect(entityContent).toContain('package com.company.orders.model');
    });

    it('should reject when generation fails (invalid schema)', async () => {
        const invalidSchema = {
            name: 'Bad',
            content: {
                get type() {
                    throw new Error('Invalid schema');
                },
            },
        };

        await expect(generator.generate(invalidSchema as any, { outputDir: tempDir })).rejects.toThrow('Invalid schema');
    });
});
