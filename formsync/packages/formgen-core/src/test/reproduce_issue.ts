
import { parseJsonSchemaToFormModel } from '../adapters/json-schema.adapter';
import { JsonSchema } from '../adapters/json-schema.adapter';

const nestedSchema: JsonSchema = {
    $id: 'nested-form',
    title: 'Nested Form',
    type: 'object',
    properties: {
        personal: {
            type: 'object',
            title: 'Personal Info',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' }
            }
        },
        address: {
            type: 'object',
            title: 'Address',
            properties: {
                street: { type: 'string' },
                city: { type: 'string' }
            }
        }
    }
};

const formModel = parseJsonSchemaToFormModel(nestedSchema);
console.log(JSON.stringify(formModel, null, 2));

// specific check
const hasPersonal = formModel.fields.find(f => f.key === 'personal');
if (!hasPersonal) {
    console.error('FAIL: "personal" field missing from top level');
} else {
    console.log('Personal field found:', hasPersonal.type);
    if (hasPersonal.type === 'group') {
        console.log('SUCCESS: Personal info is correctly grouped.');
        console.log('Children count:', hasPersonal.children?.length);
    } else {
        console.warn('WARNING: Personal field exists but is not a group (Legacy Flattening?)');
    }
}
