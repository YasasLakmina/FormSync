export interface SchemaPayload {
  name: string;
  description?: string;
  content: any;
  version?: string;
  sourceFormat?: string;
  tags?: string[];
  status?: 'draft' | 'validated' | 'enhanced' | 'published';
}

export interface DotNetGeneratorConfig {
  outputDir?: string;
  namespace?: string;
  serverPort?: number;
  includeSwagger?: boolean;
}
