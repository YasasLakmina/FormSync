/**
 * Silence expected console output during tests (e.g. SchemaApiClient error logs,
 * BackendGenerator completion logs, server request logs).
 */
beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});
