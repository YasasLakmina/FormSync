/**
 * Local type definitions for backend-dto-generator.
 *
 * Inlined from packages/plugins so this service has zero shared-package coupling.
 */

export abstract class BasePlugin {
  protected config: Record<string, any>;
  protected initialized: boolean = false;

  constructor(config: Record<string, any> = {}) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig(): Record<string, any> {
    return { ...this.config };
  }

  updateConfig(newConfig: Record<string, any>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export interface BackendGeneratorConfig {
  outputDir: string;
  [key: string]: any;
}

export interface BackendGeneratorPlugin extends BasePlugin {
  generate(schema: any, config?: BackendGeneratorConfig): Promise<void>;
}
