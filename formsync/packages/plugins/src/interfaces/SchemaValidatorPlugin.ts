/**
 * SchemaValidatorPlugin Interface
 * 
 * Plugins that implement this interface validate JSON Schemas against
 * different rule sets (JSON Schema spec, WCAG accessibility, custom rules).
 * 
 * Design Decision: Validators return structured results with severity levels
 * to allow the UI to display different types of issues appropriately.
 */

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string; // Unique identifier for this issue type
  path: string; // JSON path to the problematic field (e.g., "properties.email.pattern")
  severity: ValidationSeverity;
  message: string; // Human-readable error message
  suggestion?: string; // Optional suggestion for fixing the issue
}

export interface ValidationResult {
  success: boolean;
  issues: ValidationIssue[];
  validatorName: string;
  timestamp: Date;
}

export interface SchemaValidatorPlugin {
  /**
   * Unique identifier for this validator plugin
   */
  readonly name: string;

  /**
   * Validate a JSON Schema against this validator's rules
   * @param schema - JSON Schema object to validate
   * @returns ValidationResult with any issues found
   */
  validate(schema: any): Promise<ValidationResult>;

  /**
   * Get the name/type of this validator
   * @returns Human-readable validator name
   */
  getValidatorName(): string;

  /**
   * Get description of what this validator checks
   * @returns Description of validation rules
   */
  getDescription(): string;
}
