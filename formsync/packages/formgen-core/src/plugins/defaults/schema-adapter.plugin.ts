import { SchemaAdapterPlugin } from '../interfaces';
import { FormModel, FieldModel, ValidationConstraint } from '../../models';
import { v4 as uuidv4 } from 'uuid'; // need uuid lib or simple random

// Simple ID generator if uuid not available
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

export class JsonSchemaAdapterPlugin implements SchemaAdapterPlugin {
    name = 'json-schema-adapter';
    version = '1.0.0';
    type = 'schema-adapter' as const;
    sourceFormat = 'json-schema-draft-7';

    transform(schema: any): FormModel {
        const fields: FieldModel[] = [];
        const properties = schema.properties || {};
        const required = new Set(schema.required || []);

        // Simple order: 'x-ui.order' or definition order
        const keys = Object.keys(properties);

        // Sort keys based on x-ui order if present? 
        // For PP1, let's just use definition order or support simple x-ui.order sorting later.

        keys.forEach(key => {
            const prop = properties[key];
            const ui = prop['x-ui'] || {};

            const constraints: ValidationConstraint[] = [];
            if (required.has(key)) constraints.push({ type: 'required' });
            if (prop.minLength !== undefined) constraints.push({ type: 'minLength', value: prop.minLength });
            if (prop.maxLength !== undefined) constraints.push({ type: 'maxLength', value: prop.maxLength });
            if (prop.minimum !== undefined) constraints.push({ type: 'min', value: prop.minimum });
            if (prop.maximum !== undefined) constraints.push({ type: 'max', value: prop.maximum });
            if (prop.pattern !== undefined) constraints.push({ type: 'pattern', value: prop.pattern });
            if (prop.format === 'email') constraints.push({ type: 'email' });

            // Map type/format to widget/field kind
            let type = 'text'; // default
            if (prop.type === 'boolean') type = 'checkbox';
            else if (prop.enum) type = 'select'; // basic enum
            else if (prop.type === 'string') {
                if (prop.format === 'email') type = 'email';
                else if (ui.widget === 'textarea') type = 'textarea';
            }

            // Extract options for enum
            let options;
            if (prop.enum) {
                options = prop.enum.map((v: any) => ({ label: v.toString(), value: v.toString() }));
            }

            fields.push({
                id: generateId(),
                key,
                type,
                constraints,
                ui: {
                    label: prop.title || key,
                    placeholder: ui.placeholder,
                    helpText: prop.description,
                    widget: ui.widget,
                    variant: ui.variant,
                    size: ui.size,
                    options
                }
            });
        });

        return {
            id: schema['$id'] || generateId(),
            title: schema.title || 'Untitled Form',
            version: '1.0.0',
            fields,
            layout: {
                type: 'vertical',
                order: fields.map(f => f.id)
            },
            ui: {
                variant: 'outlined',
                size: 'md'
            },
            theme: {
                colors: {
                    primary: '#0f172a', // slate-900
                    background: '#ffffff',
                    text: '#020817', // slate-950
                    error: '#ef4444',
                    border: '#e2e8f0'
                },
                spacing: {
                    base: '1rem',
                    gap: '1.5rem'
                },
                borderRadius: {
                    base: '0.5rem'
                },
                typography: {
                    fontFamily: 'Inter, sans-serif',
                    baseSize: '16px'
                }
            }
        };
    }
}
