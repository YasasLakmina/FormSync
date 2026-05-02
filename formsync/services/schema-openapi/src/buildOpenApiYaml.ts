import * as yaml from 'js-yaml';
import { InternalSchema } from './InternalModel';
import { SchemaMapper } from './SchemaMapper';
import { buildOpenApiSpec } from './OpenApiSpecBuilder';
import { SchemaPayload } from './SchemaPayload';

/** Builds OpenAPI 3 YAML from an already-mapped internal schema (no duplicate mapping). */
export function buildOpenApiYamlFromInternal(schema: InternalSchema): string {
    const doc = buildOpenApiSpec(schema);
    return yaml.dump(doc, { lineWidth: -1 });
}

/** Builds OpenAPI 3 YAML from a schema API payload (maps JSON Schema first). */
export function buildOpenApiYaml(payload: SchemaPayload): string {
    const mapper = new SchemaMapper();
    const internal = mapper.map(payload);
    return buildOpenApiYamlFromInternal(internal);
}
