export type ValidationSeverity = 'error' | 'warning' | 'info';
export interface ValidationIssue {
    id: string;
    path: string;
    severity: ValidationSeverity;
    message: string;
    suggestion?: string;
}
export interface ValidationResult {
    success: boolean;
    issues: ValidationIssue[];
    validatorName: string;
    timestamp: Date;
}
export interface SchemaValidatorPlugin {
    readonly name: string;
    validate(schema: any): Promise<ValidationResult>;
    getValidatorName(): string;
    getDescription(): string;
}
