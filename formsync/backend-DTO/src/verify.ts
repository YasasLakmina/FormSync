import { generateBackendFromSchema, createBackendZip, EntitySchema } from './index';
import * as fs from 'fs';
import * as path from 'path';

const sampleSchema: EntitySchema = {
    entityName: 'UserProfile',
    packageName: 'com.company.project',
    tableName: 'user_profiles',
    fields: [
        {
            name: 'id',
            type: 'UUID',
            nullable: false,
            primaryKey: true,
            validations: { generated: 'UUID' }
        },
        {
            name: 'email',
            type: 'STRING',
            nullable: false,
            isPII: true,
            validations: { format: 'EMAIL' }
        },
        {
            name: 'bio',
            type: 'STRING',
            nullable: true,
            allowHtml: false,
            maxLength: 500
        }
    ]
};

async function run() {
    console.log('Generating backend...');
    const result = await generateBackendFromSchema(sampleSchema);

    console.log('Model generated:', result.model.filename);
    console.log('DTO generated:', result.dto.filename);
    console.log('Common artifacts:', result.commonArtifacts.map(a => a.filename).join(', '));

    console.log('Creating ZIP...');
    const zipBuffer = await createBackendZip(result);

    const outDir = path.join(__dirname, '../dist_test');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    const zipPath = path.join(outDir, 'backend.zip');
    fs.writeFileSync(zipPath, zipBuffer);

    console.log(`Success! Zip written to ${zipPath}`);
}

run().catch(console.error);
