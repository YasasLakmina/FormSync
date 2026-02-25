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

        handlebars.registerHelper('escapeJava', (str: string) => {
            if (!str) return '';
            return str.replace(/\\/g, '\\\\');
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

        handlebars.registerHelper('toEnumConstant', (str: string) => {
            if (!str) return 'UNKNOWN';
            return str
                .replace(/[^a-zA-Z0-9]/g, '_')  // replace spaces, hyphens, etc. with _
                .replace(/_{2,}/g, '_')           // collapse multiple underscores
                .replace(/^_|_$/g, '')            // trim leading/trailing underscores
                .toUpperCase()                    // Java enum constants are UPPER_CASE
                .replace(/^(\d)/, '_$1');          // prefix with _ if starts with digit
        });

        handlebars.registerHelper('toJavaType', (type: DataType, referenceType?: string) => {
            let result: string;
            switch (type) {
                case DataType.STRING: result = 'String'; break;
                case DataType.INTEGER: result = 'Integer'; break;
                case DataType.LONG: result = 'Long'; break;
                case DataType.DOUBLE: result = 'Double'; break;
                case DataType.BOOLEAN: result = 'Boolean'; break;
                case DataType.BIG_DECIMAL: result = 'BigDecimal'; break;
                case DataType.LOCAL_DATE: result = 'LocalDate'; break;
                case DataType.LOCAL_DATE_TIME: result = 'LocalDateTime'; break;
                case DataType.OBJECT: result = referenceType || 'Object'; break;
                case DataType.ENUM: result = referenceType || 'String'; break;
                case DataType.LIST: result = `List<${referenceType || 'String'}>`; break;
                case DataType.SET: result = `Set<${referenceType || 'String'}>`; break;
                case DataType.MAP: result = `Map<String, ${referenceType || 'Object'}>`; break;
                default: result = 'String';
            }
            // Return SafeString to prevent Handlebars from HTML-escaping angle brackets
            // e.g. List<String> must NOT become List&lt;String&gt;
            return new handlebars.SafeString(result);
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
