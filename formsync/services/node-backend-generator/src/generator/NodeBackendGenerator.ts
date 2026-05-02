import * as path from "path";
import { FileWriter } from "../service/FileWriter";
import { TemplateService } from "../service/TemplateService";

interface GeneratorConfig {
  outputDir?: string;
}

interface EntityDescriptor {
  name: string;
  routeName: string;
}

export class NodeBackendGenerator {
  private templateService: TemplateService;
  private fileWriter: FileWriter;

  constructor() {
    this.templateService = new TemplateService();
    this.fileWriter = new FileWriter();
  }

  async generate(schema: any, config?: GeneratorConfig): Promise<void> {
    const outputDir = config?.outputDir || "./generated-node-backend";
    const normalized = this.normalizeSchema(schema);
    const entities = this.extractEntities(normalized.content, normalized.name);

    const packageJson = this.templateService.render("package-json", {
      appName: normalized.name,
    });
    this.fileWriter.write(path.join(outputDir, "package.json"), packageJson);

    const serverJs = this.templateService.render("server-js", {
      entities,
      appName: normalized.name,
    });
    this.fileWriter.write(path.join(outputDir, "src/server.js"), serverJs);

    for (const entity of entities) {
      const routeContent = this.templateService.render("route-js", entity);
      const controllerContent = this.templateService.render("controller-js", entity);
      const serviceContent = this.templateService.render("service-js", entity);

      this.fileWriter.write(path.join(outputDir, "src/routes", `${entity.routeName}.routes.js`), routeContent);
      this.fileWriter.write(
        path.join(outputDir, "src/controllers", `${entity.routeName}.controller.js`),
        controllerContent,
      );
      this.fileWriter.write(path.join(outputDir, "src/services", `${entity.routeName}.service.js`), serviceContent);
    }

    const readme = this.templateService.render("readme", {
      appName: normalized.name,
      entities,
    });
    this.fileWriter.write(path.join(outputDir, "README.md"), readme);
  }

  private normalizeSchema(schema: any): { name: string; content: any } {
    if (schema?.content && (schema?.name || schema?.id)) {
      return {
        name: this.safeName(schema.name || schema.id || "GeneratedApi"),
        content: schema.content,
      };
    }

    return {
      name: this.safeName(schema?.title || "GeneratedApi"),
      content: schema,
    };
  }

  private extractEntities(content: any, fallbackName: string): EntityDescriptor[] {
    const definitions = content?.definitions || content?.$defs || {};
    const entities: EntityDescriptor[] = Object.keys(definitions).map((key) => ({
      name: this.safeName(key),
      routeName: this.toRouteName(key),
    }));

    if (entities.length > 0) {
      return entities;
    }

    const rootName = this.safeName(content?.title || fallbackName || "Resource");
    return [
      {
        name: rootName,
        routeName: this.toRouteName(rootName),
      },
    ];
  }

  private safeName(value: string): string {
    return (value || "Resource").replace(/[^\w\s-]/g, "").trim() || "Resource";
  }

  private toRouteName(value: string): string {
    return this.safeName(value)
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  }
}
