import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export class TemplateService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.registerHelpers();
    this.loadTemplates();
  }

  private registerHelpers() {
    handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    handlebars.registerHelper('join', (arr: any[], sep: string) =>
      Array.isArray(arr) ? arr.join(typeof sep === 'string' ? sep : ', ') : '');
  }

  private loadTemplates() {
    const candidateDirs = [
      path.resolve(__dirname, '../templates'),
      path.resolve(__dirname, '../../src/templates'),
    ];
    const templatesDir = candidateDirs.find(dir => fs.existsSync(dir));
    if (!templatesDir) throw new Error('Templates directory not found');

    const load = (name: string, rel: string) =>
      this.loadTemplate(name, path.join(templatesDir, rel));

    load('csproj',                  'csproj.hbs');
    load('Program',                 'Program.hbs');
    load('appsettings',             'appsettings.hbs');
    load('appsettings-development', 'appsettings-development.hbs');
    load('readme',                  'readme.hbs');
    load('Entity',                  'csharp/Entity.hbs');
    load('RequestDto',              'csharp/RequestDto.hbs');
    load('ResponseDto',             'csharp/ResponseDto.hbs');
    load('IRepository',             'csharp/IRepository.hbs');
    load('Repository',              'csharp/Repository.hbs');
    load('IService',                'csharp/IService.hbs');
    load('Service',                 'csharp/Service.hbs');
    load('Controller',              'csharp/Controller.hbs');
    load('NotFoundException',       'csharp/NotFoundException.hbs');
    load('ApiErrorResponse',        'csharp/ApiErrorResponse.hbs');
  }

  private loadTemplate(name: string, filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${filePath}`);
    }
    const source = fs.readFileSync(filePath, 'utf-8');
    this.templates.set(name, handlebars.compile(source));
  }

  public render(templateName: string, data: any): string {
    const template = this.templates.get(templateName);
    if (!template) throw new Error(`Template "${templateName}" not found`);
    return template(data);
  }
}
