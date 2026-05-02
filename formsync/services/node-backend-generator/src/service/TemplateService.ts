import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";

export class TemplateService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.registerHelpers();
    this.loadTemplates();
  }

  private registerHelpers() {
    handlebars.registerHelper("toPascalCase", (str: string) => {
      return (str || "")
        .replace(/[_-]+/g, " ")
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
    });

    handlebars.registerHelper("toCamelCase", (str: string) => {
      const pascal = (str || "")
        .replace(/[_-]+/g, " ")
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
      return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : "";
    });

    handlebars.registerHelper("toKebabCase", (str: string) => {
      return (str || "")
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[_\s]+/g, "-")
        .replace(/[^\w-]/g, "")
        .toLowerCase()
        .replace(/^-+|-+$/g, "");
    });
  }

  private loadTemplates() {
    const candidateDirs = [
      path.resolve(__dirname, "../templates"),
      path.resolve(__dirname, "../../src/templates"),
    ];
    const templatesDir = candidateDirs.find((dir) => fs.existsSync(dir));

    if (!templatesDir) {
      throw new Error("Templates directory not found");
    }

    this.loadTemplate("package-json", path.join(templatesDir, "package-json.hbs"));
    this.loadTemplate("server-js", path.join(templatesDir, "server-js.hbs"));
    this.loadTemplate("route-js", path.join(templatesDir, "route-js.hbs"));
    this.loadTemplate("controller-js", path.join(templatesDir, "controller-js.hbs"));
    this.loadTemplate("service-js", path.join(templatesDir, "service-js.hbs"));
    this.loadTemplate("readme", path.join(templatesDir, "readme.hbs"));
  }

  private loadTemplate(name: string, filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${filePath}`);
    }
    const source = fs.readFileSync(filePath, "utf-8");
    this.templates.set(name, handlebars.compile(source));
  }

  public render(templateName: string, data: any): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }
    return template(data);
  }
}
