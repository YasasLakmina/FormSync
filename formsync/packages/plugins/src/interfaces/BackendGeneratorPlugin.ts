import { BasePlugin } from '../base/BasePlugin';

export interface BackendGeneratorPlugin extends BasePlugin {
    type: 'generator';
    name: string;

    /**
     * Generate backend artifacts from the given schema
     */
    generate(schema: any): Promise<any>;
}
