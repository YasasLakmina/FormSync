import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

export function loadTemplate(name: string): Handlebars.TemplateDelegate {
    const templatePath = path.join(__dirname, '../templates', `${name}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    return Handlebars.compile(source);
}

export function capitalize(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
}
