import { Injectable, Logger } from '@nestjs/common';
import archiver = require('archiver');
import {
    registry,
    FormModel,
    ReactViteExportPlugin,
    TextPlugin,
    EmailPlugin,
    NumberPlugin,
    PasswordPlugin,
    TextareaPlugin,
    CheckboxPlugin,
    SelectPlugin,
    VerticalLayoutPlugin,
    CssVariablesThemePlugin
} from '@formsync/formgen-core';

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);

    constructor() {
        // Register Core Plugins
        // This ensures the export service knows how to handle these fields
        [
            TextPlugin,
            EmailPlugin,
            NumberPlugin,
            PasswordPlugin,
            TextareaPlugin,
            CheckboxPlugin,
            SelectPlugin,
            VerticalLayoutPlugin,
            CssVariablesThemePlugin
        ].forEach(p => registry.register(p));

        registry.register(new ReactViteExportPlugin(registry));
    }

    async generateReactViteZip(formModel: FormModel): Promise<NodeJS.ReadableStream> {
        try {
            this.logger.log(`Starting export for form: ${formModel.title}`);
            const archive = archiver('zip', { zlib: { level: 9 } });

            // 1. Get plugin
            const plugin = registry.get<ReactViteExportPlugin>('export', 'react-vite-export');
            if (!plugin) {
                throw new Error('React Vite export plugin not found');
            }

            // 2. Generate artifact files in memory
            const artifacts = await plugin.generate(formModel);

            // 3. Add to archive
            artifacts.forEach(file => {
                archive.append(file.content, { name: file.path });
            });

            // 4. Add template files
            const path = require('path');
            const fs = require('fs');

            // Potential paths to search for templates
            const searchPaths = [
                process.env.TEMPLATE_DIR,
                path.join(process.cwd(), 'packages/formgen-templates/react-vite'),
                path.join(process.cwd(), '../packages/formgen-templates/react-vite'), // In case cwd is apps/formgen-api
                path.resolve(__dirname, '../../../../packages/formgen-templates/react-vite'), // From dist/apps/formgen-api/src/modules/export...
                path.resolve(__dirname, '../../../../../packages/formgen-templates/react-vite'), // Extra safe
            ].filter(Boolean) as string[];

            let absoluteTemplatePath = '';
            for (const p of searchPaths) {
                if (fs.existsSync(p) && fs.existsSync(path.join(p, 'package.json'))) {
                    absoluteTemplatePath = p;
                    break;
                }
            }

            this.logger.log(`Template search paths: ${JSON.stringify(searchPaths)}`);

            if (!absoluteTemplatePath) {
                this.logger.error(`Template directory not found. Searched in: ${searchPaths.join(', ')}`);
                // Create a dummy package.json so user at least can run npm install (though it will fail to do much)
                // Or better, warnings.
                this.logger.warn('ZIP generated without templates.');
            } else {
                this.logger.log(`Found templates at: ${absoluteTemplatePath}`);
                archive.directory(absoluteTemplatePath, false, (entry) => {
                    return entry.name.includes('node_modules') ? false : entry;
                });
            }

            await archive.finalize();
            return archive;
        } catch (error) {
            this.logger.error('Export failed', error instanceof Error ? error.stack : error);
            throw error; // Rethrow to let controller handle 500
        }
    }
}
