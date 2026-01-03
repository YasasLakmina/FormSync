import { BasePlugin } from '../base/BasePlugin';
export interface BackendGeneratorConfig {
    outputDir: string;
    [key: string]: any;
}
export interface BackendGeneratorPlugin extends BasePlugin {
    generate(schema: any, config?: BackendGeneratorConfig): Promise<void>;
}
//# sourceMappingURL=BackendGeneratorPlugin.d.ts.map