export interface SchemaPayload {
  name: string;
  description?: string;
  content: any;
  version?: string;
  sourceFormat?: string;
  tags?: string[];
  status?: "draft" | "validated" | "enhanced" | "published";
}
