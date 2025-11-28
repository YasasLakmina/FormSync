export declare abstract class BasePlugin {
    protected config: Record<string, any>;
    protected initialized: boolean;
    constructor(config?: Record<string, any>);
    initialize(): Promise<void>;
    isInitialized(): boolean;
    getConfig(): Record<string, any>;
    updateConfig(newConfig: Record<string, any>): void;
}
