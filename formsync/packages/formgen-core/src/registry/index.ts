import { FormGenPlugin, FieldPlugin, LayoutPlugin, ThemePlugin, ExportPlugin } from '../plugins/interfaces';

export class PluginRegistry {
    private plugins: Map<string, FormGenPlugin> = new Map();

    register(plugin: FormGenPlugin): void {
        const key = `${plugin.type}:${plugin.name}`;
        if (this.plugins.has(key)) {
            console.warn(`Overwriting plugin ${key}`);
        }
        this.plugins.set(key, plugin);
    }

    get<T extends FormGenPlugin>(type: string, name: string): T | undefined {
        return this.plugins.get(`${type}:${name}`) as T;
    }

    getFieldPlugin(fieldType: string): FieldPlugin | undefined {
        // Naive lookup: finding a plugin that claims this fieldType
        // In reality, might assume plugin name == field type for simplicity
        return this.get<FieldPlugin>('field', fieldType);
    }

    getAllFieldPlugins(): FieldPlugin[] {
        return Array.from(this.plugins.values())
            .filter(p => p.type === 'field') as FieldPlugin[];
    }
}

export const registry = new PluginRegistry();
