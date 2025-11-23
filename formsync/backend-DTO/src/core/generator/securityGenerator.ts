import { GeneratedArtifact } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

function loadTemplate(name: string): Handlebars.TemplateDelegate {
    const templatePath = path.join(__dirname, '../templates/annotations', `${name}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    return Handlebars.compile(source);
}

export function generateSecurityArtifacts(packageName: string): GeneratedArtifact[] {
    const artifacts: GeneratedArtifact[] = [];
    const packagePath = packageName.replace(/\./g, '/');

    // PII
    const piiTemplate = loadTemplate('PIIAnnotation');
    artifacts.push({
        filename: 'PII.java',
        relativePath: `src/main/java/${packagePath}/security/gdpr/PII.java`,
        content: piiTemplate({ packageName }),
    });

    // NoHtml
    const noHtmlTemplate = loadTemplate('NoHtmlAnnotation');
    artifacts.push({
        filename: 'NoHtml.java',
        relativePath: `src/main/java/${packagePath}/security/validation/NoHtml.java`,
        content: noHtmlTemplate({ packageName }),
    });

    // NoHtmlValidator
    const validatorTemplate = loadTemplate('NoHtmlValidator');
    artifacts.push({
        filename: 'NoHtmlValidator.java',
        relativePath: `src/main/java/${packagePath}/security/validation/NoHtmlValidator.java`,
        content: validatorTemplate({ packageName }),
    });

    return artifacts;
}
