export interface FormMetadata {
  name: string;
  version?: string;
  submitEndpoint?: string;
  method?: string;
}

export interface FieldValidation {
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface FieldUI {
  label: string;
  placeholder?: string;
  type?: string;
}

export interface Field {
  name: string;
  type: string;
  required: boolean;
  validation?: FieldValidation;
  ui?: FieldUI;
}

export interface BackendConfig {
  package: string;
  controller?: {
    name: string;
  };
  dto?: {
    name: string;
  };
}

export interface FrontendConfig {
  framework?: string;
  formLibrary?: string;
}

export interface FormSyncSchema {
  form: FormMetadata;
  fields: Field[];
  backend: BackendConfig;
  frontend?: FrontendConfig;
}
