import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { DataType } from '@formsync/schema-openapi';

function getCollectionItemDefault(referenceType?: string): string {
    if (!referenceType || referenceType === 'String') return '"test"';
    if (referenceType === 'Integer') return '1';
    if (referenceType === 'Long') return '1L';
    if (referenceType === 'Double') return '1.0';
    if (referenceType === 'Boolean') return 'true';
    return `new ${referenceType}()`;
}

/**
 * Generates a plausible example string that matches common regex patterns.
 * Used as a fallback when the JSON Schema doesn't provide an explicit example.
 */
function generatePatternExample(pattern: string): string {
    // UUID pattern  e.g. ^[0-9a-fA-F]{8}-...
    if (/[0-9a-fA-F].*\{8\}/.test(pattern) || pattern.toLowerCase().includes('uuid')) {
        return '550e8400-e29b-41d4-a716-446655440000';
    }
    // Phone  e.g.  ^\+?\d{10,15}$
    if (/\\\+.*\\d/.test(pattern) || /\[\+\]/.test(pattern)) {
        return '+1234567890';
    }
    // Prefix-number IDs  e.g.  ^EVT-\d{3}$  or  ^[A-Z]{2,4}-\d+$
    const prefixNum = pattern.match(/^\^?([A-Z]{1,6})-/);
    if (prefixNum) {
        return `${prefixNum[1]}-001`;
    }
    // Prefix pattern with backslash-d  e.g. ^[A-Z]+-\d+$
    if (/\[A-Z\].*\\d/.test(pattern)) {
        return 'ABC-001';
    }
    // Digits-only  e.g.  ^\d{5,10}$  or  ^[0-9]+$
    if (/^\^?\(?\\d|^\^?\[0-9\]/.test(pattern)) {
        return '1234567890';
    }
    // Alphanumeric  e.g.  ^[a-zA-Z0-9]+$
    if (/\[a-zA-Z0-9\]|\[A-Za-z0-9\]|\[a-z\]|\[A-Z\]/.test(pattern)) {
        return 'Abc123';
    }
    // IP address  e.g.  ^\d{1,3}\.\d{1,3}...
    if (/\\d.*\\\..*\\d/.test(pattern)) {
        return '192.168.1.1';
    }
    // Hex color  e.g.  ^#[0-9a-fA-F]{6}$
    if (pattern.includes('#') && /[0-9a-fA-F]/.test(pattern)) {
        return '#FF5733';
    }
    // General fallback – alphanumeric with hyphen, matches many ID patterns
    return 'Test-123';
}

export class TemplateService {
    private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor() {
        this.registerHelpers();
        this.loadTemplates();
    }

    private registerHelpers() {
        handlebars.registerHelper('toSnakeCase', (str: string) => {
            return str
                .replace(/[\s-]+/g, '_')
                .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
                .toLowerCase()
                .replace(/^_/, '')
                .replace(/_{2,}/g, '_');
        });

        handlebars.registerHelper('toKebabCase', (str: string) => {
            return str
                .replace(/[\s_]+/g, '-')
                .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
                .toLowerCase()
                .replace(/^-/, '')
                .replace(/-{2,}/g, '-');
        });

        handlebars.registerHelper('capitalizeFirst', (str: string) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        });

        handlebars.registerHelper('escapeJava', (str: string) => {
            if (!str) return '';
            return str.replace(/\\/g, '\\\\');
        });

        /** Escapes a string for use inside Java @Schema(example = "...") */
        handlebars.registerHelper('escapeSchemaExample', (str: string) => {
            if (str == null) return '';
            return String(str)
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"');
        });

        handlebars.registerHelper('eq', function (this: any, arg1, arg2, options) {
            return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
        });

        handlebars.registerHelper('endsWith', (str: string, suffix: string) => {
            if (str == null || suffix == null) return false;
            return String(str).endsWith(String(suffix));
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

        // ── Test-data helpers ─────────────────────────────────

        handlebars.registerHelper('testValue', function (type: DataType, referenceType: string, constraints: any) {
            if (!constraints || typeof constraints.fn === 'function') constraints = {};
            let result: string;

            switch (type) {
                case DataType.STRING:
                    if (constraints.email) {
                        result = '"test@example.com"';
                    } else if (constraints.url) {
                        result = '"https://example.com"';
                    } else if (constraints.pattern) {
                        // Pattern-constrained field — use explicit example or heuristic
                        const ex = constraints.example || generatePatternExample(constraints.pattern);
                        result = '"' + ex.replace(/"/g, '\\"') + '"';
                    } else if (constraints.example) {
                        result = '"' + constraints.example.replace(/"/g, '\\"') + '"';
                    } else {
                        const len = constraints.minLength ? Math.max(constraints.minLength, 4) : 4;
                        result = '"' + 'a'.repeat(len) + '"';
                    }
                    break;
                case DataType.INTEGER: {
                    const mn = constraints.min ?? 0;
                    const mx = constraints.max;
                    result = mx !== undefined ? String(Math.floor((mn + mx) / 2)) : String(mn + 1);
                    break;
                }
                case DataType.LONG: {
                    const mn = constraints.min ?? 0;
                    const mx = constraints.max;
                    const v = mx !== undefined ? Math.floor((mn + mx) / 2) : mn + 1;
                    result = `${v}L`;
                    break;
                }
                case DataType.DOUBLE: {
                    const mn = constraints.min ?? 0;
                    const mx = constraints.max;
                    result = mx !== undefined ? ((mn + mx) / 2).toFixed(1) : (mn + 1.0).toFixed(1);
                    break;
                }
                case DataType.BIG_DECIMAL: {
                    const mn = constraints.min ?? 0;
                    const mx = constraints.max;
                    const v = mx !== undefined ? ((mn + mx) / 2).toFixed(2) : (mn + 100).toFixed(2);
                    result = `new java.math.BigDecimal("${v}")`;
                    break;
                }
                case DataType.BOOLEAN:
                    result = 'true';
                    break;
                case DataType.LOCAL_DATE:
                    result = 'java.time.LocalDate.of(2026, 1, 15)';
                    break;
                case DataType.LOCAL_DATE_TIME:
                    result = 'java.time.LocalDateTime.of(2026, 1, 15, 10, 30)';
                    break;
                case DataType.LIST: {
                    if (!constraints.required) {
                        result = 'null';
                    } else {
                        const item = getCollectionItemDefault(referenceType);
                        result = `java.util.List.of(${item})`;
                    }
                    break;
                }
                case DataType.SET: {
                    if (!constraints.required) {
                        result = 'null';
                    } else {
                        const item = getCollectionItemDefault(referenceType);
                        result = `java.util.Set.of(${item})`;
                    }
                    break;
                }
                case DataType.MAP:
                    if (!constraints.required) {
                        result = 'null';
                    } else {
                        result = 'new java.util.HashMap<>()';
                    }
                    break;
                case DataType.ENUM:
                    result = referenceType ? `${referenceType}.values()[0]` : '"VALUE"';
                    break;
                case DataType.OBJECT:
                    if (!constraints.required) {
                        result = 'null';
                    } else {
                        result = referenceType ? `new ${referenceType}()` : 'null';
                    }
                    break;
                default:
                    result = '"test"';
            }
            return new handlebars.SafeString(result);
        });

        handlebars.registerHelper('belowMin', (min: number, type: DataType) => {
            const val = min - 1;
            switch (type) {
                case DataType.DOUBLE: return new handlebars.SafeString((min - 0.1).toFixed(1));
                case DataType.BIG_DECIMAL: return new handlebars.SafeString(`new java.math.BigDecimal("${val}")`);
                case DataType.LONG: return new handlebars.SafeString(`${val}L`);
                default: return new handlebars.SafeString(String(val));
            }
        });

        handlebars.registerHelper('aboveMax', (max: number, type: DataType) => {
            const val = max + 1;
            switch (type) {
                case DataType.DOUBLE: return new handlebars.SafeString((max + 0.1).toFixed(1));
                case DataType.BIG_DECIMAL: return new handlebars.SafeString(`new java.math.BigDecimal("${val}")`);
                case DataType.LONG: return new handlebars.SafeString(`${val}L`);
                default: return new handlebars.SafeString(String(val));
            }
        });

        handlebars.registerHelper('tooShortValue', (minLength: number) => {
            if (minLength <= 0) return new handlebars.SafeString('""');
            const len = Math.max(0, minLength - 1);
            return new handlebars.SafeString('"' + 'a'.repeat(len) + '"');
        });

        handlebars.registerHelper('tooLongValue', (maxLength: number) => {
            const needed = maxLength + 1;
            if (needed > 500) {
                return new handlebars.SafeString(`"a".repeat(${needed})`);
            }
            return new handlebars.SafeString('"' + 'a'.repeat(needed) + '"');
        });

        // ── Type mapping helper ─────────────────────────────────

        /** True when List&lt;T&gt; uses a nested @Embeddable type (vs String, Integer, …). */
        const LIST_ELEMENT_BASIC_TYPES = new Set([
            'String',
            'Integer',
            'Long',
            'Double',
            'Boolean',
            'BigDecimal',
            'LocalDate',
            'LocalDateTime',
        ]);

        handlebars.registerHelper('listElementIsEmbeddable', (referenceType?: string) => {
            const rt = referenceType ?? 'String';
            return !LIST_ELEMENT_BASIC_TYPES.has(rt);
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
        this.loadTemplate('openapi-config', path.join(templatesDir, 'java/openapi-config.hbs'));

        // README
        this.loadTemplate('readme', path.join(templatesDir, 'readme.hbs'));

        // Test templates
        this.loadTemplate('controller-test', path.join(templatesDir, 'java/controller-test.hbs'));
        this.loadTemplate('service-test', path.join(templatesDir, 'java/service-test.hbs'));
        this.loadTemplate('repository-test', path.join(templatesDir, 'java/repository-test.hbs'));
        this.loadTemplate('application-test', path.join(templatesDir, 'java/application-test.hbs'));
        this.loadTemplate('application-test-yml', path.join(templatesDir, 'application-test-yml.hbs'));
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
