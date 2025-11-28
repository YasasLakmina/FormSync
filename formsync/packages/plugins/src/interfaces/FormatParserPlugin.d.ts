export interface ParseResult {
    success: boolean;
    schema?: any;
    errors?: string[];
    detectedFormat?: 'json' | 'yaml' | 'xml' | 'unknown';
}
export interface FormatParserPlugin {
    readonly name: string;
    canParse(input: string): boolean;
    parse(input: string): Promise<ParseResult>;
    getSupportedFormats(): string[];
}
