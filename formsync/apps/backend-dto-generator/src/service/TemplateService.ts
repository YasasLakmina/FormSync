
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { DataType } from '../model/InternalModel';

export class TemplateService {
    private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor() {
        this.registerHelpers();
        this.loadTemplates();
    }

    private registerHelpers() {
        handlebars.registerHelper('toSnakeCase', (str: string) => {
            return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).toLowerCase().replace(/^_/, '');
        });

        handlebars.registerHelper('toKebabCase', (str: string) => {
            return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).toLowerCase().replace(/^-/, '');
        });

        handlebars.registerHelper('eq', function (this: any, arg1, arg2, options) {
            return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
        });

        handlebars.registerHelper('toJavaType', (type: DataType, referenceType?: string) => {
            switch (type) {
                case DataType.STRING: return 'String';
                case DataType.INTEGER: return 'Integer';
                case DataType.LONG: return 'Long';
                case DataType.DOUBLE: return 'Double';
                case DataType.BOOLEAN: return 'Boolean';
                case DataType.LOCAL_DATE: return 'java.time.LocalDate';
                case DataType.LOCAL_TIME_TIME: return 'java.time.LocalDateTime';
                case DataType.OBJECT: return referenceType || 'Object';
                case DataType.ENUM: return referenceType || 'String';
                case DataType.LIST: return `List<${referenceType || 'String'}>`; // simplified
                case DataType.SET: return `Set<${referenceType || 'String'}>`;
                case DataType.MAP: return `Map<String, ${referenceType || 'Object'}>`;
                default: return 'String';
            }
        });
    }

    private loadTemplates() {
        // In a real app, strict paths would be better. For now assuming execution from project root or similar
        const templatesDir = path.resolve(__dirname, '../templates');

        this.loadTemplate('entity', path.join(templatesDir, 'java/entity.hbs'));
        this.loadTemplate('repository', path.join(templatesDir, 'java/repository.hbs'));
        this.loadTemplate('service', path.join(templatesDir, 'java/service.hbs'));
        this.loadTemplate('controller', path.join(templatesDir, 'java/controller.hbs'));
        this.loadTemplate('pom', path.join(templatesDir, 'pom.hbs'));
    }

    private loadTemplate(name: string, filePath: string) {
        if (fs.existsSync(filePath)) {
            const source = fs.readFileSync(filePath, 'utf-8');
            this.templates.set(name, handlebars.compile(source));
        } else {
            console.warn(`Template not found: ${filePath}`);
        }
    }

    public render(templateName: string, data: any): string {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }
        return template(data);
    }
}
