/**
 * formgen-service — React Code Generator Microservice
 *
 * Exposes react-generator and templates as a REST API.
 * Previously this logic ran client-side in formgen-ui; it now runs here.
 *
 * Port: 3003
 *
 * Endpoints:
 *   POST /generate-react  — accepts a FormModel, returns a React app ZIP
 *   GET  /health          — health check
 */

import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import express from "express";
import cors from "cors";
import * as os from "os";
import * as crypto from "crypto";
import * as fs from "fs-extra";
import archiver from "archiver";
import axios from "axios";
import { FieldModel, FieldType, FormModel } from "./types";
import {
  generateAppTsx,
  generatePackageJson,
  generateViteConfig,
  generateTsConfig,
  generateTsConfigNode,
  generateIndexHtml,
  generateMainTsx,
  generateIndexCss,
  generateReadme,
} from "./generators";
import { buildReactWiredSubmitReplacement } from "@formsync/formgen-shared";

function buildFormModelFromSchema(schema: any): FormModel {
  const raw = schema?.content || schema;
  const properties = raw?.properties || {};
  const required: string[] = Array.isArray(raw?.required) ? raw.required : [];
  const formName = raw?.title || schema?.name || "Generated Form";
  let nextFieldId = 1;

  const toFieldType = (propertySchema: any): FieldType => {
    if (propertySchema?.type === "object") return "group";
    if (propertySchema?.enum) return "select";
    if (
      propertySchema?.type === "string" &&
      (propertySchema?.format === "date" || propertySchema?.format === "date-time")
    ) {
      return "date";
    }

    const fieldTypeMap: Record<string, FieldType> = {
      string: "text",
      number: "number",
      integer: "number",
      boolean: "checkbox",
    };

    return fieldTypeMap[propertySchema?.type] || "text";
  };

  const buildFieldsFromProperties = (
    propertyMap: Record<string, any>,
    requiredFields: string[],
    parentPath = "",
  ): FieldModel[] => {
    return Object.entries(propertyMap).map(([key, value]: [string, any]): FieldModel => {
      const type = toFieldType(value);
      const fieldPath = parentPath ? `${parentPath}.${key}` : key;
      const childProperties = value?.properties || {};
      const childRequired: string[] = Array.isArray(value?.required) ? value.required : [];
      const constraints = {
        min: value?.minimum,
        max: value?.maximum,
        minLength: value?.minLength,
        maxLength: value?.maxLength,
        pattern: value?.pattern,
        enum: value?.enum,
      };

      return {
        id: `field_${nextFieldId++}`,
        key: fieldPath,
        type,
        label: value?.title || key,
        required: requiredFields.includes(key),
        constraints,
        ui: {
          placeholder:
            type === "group" || type === "checkbox"
              ? undefined
              : value?.description || `Enter ${key}`,
          helpText: value?.description,
        },
        children:
          type === "group"
            ? buildFieldsFromProperties(childProperties, childRequired, fieldPath)
            : undefined,
      };
    });
  };

  const fields = buildFieldsFromProperties(properties, required);

  return {
    id: crypto.randomUUID(),
    name: formName,
    version: "1.0.0",
    meta: {
      title: raw?.title || formName,
      description: raw?.description || "Generated from JSON Schema",
    },
    theme: {
      mode: "light",
      density: "normal",
      colors: {
        primary: "#3b82f6",
        background: "#ffffff",
        surface: "#ffffff",
        text: "#111827",
        muted: "#6b7280",
        border: "#e5e7eb",
        error: "#ef4444",
        inputBackground: "#ffffff",
      },
      typography: {
        fontFamily: "Inter, system-ui, sans-serif",
        baseFontSize: 16,
      },
      radius: 8,
    },
    layout: { order: fields.map((f) => f.id) },
    fields,
    submit: { text: "Submit" },
  };
}

const app = express();
const port = process.env.FORMGEN_SERVICE_PORT || 3014;
type BackendLanguage = "springBoot" | "nodeExpress" | "dotnetWebApi";
type FrontendStack = "react" | "htmlBootstrap";

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const RUNTIME_ENGINE_URL = process.env.RUNTIME_ENGINE_URL || "http://localhost:3013";
const NODE_BACKEND_GENERATOR_URL =
  process.env.NODE_BACKEND_GENERATOR_URL || "http://localhost:3015";
const DOTNET_BACKEND_GENERATOR_URL =
  process.env.DOTNET_BACKEND_GENERATOR_URL || "http://localhost:3016";
const STATIC_FRONTEND_GENERATOR_URL =
  process.env.STATIC_FRONTEND_GENERATOR_URL || "http://localhost:3017";

function toKebabCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .replace(/^-|-$/g, "");
}

function toPascalCase(str: string): string {
  return (str || '')
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function pluralize(name: string): string {
  if (/(?:s|x|z|ch|sh)$/i.test(name)) return name + 'es';
  if (/[^aeiou]y$/i.test(name)) return name.slice(0, -1) + 'ies';
  return name + 's';
}

function getPrimaryApiPath(formModel: FormModel, backendLanguage: BackendLanguage): string {
  const rawTitle = formModel.meta?.title || formModel.name || "resource";
  const routeBase = toKebabCase(rawTitle) || "resource";
  if (backendLanguage === "springBoot") return `/api/${routeBase}s`;
  if (backendLanguage === "dotnetWebApi") {
    // .NET [Route("api/[controller]")] uses PascalCase plural controller name
    const plural = pluralize(toPascalCase(rawTitle));
    return `/api/${plural}`;
  }
  return `/api/${routeBase}`;
}

function generateFrontendFiles(formModel: FormModel): Record<string, string> {
  return {
    "package.json": generatePackageJson(formModel),
    "vite.config.ts": generateViteConfig(),
    "tsconfig.json": generateTsConfig(),
    "tsconfig.node.json": generateTsConfigNode(),
    "index.html": generateIndexHtml(formModel),
    "README.md": generateReadme(formModel),
    "src/main.tsx": generateMainTsx(),
    "src/App.tsx": generateAppTsx(formModel),
    "src/index.css": generateIndexCss(formModel),
    ".gitignore": `node_modules\ndist\ndist-ssr\n*.local\n`,
  };
}

function collectFieldTypeMap(formModel: FormModel): Record<string, FieldType> {
  const map: Record<string, FieldType> = {};
  const walk = (fields: FieldModel[]) => {
    for (const field of fields) {
      map[field.key] = field.type;
      if (field.children && field.children.length > 0) {
        walk(field.children);
      }
    }
  };
  walk(formModel.fields);
  return map;
}

const FORMSYNC_SUBMIT_START = "/* FORMSYNC_API_SUBMIT_START */";
const FORMSYNC_SUBMIT_END = "/* FORMSYNC_API_SUBMIT_END */";

function wireFrontendApp(
  appTsx: string,
  apiPath: string,
  formModel: FormModel,
  backendPort: number,
): string {
  const serializedFieldTypes = JSON.stringify(collectFieldTypeMap(formModel), null, 2);
  const replacement = buildReactWiredSubmitReplacement({
    serializedFieldTypes,
    apiPath,
    backendPort,
  });

  const withAsyncSubmit = appTsx.replace(
    "const handleSubmit = (e: FormEvent<HTMLFormElement>) => {",
    "const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {",
  );

  const startIdx = withAsyncSubmit.indexOf(FORMSYNC_SUBMIT_START);
  const endIdx = withAsyncSubmit.indexOf(FORMSYNC_SUBMIT_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.warn(
      "[wireFrontendApp] FORMSYNC submit markers missing; frontend will not call the generated API.",
    );
    return withAsyncSubmit;
  }

  return (
    withAsyncSubmit.slice(0, startIdx) +
    replacement +
    withAsyncSubmit.slice(endIdx + FORMSYNC_SUBMIT_END.length)
  );
}

function generateBundleReadme(
  backendLanguage: BackendLanguage,
  backendPort: number,
  frontendStack: FrontendStack,
): string {
  const backendLabel =
    backendLanguage === "springBoot" ? "Spring Boot (Java)" :
    backendLanguage === "dotnetWebApi" ? "ASP.NET Core Web API (.NET 8)" :
    "Node Express";

  const backendPrereqs =
    backendLanguage === "springBoot" ? "- Java 17+\n- Maven 3.8+" :
    backendLanguage === "dotnetWebApi" ? "- .NET 8 SDK" :
    "";

  const backendRun =
    backendLanguage === "springBoot"
      ? "cd backend\nmvn clean install\nmvn spring-boot:run"
      : backendLanguage === "dotnetWebApi"
        ? "cd backend\ndotnet run"
        : "cd backend\nnpm install\nnpm run start";

  const frontendBullets =
    frontendStack === "htmlBootstrap"
      ? "- `frontend/` (static HTML + Bootstrap + JavaScript — no build step)"
      : "- `frontend/` (Vite + React)";

  const frontendSection =
    frontendStack === "htmlBootstrap"
      ? `## Run Frontend (static)

\`\`\`bash
cd frontend
npx serve .
\`\`\`

Open the URL shown in the terminal. API URL is embedded in \`frontend/js/app.js\` for fullstack bundles (adjust if needed). Ensure your backend allows **CORS** from the origin you use to open the static files.
`
      : `## Run Frontend (Vite + React)

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Dev server defaults to \`http://localhost:5170\` (see \`vite.config.ts\`).

Frontend reads backend URL from \`frontend/.env\`.
`;

  return `# Fullstack Generated Project

This package includes:
${frontendBullets}
- \`backend/\` (${backendLabel})

## Prerequisites

- Node.js 18+
- npm 9+
${backendPrereqs}

## Run Backend

\`\`\`bash
${backendRun}
\`\`\`

Backend default URL: \`http://localhost:${backendPort}\`

${frontendSection}`;
}

function hasPathPrefix(
  files: Array<{ path: string; content: string }>,
  prefix: string,
): boolean {
  return files.some((file) => file.path.startsWith(prefix));
}

function validateBackendStructure(
  generatedFiles: Array<{ path: string; content: string }>,
  backendLanguage: BackendLanguage,
) {
  const hasPom = generatedFiles.some((file) => file.path === "pom.xml");
  const hasSpringMain = hasPathPrefix(generatedFiles, "src/main/java/");
  const hasSpringResources = hasPathPrefix(generatedFiles, "src/main/resources/");
  const hasNodeSrc = hasPathPrefix(generatedFiles, "src/controllers/")
    || hasPathPrefix(generatedFiles, "src/routes/")
    || hasPathPrefix(generatedFiles, "src/services/");
  const hasCsproj = generatedFiles.some((file) => file.path.endsWith(".csproj"));
  const hasDotNetControllers = hasPathPrefix(generatedFiles, "Controllers/");
  const hasOpenApiYaml = generatedFiles.some((file) => file.path === "openapi.yaml");

  if (backendLanguage === "springBoot") {
    if (!hasPom || !hasSpringMain || !hasSpringResources) {
      throw new Error(
        "Spring Boot generation returned an invalid project structure (missing pom.xml or src/main/*).",
      );
    }
  } else if (backendLanguage === "dotnetWebApi") {
    if (!hasCsproj || !hasDotNetControllers) {
      throw new Error(
        "ASP.NET Core generation returned an invalid project structure (missing .csproj or Controllers/).",
      );
    }
  } else {
    // nodeExpress
    if (!hasNodeSrc) {
      throw new Error(
        "Node Express generation returned an invalid project structure (missing src/controllers|routes|services).",
      );
    }
  }

  if (!hasOpenApiYaml) {
    throw new Error(
      "Backend generation did not include openapi.yaml (OpenAPI contract).",
    );
  }
}

/**
 * POST /generate-react
 * Body: { formModel: FormModel }
 * Response: ZIP blob containing a complete standalone Vite + React app
 */
app.post('/generate-react', async (req, res) => {
    const { formModel }: { formModel: FormModel } = req.body;

    if (!formModel) {
        return res.status(400).json({ error: 'formModel is required' });
    }

    const requestId = crypto.randomUUID();
    const tempDir = path.join(os.tmpdir(), `formgen-react-${requestId}`);

    console.log(`[${requestId}] Generating React app for form: "${formModel.name}"`);

    try {
        await fs.ensureDir(tempDir);
        await fs.ensureDir(path.join(tempDir, 'src'));

    // Generate all project files
    const files = generateFrontendFiles(formModel);

    // Write all files to temp dir
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(tempDir, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content, "utf8");
    }

    // Zip and stream back
    const projectName = formModel.name.toLowerCase().replace(/\s+/g, "-");
    res.attachment(`${projectName}-export.zip`);
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(tempDir, false);
    archive.finalize();

    res.on("finish", () => {
      fs.remove(tempDir).catch((err) =>
        console.error(`[${requestId}] Cleanup failed:`, err),
      );
      console.log(`[${requestId}] Done.`);
    });
  } catch (error: any) {
    console.error(`[${requestId}] Generation failed:`, error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Generation failed", message: error.message });
    }
    fs.remove(tempDir).catch(() => {});
  }
});

/**
 * POST /generate-fullstack
 * Body: { formModel: FormModel, schema: any, backendLanguage: "springBoot" | "nodeExpress" }
 * Response: ZIP blob containing frontend + selected backend + root README
 */
app.post("/generate-fullstack", async (req, res) => {
  const {
    formModel,
    schema,
    backendLanguage = "springBoot",
    frontendStack = "react",
  }: {
    formModel?: FormModel;
    schema: any;
    backendLanguage?: BackendLanguage;
    frontendStack?: FrontendStack;
  } = req.body;

  if (!schema) {
    return res
      .status(400)
      .json({ error: "schema is required" });
  }

  if (!["springBoot", "nodeExpress", "dotnetWebApi"].includes(backendLanguage)) {
    return res
      .status(400)
      .json({ error: "backendLanguage must be springBoot, nodeExpress, or dotnetWebApi" });
  }

  if (!["react", "htmlBootstrap"].includes(frontendStack)) {
    return res
      .status(400)
      .json({ error: "frontendStack must be react or htmlBootstrap" });
  }

  const requestId = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), `formgen-fullstack-${requestId}`);
  const frontendDir = path.join(tempDir, "frontend");
  const backendDir = path.join(tempDir, "backend");

  try {
    await fs.ensureDir(frontendDir);
    await fs.ensureDir(backendDir);
    if (frontendStack === "react") {
      await fs.ensureDir(path.join(frontendDir, "src"));
    }

    const effectiveFormModel = formModel || buildFormModelFromSchema(schema);
    const apiPath = getPrimaryApiPath(effectiveFormModel, backendLanguage);
    const backendPort = backendLanguage === "springBoot" ? 8080 : backendLanguage === "dotnetWebApi" ? 5000 : 3600;

    if (frontendStack === "react") {
      const frontendFiles = generateFrontendFiles(effectiveFormModel);
      frontendFiles["src/App.tsx"] = wireFrontendApp(
        frontendFiles["src/App.tsx"],
        apiPath,
        effectiveFormModel,
        backendPort,
      );
      frontendFiles[".env"] = `VITE_API_URL=http://localhost:${backendPort}\nVITE_API_PATH=${apiPath}\n`;

      for (const [filePath, content] of Object.entries(frontendFiles)) {
        const fullPath = path.join(frontendDir, filePath);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, content, "utf8");
      }
    } else {
      const staticResp = await axios.post(
        `${STATIC_FRONTEND_GENERATOR_URL}/generate`,
        {
          formModel: effectiveFormModel,
          preview: true,
          wiring: {
            apiBaseUrl: `http://localhost:${backendPort}`,
            apiPath,
          },
        },
        { timeout: 120000 },
      );
      const staticFiles = staticResp.data?.files as
        | Array<{ path: string; content: string }>
        | undefined;
      if (!staticFiles || !Array.isArray(staticFiles) || staticFiles.length === 0) {
        throw new Error("Static frontend generator returned no files");
      }
      for (const sf of staticFiles) {
        const fullPath = path.join(frontendDir, sf.path);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, sf.content, "utf8");
      }
    }

    const targetUrl =
      backendLanguage === "springBoot"
        ? `${RUNTIME_ENGINE_URL}/generate`
        : backendLanguage === "dotnetWebApi"
          ? `${DOTNET_BACKEND_GENERATOR_URL}/generate`
          : `${NODE_BACKEND_GENERATOR_URL}/generate`;

    const backendResp = await axios.post(
      targetUrl,
      { schema, preview: true },
      { timeout: 120000 },
    );
    const generatedFiles = backendResp.data?.files as
      | Array<{ path: string; content: string }>
      | undefined;
    if (!generatedFiles || !Array.isArray(generatedFiles) || generatedFiles.length === 0) {
      throw new Error("Selected backend generator returned no files");
    }
    validateBackendStructure(generatedFiles, backendLanguage);

    for (const backendFile of generatedFiles) {
      const fullPath = path.join(backendDir, backendFile.path);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, backendFile.content, "utf8");
    }

    await fs.writeFile(
      path.join(tempDir, "README.md"),
      generateBundleReadme(backendLanguage, backendPort, frontendStack),
      "utf8",
    );

    const schemaSlug = effectiveFormModel.name
      .toLowerCase()
      .replace(/\s+/g, "-");
    const frontendSlug =
      frontendStack === "htmlBootstrap" ? "html-bootstrap" : "react";
    res.attachment(
      `${schemaSlug}_fullstack-${frontendSlug}_${backendLanguage}.zip`,
    );
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(tempDir, false);
    archive.finalize();

    res.on("finish", () => {
      fs.remove(tempDir).catch((err) =>
        console.error(`[${requestId}] Cleanup failed:`, err),
      );
    });
  } catch (error: any) {
    console.error(`[${requestId}] Fullstack generation failed:`, error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Fullstack generation failed", message: error.message });
    }
    fs.remove(tempDir).catch(() => {});
  }
});

/**
 * GET /health
 */
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'formgen-service', uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(`🚀 formgen-service listening at http://localhost:${port}`);
  console.log(`   POST /generate-react  — Generate a standalone React app ZIP`);
  console.log(
    `   POST /generate-fullstack — Fullstack (frontendStack: react | htmlBootstrap)`,
  );
  console.log(`   GET  /health          — Health check`);
});
