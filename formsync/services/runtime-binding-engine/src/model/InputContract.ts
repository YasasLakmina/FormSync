/**
 * Configuration for generating a complete Spring Boot server.
 */
export interface SpringBootGeneratorConfig {
    /** Output directory for generated files */
    outputDir?: string;
    /** Base Java package (e.g. com.example.demo) */
    basePackage?: string;
    /** Server port for the generated application */
    serverPort?: number;
    /** Whether to include Swagger/OpenAPI support */
    includeSwagger?: boolean;
    /** Database type: h2 (in-memory) or postgres */
    database?: 'h2' | 'postgres';
}
