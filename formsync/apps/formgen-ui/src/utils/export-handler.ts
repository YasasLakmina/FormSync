/**
 * Export Handler - ZIP Packaging and Download
 * 
 * Client-side orchestration for exporting React app
 * Uses jszip to package files and file-saver to trigger download
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FormModel } from '@formsync/formgen-core';
import {
    generateAppTsx,
    generatePackageJson,
    generateViteConfig,
    generateTsConfig,
    generateTsConfigNode,
    generateIndexHtml,
    generateMainTsx,
    generateIndexCss,
    generateReadme,
} from '@formsync/formgen-core';

/**
 * Export the form as a downloadable React app ZIP
 */
export async function exportReactApp(formModel: FormModel): Promise<void> {
    try {
        console.log('[Export] Starting React app export for:', formModel.name);

        // Create ZIP instance
        const zip = new JSZip();

        // Generate all files
        const files = {
            'package.json': generatePackageJson(formModel),
            'vite.config.ts': generateViteConfig(),
            'tsconfig.json': generateTsConfig(),
            'tsconfig.node.json': generateTsConfigNode(),
            'index.html': generateIndexHtml(formModel),
            'README.md': generateReadme(formModel),
            'src/main.tsx': generateMainTsx(),
            'src/App.tsx': generateAppTsx(formModel),
            'src/index.css': generateIndexCss(formModel),
        };

        // Add each file to ZIP
        for (const [path, content] of Object.entries(files)) {
            console.log(`[Export] Adding file: ${path}`);
            zip.file(path, content);
        }

        // Generate .gitignore
        zip.file('.gitignore', `# Dependencies
node_modules

# Build output
dist
dist-ssr
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`);

        console.log('[Export] Generating ZIP blob...');

        // Generate ZIP blob
        const blob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });

        // Trigger download
        const filename = `${formModel.name.toLowerCase().replace(/\s+/g, '-')}-export.zip`;
        console.log(`[Export] Downloading as: ${filename}`);

        saveAs(blob, filename);

        console.log('[Export] Export complete!');
    } catch (error) {
        console.error('[Export] Export failed:', error);
        throw new Error(`Failed to export React app: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
