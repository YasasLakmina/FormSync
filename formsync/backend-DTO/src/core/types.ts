export interface FieldSchema {
    name: string;
    type: string;
    nullable: boolean;
    primaryKey?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    isPII?: boolean;
    piiCategory?: string;
    allowHtml?: boolean;
    validations?: {
        format?: 'EMAIL' | 'UUID' | 'URL' | 'DATE' | 'DATETIME';
        pattern?: string;
        generated?: 'UUID' | 'SEQUENCE';
    };
}

export interface EntitySchema {
    entityName: string;
    packageName: string;
    tableName?: string;
    fields: FieldSchema[];
}

export interface GeneratedArtifact {
    filename: string;
    relativePath: string;
    content: string;
}

export interface GenerationResult {
    entity: EntitySchema;
    model: GeneratedArtifact;
    dto: GeneratedArtifact;
    repository: GeneratedArtifact;
    service: GeneratedArtifact;
    commonArtifacts: GeneratedArtifact[];
}

export interface RuleResult {
    annotations: string[];
    imports: string[];
    comments: string[];
}
