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
            return str
                .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
                .toLowerCase()
                .replace(/^_/, '');
        });

        handlebars.registerHelper('toKebabCase', (str: string) => {
            return str
                .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
                .toLowerCase()
                .replace(/^-/, '');
        });

        handlebars.registerHelper('capitalizeFirst', (str: string) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        });

        handlebars.registerHelper('eq', function (this: any, arg1, arg2, options) {
            return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
        });

        handlebars.registerHelper('toPackagePath', (pkg: string) => {
            return pkg ? pkg.replace(/\./g, '/') : '';
        });

        handlebars.registerHelper('exampleValue', (type: DataType) => {
            switch (type) {
                case DataType.STRING: return '"example"';
                case DataType.INTEGER: return '0';
                case DataType.LONG: return '0';
                case DataType.DOUBLE: return '0.0';
                case DataType.BOOLEAN: return 'true';
                case DataType.BIG_DECIMAL: return '0.0';
                case DataType.LOCAL_DATE: return '"2026-01-01"';
                case DataType.LOCAL_DATE_TIME: return '"2026-01-01T00:00:00"';
                case DataType.LIST: return '[]';
                case DataType.SET: return '[]';
                case DataType.MAP: return '{}';
                case DataType.OBJECT: return '{}';
                case DataType.ENUM: return '"VALUE"';
                default: return '""';
            }
        });

        handlebars.registerHelper('validationSummary', (constraints: any) => {
            if (!constraints) return '—';
            const parts: string[] = [];
            if (constraints.notBlank) parts.push('Not blank');
            if (constraints.email) parts.push('Valid email');
            if (constraints.min !== undefined) parts.push(`Min: ${constraints.min}`);
            if (constraints.max !== undefined) parts.push(`Max: ${constraints.max}`);
            if (constraints.minLength !== undefined || constraints.maxLength !== undefined) {
                const min = constraints.minLength ?? '0';
                const max = constraints.maxLength ?? '∞';
                parts.push(`Length: ${min}–${max}`);
            }
            if (constraints.pattern) parts.push(`Pattern: \`${constraints.pattern}\``);
            return parts.length > 0 ? parts.join(', ') : '—';
        });

        handlebars.registerHelper('toJavaType', (type: DataType, referenceType?: string) => {
            switch (type) {
                case DataType.STRING: return 'String';
                case DataType.INTEGER: return 'Integer';
                case DataType.LONG: return 'Long';
                case DataType.DOUBLE: return 'Double';
                case DataType.BOOLEAN: return 'Boolean';
                case DataType.BIG_DECIMAL: return 'BigDecimal';
                case DataType.LOCAL_DATE: return 'LocalDate';
                case DataType.LOCAL_DATE_TIME: return 'LocalDateTime';
                case DataType.OBJECT: return referenceType || 'Object';
                case DataType.ENUM: return referenceType || 'String';
                case DataType.LIST: return `List<${referenceType || 'String'}>`;
                case DataType.SET: return `Set<${referenceType || 'String'}>`;
                case DataType.MAP: return `Map<String, ${referenceType || 'Object'}>`;
                default: return 'String';
            }
        });
    }

    private loadTemplates() {
        const templatesDir = path.resolve(__dirname, '../templates');

        // Project config
        this.loadTemplate('pom', path.join(templatesDir, 'pom.hbs'));
        this.loadTemplate('application-yml', path.join(templatesDir, 'application-yml.hbs'));

        // Java source
        this.loadTemplate('application', path.join(templatesDir, 'java/application.hbs'));
        this.loadTemplate('entity', path.join(templatesDir, 'java/entity.hbs'));
        this.loadTemplate('dto-request', path.join(templatesDir, 'java/dto-request.hbs'));
        this.loadTemplate('dto-response', path.join(templatesDir, 'java/dto-response.hbs'));
        this.loadTemplate('enum', path.join(templatesDir, 'java/enum.hbs'));
        this.loadTemplate('repository', path.join(templatesDir, 'java/repository.hbs'));
        this.loadTemplate('service', path.join(templatesDir, 'java/service.hbs'));
        this.loadTemplate('controller', path.join(templatesDir, 'java/controller.hbs'));

        // Exception handling
        this.loadTemplate('not-found-exception', path.join(templatesDir, 'java/not-found-exception.hbs'));
        this.loadTemplate('api-error', path.join(templatesDir, 'java/api-error.hbs'));
        this.loadTemplate('exception-handler', path.join(templatesDir, 'java/exception-handler.hbs'));

        // README
        this.loadTemplate('readme', path.join(templatesDir, 'readme.hbs'));
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
            throw new Error(`Template "${templateName}" not found`);
        }
        return template(data);
    }
}
