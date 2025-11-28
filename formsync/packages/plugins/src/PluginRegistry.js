"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginRegistry = void 0;
class PluginRegistry {
    constructor() {
        this.parsers = new Map();
        this.validators = new Map();
        this.llmProviders = new Map();
    }
    static getInstance() {
        if (!PluginRegistry.instance) {
            PluginRegistry.instance = new PluginRegistry();
        }
        return PluginRegistry.instance;
    }
    registerParser(plugin) {
        this.parsers.set(plugin.name, plugin);
        console.log(`[PluginRegistry] Registered parser: ${plugin.name}`);
    }
    registerValidator(plugin) {
        this.validators.set(plugin.name, plugin);
        console.log(`[PluginRegistry] Registered validator: ${plugin.name}`);
    }
    registerLLMProvider(plugin) {
        this.llmProviders.set(plugin.name, plugin);
        console.log(`[PluginRegistry] Registered LLM provider: ${plugin.name}`);
    }
    getParser(name) {
        return this.parsers.get(name);
    }
    getAllParsers() {
        return Array.from(this.parsers.values());
    }
    getValidator(name) {
        return this.validators.get(name);
    }
    getAllValidators() {
        return Array.from(this.validators.values());
    }
    getLLMProvider(name) {
        return this.llmProviders.get(name);
    }
    getAllLLMProviders() {
        return Array.from(this.llmProviders.values());
    }
    detectParser(input) {
        for (const parser of this.parsers.values()) {
            if (parser.canParse(input)) {
                return parser;
            }
        }
        return undefined;
    }
    clear() {
        this.parsers.clear();
        this.validators.clear();
        this.llmProviders.clear();
    }
    getStats() {
        return {
            parsers: this.parsers.size,
            validators: this.validators.size,
            llmProviders: this.llmProviders.size,
        };
    }
}
exports.PluginRegistry = PluginRegistry;
//# sourceMappingURL=PluginRegistry.js.map