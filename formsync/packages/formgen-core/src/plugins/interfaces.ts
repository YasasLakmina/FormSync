import { FormModel, FieldModel } from '../models';

export interface CodeGeneratorContext {
    form: FormModel;
    // helpers to register imports, etc.
}

export interface PluginMetadata {
    name: string;
    version: string;
    description?: string;
}

export interface FieldPlugin extends PluginMetadata {
    type: 'field';
    fieldType: string; // Matches FieldModel.type or specific widget

    // Return the runtime component name (e.g., "Input", "Select")
    componentName: string;

    // Generate code for this field
    generateCode(field: FieldModel, ctx: CodeGeneratorContext): string;

    // Generate Zod validation schema fragment
    generateValidation(field: FieldModel): string;

    // React component for preview (optional/generic often used)
    // For now, in core, we just define the contract. 
    // The UI will likely need a mapping, or this plugin needs to return a render function string? 
    // Let's keep it simple: core is ensuring code generation. 
}

export interface LayoutPlugin extends PluginMetadata {
    type: 'layout';
    layoutType: string;

    // Given a form model, return how it wraps fields
    generateLayout(fieldsCode: string[], form: FormModel): string;
}

export interface ThemePlugin extends PluginMetadata {
    type: 'theme';

    // Generate CSS content
    generateCss(theme: FormModel['theme']): string;
}

export interface ArtifactFile {
    path: string;
    content: string;
}

export interface ExportPlugin extends PluginMetadata {
    type: 'export';
    target: string; // e.g., 'react-vite'

    generate(form: FormModel): Promise<ArtifactFile[]>;
}

export interface SchemaAdapterPlugin extends PluginMetadata {
    type: 'schema-adapter';
    sourceFormat: string; // e.g., 'json-schema-draft-7'

    transform(schema: any): FormModel;
}

export type FormGenPlugin = FieldPlugin | LayoutPlugin | ThemePlugin | ExportPlugin | SchemaAdapterPlugin;
