import { PluginRegistry } from '@formsync/plugins';
import { BackendGenerator } from './generator/BackendGenerator';

console.log('Starting Backend DTO Generator...');

const registry = PluginRegistry.getInstance();
const generator = new BackendGenerator();

// Register the plugin (assuming registry has a method for this, or just demonstrate usage)
// For now, we'll just demonstrate direct usage as the registry might need more setup
// In a real scenario: registry.register('backend-generator', generator);

(async () => {
    try {
        await generator.initialize();
        await generator.generate({ test: 'schema' }, { outputDir: './output' });
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();

console.log('Backend DTO Generator finished.');
