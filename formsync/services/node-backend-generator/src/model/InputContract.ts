export interface NodeBackendGeneratorConfig {
  outputDir?: string;
  /** When true (default), Swagger UI and OpenAPI routes are enabled. */
  includeSwagger?: boolean;
  /** Default HTTP port for the generated server (README and server.js default). */
  serverPort?: number;
}
