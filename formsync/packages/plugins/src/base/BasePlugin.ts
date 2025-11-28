/**
 * Base Plugin Class
 * 
 * Abstract base class providing common functionality for all plugins.
 * Handles initialization, configuration, and error handling.
 */

export abstract class BasePlugin {
  protected config: Record<string, any>;
  protected initialized: boolean = false;

  constructor(config: Record<string, any> = {}) {
    this.config = config;
  }

  /**
   * Initialize the plugin with configuration
   * Override this in subclasses for custom initialization
   */
  async initialize(): Promise<void> {
    this.initialized = true;
  }

  /**
   * Check if plugin is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get plugin configuration
   */
  getConfig(): Record<string, any> {
    return { ...this.config };
  }

  /**
   * Update plugin configuration
   */
  updateConfig(newConfig: Record<string, any>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
