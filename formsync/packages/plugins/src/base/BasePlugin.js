"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlugin = void 0;
class BasePlugin {
    constructor(config = {}) {
        this.initialized = false;
        this.config = config;
    }
    async initialize() {
        this.initialized = true;
    }
    isInitialized() {
        return this.initialized;
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}
exports.BasePlugin = BasePlugin;
//# sourceMappingURL=BasePlugin.js.map