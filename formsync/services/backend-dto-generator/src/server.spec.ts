import request from "supertest";
import { createApp } from "./server";
import { BackendGenerator } from "./generator/BackendGenerator";
import { ZipService } from "./service/ZipService";
import { SchemaApiClient } from "./client/SchemaApiClient";

const minimalSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
  },
};

describe("POST /generate", () => {
  it("should return 400 when body has no schema, no schemaId, and no inline schema", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/generate")
      .send({})
      .expect(400);

    expect(res.body.error).toMatch(/Schema or Schema ID is required/);
  });

  it("should return 400 when schema is missing and schemaId is not provided", async () => {
    const app = createApp();
    await request(app)
      .post("/generate")
      .send({ config: {} })
      .expect(400);
  });

  it("should return 404 when schemaId is provided and fetch fails", async () => {
    const mockSchemaClient = {
      fetchSchema: jest.fn().mockRejectedValue(new Error("Not found")),
    } as unknown as SchemaApiClient;

    const app = createApp({ schemaClient: mockSchemaClient });

    const res = await request(app)
      .post("/generate")
      .send({ schemaId: "missing-id" })
      .expect(404);

    expect(res.body.error).toMatch(/Failed to fetch schema missing-id/);
    expect(mockSchemaClient.fetchSchema).toHaveBeenCalledWith("missing-id");
  });

  it("should return 200 with zip attachment when schema provided and preview is false", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/generate")
      .send({ schema: minimalSchema })
      .expect(200);

    expect(res.headers["content-type"]).toMatch(/application\/zip/);
    expect(res.headers["content-disposition"]).toMatch(
      /attachment.*generated-backend\.zip/
    );
    const body = res.body;
    if (Buffer.isBuffer(body)) {
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toBe(0x50);
      expect(body[1]).toBe(0x4b);
    } else if (typeof body === "string" && body.length > 0) {
      const buf = Buffer.from(body, "binary");
      expect(buf[0]).toBe(0x50);
      expect(buf[1]).toBe(0x4b);
    }
  });

  it("should return 200 with files array when preview is true", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/generate")
      .send({ schema: minimalSchema, preview: true })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.files)).toBe(true);
    expect(res.body.files.length).toBeGreaterThan(0);
    const pom = res.body.files.find(
      (f: { path: string }) => f.path === "pom.xml"
    );
    expect(pom).toBeDefined();
    expect(typeof pom.content).toBe("string");
    expect(pom.content).toContain("<?xml");
  });

  it("should accept inline schema (type/properties in body without schema key)", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/generate")
      .send({
        type: "object",
        properties: { id: { type: "string" } },
        preview: true,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.files.length).toBeGreaterThan(0);
  });

  it("should return 500 when generation throws", async () => {
    const mockGenerator = {
      generate: jest.fn().mockRejectedValue(new Error("Template failed")),
    } as unknown as BackendGenerator;

    const app = createApp({ generator: mockGenerator });

    const res = await request(app)
      .post("/generate")
      .send({ schema: minimalSchema })
      .expect(500);

    expect(res.status).toBe(500);
    if (res.body && typeof res.body === "object" && "error" in res.body) {
      expect(res.body.error).toBe("Generation failed");
      expect(res.body.message).toContain("Template failed");
    }
  });
});
