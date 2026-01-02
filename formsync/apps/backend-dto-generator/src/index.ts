import { PluginRegistry } from '@formsync/plugins';
import { BackendGenerator } from './generator/BackendGenerator';

console.log('Starting Backend DTO Generator...');

const generator = new BackendGenerator();

// Sample Schema (mimicking InputContract)
const sampleSchema = {
    name: 'UserManagement',
    version: '1.0.0',
    content: {
        type: 'object',
        properties: {
            User: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    email: { type: 'string' },
                    age: { type: 'integer' }
                },
                required: ['username', 'email']
            }
        }
    }
};

(async () => {
    try {
        await generator.initialize();
        // Generate into a 'demo-output' folder in the current directory
        await generator.generate(sampleSchema, { outputDir: './demo-output' });
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();

console.log('Backend DTO Generator finished.');
