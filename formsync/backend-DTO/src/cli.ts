import { generateBackendFromSchema, createBackendZip, EntitySchema } from './index';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: ts-node src/cli.ts <schema-file.json> [output.zip]');
        process.exit(1);
    }

    const schemaPath = path.resolve(args[0]);
    if (!fs.existsSync(schemaPath)) {
        console.error(`Error: Schema file not found at ${schemaPath}`);
        process.exit(1);
    }

    let schema: EntitySchema;
    try {
        const fileContent = fs.readFileSync(schemaPath, 'utf8');
        schema = JSON.parse(fileContent);
    } catch (e) {
        console.error('Error: Failed to parse schema JSON', e);
        process.exit(1);
    }

    console.log(`Generating backend for entity: ${schema.entityName}...`);
    const result = await generateBackendFromSchema(schema);
    const zipBuffer = await createBackendZip(result);

    const outPath = args[1] ? path.resolve(args[1]) : path.join(process.cwd(), `backend-${schema.entityName}.zip`);
    fs.writeFileSync(outPath, zipBuffer);

    console.log(`Success! Generated zip at: ${outPath}`);
}

run().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
