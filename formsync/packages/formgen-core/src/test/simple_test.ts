import { parseJsonSchemaToFormModel, JsonSchema } from '../adapters/json-schema.adapter';

const simpleSchema: JsonSchema = {
    $id: 'simple-form',
    title: 'Simple Form',
    type: 'object',
    properties: {
        settings: {
            type: 'object',
            title: 'Settings',
            properties: {
                enabled: { type: 'boolean' }
            }
        }
    }
};

const formModel = parseJsonSchemaToFormModel(simpleSchema);

console.log(JSON.stringify(formModel.fields, null, 2));
