import * as path from "path";
import * as fs from "fs";
import { buildOpenApiYaml } from "@formsync/schema-openapi";
import { FileWriter } from "../service/FileWriter";
import { TemplateService, computeJsLiteral } from "../service/TemplateService";
import { ContextualTestGenerator } from "../service/ContextualTestGenerator";
import { NodeBackendGeneratorConfig } from "../model/InputContract";

interface FieldDescriptor {
  name: string;
  type: string;
  required: boolean;
  testValue: string;
}

interface EntityDescriptor {
  name: string;
  routeName: string;
  fields: FieldDescriptor[];
}

export class NodeBackendGenerator {
  private templateService: TemplateService;
  private fileWriter: FileWriter;
  private contextualTestGenerator: ContextualTestGenerator;

  constructor() {
    this.templateService = new TemplateService();
    this.fileWriter = new FileWriter();
    this.contextualTestGenerator = new ContextualTestGenerator();
  }

  async generate(schema: any, config?: NodeBackendGeneratorConfig): Promise<void> {
    const outputDir = config?.outputDir || "./generated-node-backend";
    const includeSwagger = config?.includeSwagger ?? true;
    const serverPort = config?.serverPort ?? 3600;
    this.cleanOutputDir(outputDir);
    const normalized = this.normalizeSchema(schema);
    const entities = this.extractEntities(normalized.content, normalized.name);

    const openApiYaml = buildOpenApiYaml({
      name: normalized.name,
      content: normalized.content,
      version: normalized.version,
      description: normalized.description ?? normalized.content?.description,
    });
    this.fileWriter.write(path.join(outputDir, "openapi.yaml"), openApiYaml);

    // ── package.json ──
    const packageJson = this.templateService.render("package-json", {
      appName: normalized.name,
      entities,
      includeSwagger,
    });
    this.fileWriter.write(path.join(outputDir, "package.json"), packageJson);

    // ── src/server.js ──
    const serverJs = this.templateService.render("server-js", {
      entities,
      appName: normalized.name,
      includeSwagger,
      serverPort,
    });
    this.fileWriter.write(path.join(outputDir, "src/server.js"), serverJs);

    // ── Per-entity source files ──
    for (const entity of entities) {
      const routeContent = this.templateService.render("route-js", entity);
      const controllerContent = this.templateService.render("controller-js", entity);
      const serviceContent = this.templateService.render("service-js", entity);

      this.fileWriter.write(path.join(outputDir, "src/routes", `${entity.routeName}.routes.js`), routeContent);
      this.fileWriter.write(path.join(outputDir, "src/controllers", `${entity.routeName}.controller.js`), controllerContent);
      this.fileWriter.write(path.join(outputDir, "src/services", `${entity.routeName}.service.js`), serviceContent);
    }

    // ── Static test files ──
    for (const entity of entities) {
      const routeTest = this.templateService.render("route-test", entity);
      this.fileWriter.write(
        path.join(outputDir, "__tests__", "routes", `${entity.routeName}.routes.test.js`),
        routeTest,
      );

      const serviceTest = this.templateService.render("service-test", entity);
      this.fileWriter.write(
        path.join(outputDir, "__tests__", "services", `${entity.routeName}.service.test.js`),
        serviceTest,
      );
    }

    // ── Contextual (AI-generated) tests via Groq ──
    const rawSchema = normalized.content;
    for (const entity of entities) {
      try {
        const contextualCode = await this.contextualTestGenerator.generateJsContextualTests(
          entity.name,
          entity.routeName,
          rawSchema,
        );
        if (contextualCode) {
          this.fileWriter.write(
            path.join(outputDir, "contextual-tests", `${entity.routeName}.contextual.test.js`),
            contextualCode,
          );
        }
      } catch (err: any) {
        console.warn(`[NodeBackendGenerator] Contextual test generation skipped for ${entity.name}: ${err.message}`);
      }
    }

    // ── Contextual tests README ──
    const contextualReadme = this.buildContextualReadme(normalized.name, entities);
    this.fileWriter.write(path.join(outputDir, "contextual-tests", "README.md"), contextualReadme);

    // ── Project README ──
    const readme = this.templateService.render("readme", {
      appName: normalized.name,
      entities,
      includeSwagger,
      serverPort,
    });
    this.fileWriter.write(path.join(outputDir, "README.md"), readme);
  }

  // ── Schema normalization ──────────────────────────────────────────────────

  private normalizeSchema(schema: any): {
    name: string;
    content: any;
    version?: string;
    description?: string;
  } {
    if (schema?.content && (schema?.name || schema?.id)) {
      return {
        name: this.safeName(schema.name || schema.id || "GeneratedApi"),
        content: schema.content,
        version: schema.version?.toString(),
        description: schema.description,
      };
    }
    return {
      name: this.safeName(schema?.title || "GeneratedApi"),
      content: schema,
      description: schema?.description,
    };
  }

  // ── Entity + field extraction ─────────────────────────────────────────────

  private extractEntities(content: any, fallbackName: string): EntityDescriptor[] {
    const definitions = content?.definitions || content?.$defs || {};
    const defKeys = Object.keys(definitions);

    if (defKeys.length > 0) {
      return defKeys.map((key) => ({
        name: this.safeName(key),
        routeName: this.toRouteName(key),
        fields: this.extractFields(definitions[key]),
      }));
    }

    // Single root entity
    const rootName = this.safeName(content?.title || fallbackName || "Resource");
    return [
      {
        name: rootName,
        routeName: this.toRouteName(rootName),
        fields: this.extractFields(content),
      },
    ];
  }

  private extractFields(schemaDef: any): FieldDescriptor[] {
    if (!schemaDef?.properties) return [];
    const required: string[] = Array.isArray(schemaDef.required) ? schemaDef.required : [];

    return Object.entries(schemaDef.properties).map(([name, def]: [string, any]) => ({
      name,
      type: def.type || "string",
      required: required.includes(name),
      testValue: computeJsLiteral(def, name),
    }));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Wipe stale files from a previous generation so old entity routes/tests
  // don't linger and produce 404s when server.js no longer mounts them.
  private cleanOutputDir(outputDir: string): void {
    if (!fs.existsSync(outputDir)) return;
    for (const entry of fs.readdirSync(outputDir)) {
      if (entry === "node_modules" || entry === "package-lock.json") continue;
      fs.rmSync(path.join(outputDir, entry), { recursive: true, force: true });
    }
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

  private buildContextualReadme(appName: string, entities: EntityDescriptor[]): string {
    return `# Contextual Tests — ${appName}

These tests were generated by **FormSync** using the Groq AI (llama-3.3-70b-versatile) model.
They are schema-aware and capture domain-specific scenarios beyond the standard CRUD test suite.

## Test Files

${entities.map((e) => `- \`${e.routeName}.contextual.test.js\` — contextual tests for the **${e.name}** entity`).join("\n")}

## How to Run

\`\`\`bash
# Install dependencies first (from the project root)
npm install

# Run ONLY the contextual tests
npm run test:contextual

# Or directly via Jest
npx jest contextual-tests/ --runInBand --verbose

# Run with coverage
npx jest contextual-tests/ --coverage --runInBand
\`\`\`

## Test Groups

Each contextual test file is organised into four \`describe\` blocks:

| Group | Description |
|-------|-------------|
| \`Valid Requests\` | Full entity creation with realistic values from the JSON Schema examples |
| \`Required Fields\` | Covers each required field with valid and edge-case payloads |
| \`Boundary Values\` | Tests numeric min/max and string minLength/maxLength constraints |
| \`Business Scenarios\` | Domain-specific rules (e.g. email format, ID patterns, salary ranges) |

## Notes

- These tests depend on the server being importable via \`require('../src/server')\`.
- The server uses **in-memory storage** so there are no external dependencies.
- Tests run sequentially (\`--runInBand\`) to avoid race conditions on the shared store.
- If you regenerate the project, this folder will be refreshed with updated contextual tests.
`;
  }
}
