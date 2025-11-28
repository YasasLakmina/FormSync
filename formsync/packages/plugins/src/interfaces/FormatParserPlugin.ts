/**
 * FormatParserPlugin Interface
 * 
 * Plugins that implement this interface can parse different schema formats
 * (JSON, YAML, XML) and convert them to standardized JSON Schema Draft-7.
 * 
 * Design Decision: Each parser is responsible for detecting its format
 * and converting to a normalized JSON Schema structure.
 */

export interface ParseResult {
  success: boolean;
  schema?: any; // JSON Schema Draft-7 object
  errors?: string[];
  detectedFormat?: 'json' | 'yaml' | 'xml' | 'unknown';
}

export interface FormatParserPlugin {
  /**
   * Unique identifier for this parser plugin
   */
  readonly name: string;

  /**
   * Check if this plugin can parse the given input
   * @param input - Raw string input to check
   * @returns true if this plugin can handle the input
   */
  canParse(input: string): boolean;

  /**
   * Parse the input and convert to JSON Schema Draft-7
   * @param input - Raw string input (JSON/YAML/XML)
   * @returns ParseResult with normalized JSON Schema
   */
  parse(input: string): Promise<ParseResult>;

  /**
   * Get list of formats this plugin supports
   * @returns Array of supported format identifiers
   */
  getSupportedFormats(): string[];
}
