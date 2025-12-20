import { parseJsonSchemaToFormModel, JsonSchema } from '../adapters/json-schema.adapter';

const nestedSchema: JsonSchema = {
    $id: 'nested-form',
    title: 'Nested Form',
    type: 'object',
    properties: {
        fullName: { type: 'string' },
        address: {
            type: 'object',
            title: 'Address Info',
            properties: {
                city: { type: 'string' },
                zip: { type: 'string' }
            },
            required: ['city']
        }
    },
    required: ['fullName']
};

const formModel = parseJsonSchemaToFormModel(nestedSchema);

console.log('Top level fields:', formModel.fields.map(f => `${f.key} (${f.type})`));

const hasAddress = formModel.fields.find(f => f.key === 'address');

if (hasAddress && hasAddress.type === 'group') {
    console.log('SUCCESS: "address" group found.');
    if (hasAddress.children && hasAddress.children.length === 2) {
        console.log('SUCCESS: "address" group has 2 children.');
        console.log('Children:', hasAddress.children.map(c => c.key));
    } else {
        console.error('FAIL: Children incorrect.');
        process.exit(1);
    }
} else {
    console.error('FAIL: Missing group field.');
    process.exit(1);
}
