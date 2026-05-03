/**
 * Schema-ui types: canonical FormModel from @formsync/form-types; JSON Schema adapters stay local.
 */

export type {
  FieldType,
  FieldModel,
  FieldConstraints,
  FieldUIConfig,
  FieldXUI,
  AsyncSourceConfig,
  FieldConditions,
  ConditionRule,
  ConditionOperator,
  FieldStyleOverrides,
  ThemeColors,
  ThemeConfig,
  LayoutConfig,
  FormStep,
  SubmitConfig,
  FormModel,
} from "@formsync/form-types";

import type {
  FieldModel,
  FieldType,
  FormModel,
  LayoutConfig,
  ThemeConfig,
  FieldConstraints,
  FieldUIConfig,
} from "@formsync/form-types";

// ─── JSON Schema adapter ──────────────────────────────────────────────────────

export interface JsonSchema {
  $id?: string;
  title?: string;
  description?: string;
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  enum?: (string | number)[];
  default?: string | number | boolean | null;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  format?: string;
  items?: JsonSchema;
  contentEncoding?: string;
  [key: string]: unknown;
}

function humanizeLabel(key: string): string {
  return key
    .split(".")
    .map((part) =>
      part
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim(),
    )
    .join(" ");
}

function mapPropertyToField(key: string, schema: JsonSchema, isRequired: boolean): FieldModel {
  const label = (schema.title as string) || humanizeLabel(key);
  let type: FieldType = "unknown";

  const xFieldType = schema["x-field-type"] as FieldType | undefined;
  if (xFieldType && typeof xFieldType === "string") {
    type = xFieldType;
  } else if (schema.enum) {
    type = "select";
  } else if (schema.type === "boolean") {
    type = "checkbox";
  } else if (schema.type === "integer" || schema.type === "number") {
    type = "number";
  } else if (schema.type === "string") {
    if (schema.format === "date" || schema.format === "date-time") type = "date";
    else if (schema.format === "email") type = "email";
    else type = "text";
  }

  const constraints: FieldConstraints = {};
  if (schema.minimum !== undefined) constraints.min = schema.minimum as number;
  if (schema.maximum !== undefined) constraints.max = schema.maximum as number;
  if (schema.minLength !== undefined) constraints.minLength = schema.minLength as number;
  if (schema.maxLength !== undefined) constraints.maxLength = schema.maxLength as number;
  if (schema.pattern !== undefined) constraints.pattern = schema.pattern as string;
  if (schema.enum !== undefined) constraints.enum = schema.enum.map(String);

  const field: FieldModel = {
    id: `field-${key.replace(/\./g, "-")}`,
    key,
    type,
    label,
    required: isRequired,
    constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
    ui: {},
  };

  if (
    schema.default !== undefined &&
    (typeof schema.default === "string" ||
      typeof schema.default === "number" ||
      typeof schema.default === "boolean")
  ) {
    field.defaultValue = schema.default;
  }

  const xCalc = schema["x-calc"];
  if (typeof xCalc === "string") field["x-calc"] = xCalc;

  const xUi = schema["x-ui"];
  if (xUi && typeof xUi === "object") {
    field.ui = { ...(field.ui ?? {}), "x-ui": xUi as NonNullable<FieldUIConfig["x-ui"]> };
  }
  const xCond = schema["x-conditions"];
  if (xCond && typeof xCond === "object") {
    field.ui = {
      ...(field.ui ?? {}),
      "x-conditions": xCond as NonNullable<FieldUIConfig["x-conditions"]>,
    };
  }

  return field;
}

function extractFields(schema: JsonSchema, parentKey = ""): FieldModel[] {
  const fields: FieldModel[] = [];
  const properties = schema.properties || {};
  const currentRequiredList = schema.required || [];

  for (const [key, propSchema] of Object.entries(properties)) {
    if (!propSchema || typeof propSchema !== "object") continue;

    const compositeKey = parentKey ? `${parentKey}.${key}` : key;
    const isRequired = currentRequiredList.includes(key);

    const xFieldType = propSchema["x-field-type"] as string | undefined;

    if (propSchema.type === "array" && propSchema.items && typeof propSchema.items === "object") {
      const items = propSchema.items as JsonSchema;
      const itemProps = items.properties;
      if (itemProps && typeof itemProps === "object") {
        const children: FieldModel[] = [];
        const itemRequired = (items.required as string[] | undefined) ?? [];
        for (const [childKey, childSchema] of Object.entries(itemProps)) {
          if (!childSchema || typeof childSchema !== "object") continue;
          const childComposite = `${compositeKey}.${childKey}`;
          const childReq = itemRequired.includes(childKey);
          if (childSchema.type === "object" && childSchema.properties) {
            children.push({
              id: `field-${childComposite.replace(/\./g, "-")}`,
              key: childComposite,
              type: "group",
              label: (childSchema.title as string) || humanizeLabel(childKey),
              required: childReq,
              children: extractFields(childSchema, childComposite),
              ui: {},
            });
          } else {
            children.push(mapPropertyToField(childComposite, childSchema, childReq));
          }
        }
        fields.push({
          id: `field-${compositeKey.replace(/\./g, "-")}`,
          key: compositeKey,
          type: "repeater",
          label: (propSchema.title as string) || humanizeLabel(key),
          required: isRequired,
          children,
          ui: {},
        });
        continue;
      }
    }

    if (propSchema.type === "object" && propSchema.properties) {
      if (xFieldType === "repeater") {
        const children = extractFields(propSchema, compositeKey);
        fields.push({
          id: `field-${compositeKey.replace(/\./g, "-")}`,
          key: compositeKey,
          type: "repeater",
          label: (propSchema.title as string) || humanizeLabel(key),
          required: isRequired,
          children,
          ui: {},
        });
        continue;
      }
      fields.push({
        id: `field-${compositeKey.replace(/\./g, "-")}`,
        key: compositeKey,
        type: "group",
        label: (propSchema.title as string) || humanizeLabel(key),
        required: isRequired,
        children: extractFields(propSchema, compositeKey),
        ui: {},
      });
    } else {
      fields.push(mapPropertyToField(compositeKey, propSchema, isRequired));
    }
  }

  return fields;
}

export function parseJsonSchemaToFormModel(schema: JsonSchema): FormModel {
  const fields = extractFields(schema);
  const layout: LayoutConfig = { order: fields.map((f) => f.id) };
  const theme: ThemeConfig = {
    mode: "light",
    density: "normal",
    radius: 4,
    colors: {
      primary: "#000000",
      background: "#ffffff",
      surface: "#ffffff",
      text: "#111827",
      muted: "#6b7280",
      border: "#e5e7eb",
      error: "#ef4444",
      inputBackground: "#ffffff",
    },
    typography: { fontFamily: "Inter, sans-serif", baseFontSize: 16 },
  };

  return {
    id: schema.$id || "form-" + Date.now().toString(36),
    name: schema.title || "Untitled Form",
    version: "1.0.0",
    meta: { title: schema.title, description: schema.description },
    theme,
    layout,
    fields,
    submit: { text: "Submit" },
  };
}

// ─── FormModel → JSON Schema ─────────────────────────────────────────────────

/** Top-level JSON Schema property name for a root field key (first segment only). */
function topLevelPropertyKey(field: FieldModel): string {
  if (!field.key.includes(".")) return field.key;
  return field.key.split(".")[0]!;
}

function leafFieldToJsonSchema(field: FieldModel): JsonSchema {
  const prop: JsonSchema = { title: field.label };

  if (field.ui?.helpText) {
    prop.description = field.ui.helpText;
  }

  switch (field.type) {
    case "checkbox":
      prop.type = "boolean";
      break;
    case "number":
      prop.type = "number";
      if (field.constraints?.min !== undefined) prop.minimum = field.constraints.min;
      if (field.constraints?.max !== undefined) prop.maximum = field.constraints.max;
      break;
    case "select":
      prop.type = "string";
      if (field.constraints?.enum?.length) {
        prop.enum = field.constraints.enum.map((e) => e as string | number);
      }
      break;
    case "date":
      prop.type = "string";
      prop.format = "date";
      break;
    case "email":
      prop.type = "string";
      prop.format = "email";
      break;
    case "password":
      prop.type = "string";
      prop.format = "password";
      break;
    case "textarea":
      prop.type = "string";
      break;
    case "file":
      prop.type = "string";
      prop.contentEncoding = "base64";
      prop["x-field-type"] = "file";
      break;
    case "richtext":
    case "signature":
    case "typeahead":
    case "calculated":
      prop.type = "string";
      prop["x-field-type"] = field.type;
      break;
    case "repeater":
      prop.type = "string";
      prop["x-field-type"] = "repeater";
      break;
    case "unknown":
      prop.type = "string";
      prop["x-field-type"] = "unknown";
      break;
    default:
      prop.type = "string";
  }

  if (field.constraints?.minLength !== undefined) prop.minLength = field.constraints.minLength;
  if (field.constraints?.maxLength !== undefined) prop.maxLength = field.constraints.maxLength;
  if (field.constraints?.pattern !== undefined) prop.pattern = field.constraints.pattern;

  if (
    field.defaultValue !== undefined &&
    (typeof field.defaultValue === "string" ||
      typeof field.defaultValue === "number" ||
      typeof field.defaultValue === "boolean")
  ) {
    prop.default = field.defaultValue;
  }

  const ui = field.ui;
  if (ui?.["x-conditions"]) prop["x-conditions"] = ui["x-conditions"];
  if (ui?.["x-ui"]) prop["x-ui"] = ui["x-ui"];
  if (field["x-calc"]) prop["x-calc"] = field["x-calc"];

  return prop;
}

function groupFieldToJsonSchema(field: FieldModel): JsonSchema {
  const parentKey = field.key;
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const child of field.children ?? []) {
    const rel = child.key.startsWith(parentKey + ".") ? child.key.slice(parentKey.length + 1) : child.key;
    const propName = rel.includes(".") ? rel.split(".")[0]! : rel;

    if (properties[propName]) continue;

    if (child.type === "group") {
      properties[propName] = groupFieldToJsonSchema(child);
    } else if (child.type === "repeater") {
      properties[propName] = repeaterFieldToJsonSchema(child);
    } else {
      properties[propName] = leafFieldToJsonSchema(child);
    }

    if (child.required) {
      required.push(propName);
    }
  }

  const schema: JsonSchema = {
    type: "object",
    title: field.label,
    properties,
  };

  const uniq = [...new Set(required)];
  if (uniq.length > 0) {
    schema.required = uniq;
  }

  return schema;
}

/** Build JSON Schema for a repeater: array of objects from children (same nesting rules as group items). */
function repeaterFieldToJsonSchema(field: FieldModel): JsonSchema {
  const parentKey = field.key;
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const child of field.children ?? []) {
    const rel = child.key.startsWith(parentKey + ".") ? child.key.slice(parentKey.length + 1) : child.key;
    const propName = rel.includes(".") ? rel.split(".")[0]! : rel;

    if (properties[propName]) continue;

    if (child.type === "group") {
      properties[propName] = groupFieldToJsonSchema(child);
    } else if (child.type === "repeater") {
      properties[propName] = repeaterFieldToJsonSchema(child);
    } else {
      properties[propName] = leafFieldToJsonSchema(child);
    }

    if (child.required) {
      required.push(propName);
    }
  }

  const items: JsonSchema = {
    type: "object",
    properties,
  };
  const uniq = [...new Set(required)];
  if (uniq.length > 0) {
    items.required = uniq;
  }

  return {
    type: "array",
    title: field.label,
    items,
    "x-field-type": "repeater",
  };
}

/**
 * Serializes the builder FormModel to JSON Schema, optionally merging onto a loaded base
 * so extensions like `$schema` and `x-formsync-metadata` are preserved.
 */
export function formModelToJsonSchema(form: FormModel, base?: JsonSchema): JsonSchema {
  const merged: JsonSchema = base ? ({ ...base } as JsonSchema) : { $schema: "http://json-schema.org/draft-07/schema#" };

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  const byId = new Map(form.fields.map((f) => [f.id, f] as const));

  for (const fieldId of form.layout.order) {
    const field = byId.get(fieldId);
    if (!field) continue;

    const propKey = topLevelPropertyKey(field);
    if (properties[propKey]) continue;

    if (field.type === "group") {
      properties[propKey] = groupFieldToJsonSchema(field);
    } else if (field.type === "repeater") {
      properties[propKey] = repeaterFieldToJsonSchema(field);
    } else {
      properties[propKey] = leafFieldToJsonSchema(field);
    }

    if (field.required) {
      required.push(propKey);
    }
  }

  merged.type = "object";
  merged.title = form.meta?.title ?? form.name;
  if (form.meta?.description !== undefined) {
    merged.description = form.meta.description;
  }
  merged.properties = properties;
  const uniqReq = [...new Set(required)];
  merged.required = uniqReq.length > 0 ? uniqReq : undefined;

  return merged;
}

export interface BuilderJsonSchemaValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Structural validation for builder-produced object schemas (root + nested groups).
 * Does not guarantee full JSON Schema draft compliance.
 */
export function validateBuilderJsonSchema(schema: unknown): BuilderJsonSchemaValidationResult {
  const errors: string[] = [];

  function checkObjectSchema(obj: Record<string, unknown>, path: string): void {
    if (obj.type !== undefined && obj.type !== "object") {
      errors.push(`${path}: object schemas must have type "object"`);
    }

    const props = obj.properties;
    if (!props || typeof props !== "object" || Array.isArray(props)) {
      errors.push(`${path}.properties must be an object`);
      return;
    }

    const req = obj.required;
    if (req !== undefined) {
      if (!Array.isArray(req)) {
        errors.push(`${path}.required must be an array`);
      } else {
        const keys = Object.keys(props as Record<string, unknown>);
        for (const entry of req) {
          if (typeof entry !== "string") {
            errors.push(`${path}.required entries must be strings`);
          } else if (!keys.includes(entry)) {
            errors.push(`${path}.required references unknown property "${entry}"`);
          }
        }
      }
    }

    for (const [key, val] of Object.entries(props)) {
      if (!val || typeof val !== "object" || Array.isArray(val)) {
        errors.push(`${path}.properties["${key}"] must be an object`);
        continue;
      }
      const sub = val as Record<string, unknown>;
      if (sub.type === "object" && sub.properties) {
        checkObjectSchema(sub as Record<string, unknown>, `${path}.properties["${key}"]`);
      }
      if (sub.type === "array" && sub.items && typeof sub.items === "object" && !Array.isArray(sub.items)) {
        const items = sub.items as Record<string, unknown>;
        if (items.type === "object" && items.properties) {
          checkObjectSchema(items as Record<string, unknown>, `${path}.properties["${key}"].items`);
        }
      }
    }
  }

  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    errors.push("$: schema must be an object");
    return { valid: false, errors };
  }

  checkObjectSchema(schema as Record<string, unknown>, "$");

  return { valid: errors.length === 0, errors };
}
