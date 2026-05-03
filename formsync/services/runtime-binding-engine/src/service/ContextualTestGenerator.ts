import axios from 'axios';

export class ContextualTestGenerator {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
    this.model = process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile';
    this.enabled = !!this.apiKey;
  }

  async generateJavaContextualTests(
    entityName: string,
    schema: any,
    basePackage: string
  ): Promise<string | null> {
    if (!this.enabled) {
      console.warn('[ContextualTestGenerator] OPENAI_API_KEY not set — skipping contextual test generation');
      return null;
    }

    const routeName = this.toKebabCase(entityName) + 's';
    const schemaStr = JSON.stringify(schema, null, 2);
    const exampleBody = this.buildJavaJsonBody(schema);

    const prompt = `Generate a Java JUnit 5 + Spring Boot MockMvc test class with EXACTLY 3 test methods.

Entity: ${entityName}
Base Package: ${basePackage}
REST Endpoint: /api/${routeName}

JSON Schema:
${schemaStr}

A valid JSON body for this entity (use this EXACT body in every test):
${exampleBody}

RULES — follow every rule or the tests will fail:
1. Package: package ${basePackage}.contextual;
2. Class: Contextual${entityName}Test
3. Annotations: @SpringBootTest, @AutoConfigureMockMvc, @DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
4. Inject @Autowired MockMvc mockMvc and ObjectMapper objectMapper
5. Write EXACTLY 3 test methods inside a single class (no nested classes):
   - Test 1: POST /api/${routeName} with the valid body → expect HTTP 201 and $.id is present
   - Test 2: GET /api/${routeName} → expect HTTP 200 and the JSON body is an array
   - Test 3: POST to create, capture the id from the response, then GET /api/${routeName}/{captured-id} → expect HTTP 200
6. DO NOT import any custom project classes (no DTOs, no repositories) — use raw JSON strings only
7. For Test 3 use: String responseBody = ...; Long id = objectMapper.readTree(responseBody).get("id").asLong(); then GET with that id
8. DO NOT test validation errors, missing fields, or bad data — only happy-path tests
9. Use realistic values from the "examples" in the schema (e.g. for email use "john.doe@example.com", for age use 25). For nested object fields (e.g. address), use JSON objects — never a single string.
10. Every test must call mockMvc.perform() and use andExpect(status().isXxx())
11. If you use java.util types (List, Map, Optional, Set) or Collectors in assertions, add explicit imports (e.g. import java.util.List;) — never rely on implicit imports

Required imports (include all):
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import java.util.List;
import java.util.Map;

Output ONLY the complete Java class. No markdown. No explanations. Just the raw Java code.`;

    try {
      const result = await this.callGroq(prompt);
      console.log(`[ContextualTestGenerator] Generated Java contextual tests for ${entityName}`);
      return result ? this.ensureJavaUtilImports(result) : null;
    } catch (error: any) {
      console.error(`[ContextualTestGenerator] Java test generation failed for ${entityName}:`, error.message);
      return null;
    }
  }

  async generateJsContextualTests(
    entityName: string,
    routeName: string,
    schema: any
  ): Promise<string | null> {
    if (!this.enabled) {
      console.warn('[ContextualTestGenerator] OPENAI_API_KEY not set — skipping contextual test generation');
      return null;
    }

    const schemaStr = JSON.stringify(schema, null, 2);
    const exampleBody = this.buildJsObjectLiteral(schema);

    const prompt = `Generate a Jest + Supertest test file with EXACTLY 3 test cases for an Express.js in-memory REST API.

Entity: ${entityName}
REST Endpoint: /api/${routeName}

JSON Schema:
${schemaStr}

A valid JS object for this entity (use this EXACT object in every test):
${exampleBody}

RULES — follow every rule or the tests will fail:
1. Use CommonJS: const request = require('supertest'); const app = require('../src/server');
2. Plain JavaScript only (no TypeScript)
3. Write EXACTLY 3 it() blocks under a single top-level describe():
   - Test 1: POST /api/${routeName} with the valid payload → expect 201, body has "id" property
   - Test 2: GET /api/${routeName} → expect 200, body is an array
   - Test 3: POST to create, read the returned id from res.body.id, then GET /api/${routeName}/{id} → expect 200
4. The server uses in-memory storage with auto-generated IDs (Date.now().toString()) — NEVER use schema example values as IDs for GET/PUT/DELETE
5. DO NOT test validation errors, missing fields, or boundary values — only happy-path tests
6. Use async/await in every it() block
7. Add afterAll((done) => { done(); }); at the top level
8. Use realistic values from schema "examples" (e.g. email: "john.doe@example.com", age: 25)

Output ONLY the complete JavaScript test file. No markdown. No explanations. Just the raw JavaScript code.`;

    try {
      const result = await this.callGroq(prompt);
      console.log(`[ContextualTestGenerator] Generated JS contextual tests for ${entityName}`);
      return result;
    } catch (error: any) {
      console.error(`[ContextualTestGenerator] JS test generation failed for ${entityName}:`, error.message);
      return null;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private buildJavaJsonBody(schema: any): string {
    const props = schema?.properties || {};
    const pairs: string[] = [];
    for (const [key, def] of Object.entries(props) as [string, any][]) {
      const val = this.exampleValue(key, def);
      pairs.push(`  "${key}": ${val}`);
    }
    return `{\n${pairs.join(',\n')}\n}`;
  }

  /** JSON Schema `type` may be a string or union array (e.g. `["object","null"]`). */
  private schemaTypes(def: any): string[] {
    if (!def?.type) return [];
    return Array.isArray(def.type) ? def.type : [def.type];
  }

  /** Compact JSON object fragment for nested DTOs (matches Jackson nested types). */
  private buildJsonObjectFromProps(props: Record<string, any>): string {
    const pairs: string[] = [];
    for (const [key, propDef] of Object.entries(props)) {
      pairs.push(`"${key}":${this.exampleValue(key, propDef)}`);
    }
    return `{${pairs.join(',')}}`;
  }

  private buildJsObjectLiteral(schema: any): string {
    const props = schema?.properties || {};
    const pairs: string[] = [];
    for (const [key, def] of Object.entries(props) as [string, any][]) {
      const val = this.exampleValue(key, def);
      pairs.push(`  ${key}: ${val}`);
    }
    return `{\n${pairs.join(',\n')}\n}`;
  }

  private exampleValue(fieldName: string, def: any): string {
    if (def == null) return 'null';

    const examples: any[] = def.examples || (def.example != null ? [def.example] : []);
    if (examples.length > 0) {
      const ex = examples[0];
      if (typeof ex === 'object' && ex !== null) {
        return JSON.stringify(ex);
      }
      if (typeof ex === 'string') return JSON.stringify(ex);
      if (typeof ex === 'number' || typeof ex === 'boolean') return String(ex);
    }

    const types = this.schemaTypes(def);
    const isObject =
      types.includes('object') ||
      (def.properties && typeof def.properties === 'object' && Object.keys(def.properties).length > 0);
    if (isObject) {
      const props = def.properties;
      if (props && Object.keys(props).length > 0) {
        return this.buildJsonObjectFromProps(props);
      }
      return '{}';
    }

    if (types.includes('array') || def.type === 'array') {
      const items = def.items;
      if (items && typeof items === 'object') {
        const el = this.exampleValue(`${fieldName}Item`, items);
        return `[${el}]`;
      }
      return '[]';
    }

    if (types.includes('boolean') || def.type === 'boolean') return 'true';
    if (
      types.includes('integer') ||
      types.includes('number') ||
      def.type === 'integer' ||
      def.type === 'number'
    ) {
      const min = def.minimum ?? 0;
      const max = def.maximum;
      if (max !== undefined) return String(Math.floor((Number(min) + Number(max)) / 2));
      return String(Math.max(1, Number(min || 1)));
    }
    if (def.format === 'email') return JSON.stringify('test@example.com');
    if (def.format === 'date') return JSON.stringify('2024-01-15');
    if (def.format === 'date-time') return JSON.stringify('2024-01-15T10:00:00.000Z');
    if (Array.isArray(def.enum) && def.enum.length > 0) return JSON.stringify(def.enum[0]);
    const minLen = def.minLength || 1;
    const maxLen = def.maxLength || 30;
    const targetLen = Math.min(maxLen, Math.max(minLen, 8));
    const base = `test-${fieldName}`.slice(0, targetLen).padEnd(minLen, 'x');
    return JSON.stringify(base);
  }

  private async callGroq(prompt: string): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert software testing engineer. Output only the raw code file content. No markdown code fences (no triple backticks). No explanations before or after the code. Just the code itself.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 90000
      }
    );

    let content: string = response.data.choices[0].message.content.trim();
    content = content.replace(/^```[\w]*\r?\n/, '').replace(/\r?\n```$/, '').trim();
    return content;
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
  }

  /** Groq/OpenAI often omit java.util.* imports when using List.class / Matchers.instanceOf(List.class). */
  private ensureJavaUtilImports(code: string): string {
    const pkgMatch = code.match(/^package\s+[^;]+;/m);
    if (!pkgMatch || pkgMatch.index === undefined) return code;
    const insertPos = pkgMatch.index + pkgMatch[0].length;
    const needed: string[] = [];
    const want = (imp: string, re: RegExp) => {
      if (re.test(code) && !code.includes(imp)) needed.push(imp);
    };
    want('import java.util.List;', /\bList\b/);
    want('import java.util.Map;', /\bMap\b/);
    want('import java.util.Set;', /\bSet\b/);
    want('import java.util.Optional;', /\bOptional\b/);
    want('import java.util.stream.Collectors;', /\bCollectors\b/);
    if (needed.length === 0) return code;
    return code.slice(0, insertPos) + '\n' + needed.join('\n') + code.slice(insertPos);
  }
}
