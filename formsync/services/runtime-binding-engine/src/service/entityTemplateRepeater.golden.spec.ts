import { SchemaMapper } from '@formsync/schema-openapi';
import type { SchemaPayload } from '@formsync/schema-openapi';
import { TemplateService } from './TemplateService';

/**
 * Golden checks for Spring JPA entity emission when the schema includes a repeater
 * (JSON Schema array of objects). Guards joinColumns on @ElementCollection and correct
 * PascalCase embeddable names after SchemaMapper.toJavaClassName.
 */
describe('entity template — repeater / ElementCollection', () => {
    const fixture: SchemaPayload = {
        name: 'NewForm',
        version: '1.0.0',
        content: {
            type: 'object',
            properties: {
                fullName: { type: 'string' },
                repeatingTable: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            text: { type: 'string' },
                            textArea: { type: 'string' },
                            number: { type: 'number' },
                        },
                    },
                },
            },
        },
    };

    it('maps array-of-object items to RepeatingTableItem and emits joinColumns + List<T>', () => {
        const mapper = new SchemaMapper();
        const internal = mapper.map(fixture);

        const itemEntity = internal.entities.find((e) => e.name === 'RepeatingTableItem');
        expect(itemEntity).toBeDefined();
        expect(itemEntity!.fields.map((f) => f.name).sort()).toEqual(['number', 'text', 'textArea']);

        const root = internal.entities.find((e) => e.name === 'NewForm');
        expect(root).toBeDefined();
        const rtField = root!.fields.find((f) => f.name === 'repeatingTable');
        expect(rtField?.referenceType).toBe('RepeatingTableItem');

        const templates = new TemplateService();

        const rootJava = templates.render('entity', {
            ...root!,
            basePackage: 'com.example',
            nameLower: 'newForm',
            includeSwagger: false,
            appName: internal.appName,
            version: internal.version,
            description: internal.description,
        });

        expect(rootJava).toContain(
            'joinColumns = @JoinColumn(name = "new_form_id", referencedColumnName = "id")',
        );
        expect(rootJava).toContain('List<RepeatingTableItem>');
        expect(rootJava).toContain('name = "new_form_repeating_table"');

        const itemJava = templates.render('entity', {
            ...itemEntity!,
            basePackage: 'com.example',
            nameLower: 'repeatingTableItem',
            includeSwagger: false,
            appName: internal.appName,
            version: internal.version,
            description: itemEntity!.description,
        });

        expect(itemJava).toContain('@Embeddable');
        expect(itemJava).toContain('class RepeatingTableItem');
        expect(itemJava).toContain('private String text');
        expect(itemJava).toContain('private Double number');
    });

    it('List<String> ElementCollection includes value column for Hibernate basic collections', () => {
        const payload: SchemaPayload = {
            name: 'TagHolder',
            content: {
                type: 'object',
                properties: {
                    tags: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
            },
        };

        const mapper = new SchemaMapper();
        const internal = mapper.map(payload);
        const root = internal.entities.find((e) => e.name === 'TagHolder');
        expect(root?.fields.find((f) => f.name === 'tags')?.referenceType).toBe('String');

        const templates = new TemplateService();
        const java = templates.render('entity', {
            ...root!,
            basePackage: 'com.example',
            nameLower: 'tagHolder',
            includeSwagger: false,
            appName: internal.appName,
            version: internal.version,
            description: internal.description,
        });

        expect(java).toContain(
            'joinColumns = @JoinColumn(name = "tag_holder_id", referencedColumnName = "id")',
        );
        expect(java).toContain('@Column(name = "tags_val")');
        expect(java).toContain('List<String>');
    });

    it('empty repeater row embeddable gets a placeholder column for Hibernate', () => {
        const payload: SchemaPayload = {
            name: 'JobApplication',
            content: {
                type: 'object',
                properties: {
                    repeatingTable: {
                        type: 'array',
                        items: { type: 'object', properties: {} },
                    },
                },
            },
        };

        const mapper = new SchemaMapper();
        const internal = mapper.map(payload);
        const itemEntity = internal.entities.find((e) => e.name === 'RepeatingTableItem');
        expect(itemEntity?.fields.length).toBe(0);

        const templates = new TemplateService();
        const itemJava = templates.render('entity', {
            ...itemEntity!,
            basePackage: 'com.example',
            nameLower: 'repeatingTableItem',
            includeSwagger: false,
            appName: internal.appName,
            version: internal.version,
            description: itemEntity!.description,
        });

        expect(itemJava).toContain('formsyncRowPlaceholder');
        expect(itemJava).toContain('formsync_row_placeholder');
    });
});
