/**
 * RuntimeGeneratorPlugin Interface
 * 
 * Plugins that implement this interface can generate complete, runnable
 * application projects in different frameworks (Spring Boot, Express, etc.)
 * based on schema definitions.
 * 
 * Design Decision: Separates concerns of parsing (FormatParserPlugin) from
 * code generation (RuntimeGeneratorPlugin), allowing flexible combinations.
 */

export interface GeneratorOptions {
  /**
   * Base package name for generated code (e.g., 'com.example.app')
   */
  packageName?: string;

  /**
   * Project/application name
   */
  projectName?: string;

  /**
   * Additional framework-specific configuration
   */
  config?: Record<string, any>;
}

export interface GeneratedFile {
  /**
   * Relative path to the file within the project
   */
  path: string;

  /**
   * File content
   */
  content: string;

  /**
   * Whether this is a binary file (affects encoding)
   */
  isBinary?: boolean;
}

export interface GenerateResult {
  /**
   * Whether generation was successful
   */
  success: boolean;

  /**
   * Generated project files
   */
  files?: GeneratedFile[];

  /**
   * Any errors encountered during generation
   */
  errors?: string[];

  /**
   * Warnings or informational messages
   */
  warnings?: string[];

  /**
   * Metadata about the generated project
   */
  metadata?: {
    framework: string;
    language: string;
    buildTool?: string;
    entryPoint?: string;
  };
}

export interface RuntimeGeneratorPlugin {
  /**
   * Unique identifier for this generator plugin
   */
  readonly name: string;

  /**
   * Generate a complete application project from a schema
   * @param schema - Parsed JSON Schema (typically from a FormatParserPlugin)
   * @param options - Generation options (package name, project name, etc.)
   * @returns GenerateResult with project files
   */
  generate(schema: any, options?: GeneratorOptions): Promise<GenerateResult>;

  /**
   * Get list of target frameworks/platforms this plugin supports
   * @returns Array of supported targets (e.g., ['spring-boot', 'java'])
   */
  getSupportedTargets(): string[];

  /**
   * Get human-readable description of what this plugin generates
   */
  getDescription(): string;
}
