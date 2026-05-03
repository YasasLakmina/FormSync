/**
 * Replacement body for App.tsx between FORMSYNC_API_SUBMIT markers (wired fullstack).
 * Must stay aligned with vanilla-submit.ts fetch semantics.
 */

export interface ReactWireReplacementOptions {
  /** Pretty-printed JSON for FIELD_TYPES object literal */
  serializedFieldTypes: string;
  apiPath: string;
  backendPort: number;
}

export function buildReactWiredSubmitReplacement(
  opts: ReactWireReplacementOptions,
): string {
  const apiPathEscaped = opts.apiPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `/* FORMSYNC_API_SUBMIT_START */
    setStatusMessage('');
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:${opts.backendPort}";
      const API_PATH = import.meta.env.VITE_API_PATH || "${apiPathEscaped}";
      const FIELD_TYPES: Record<string, string> = ${opts.serializedFieldTypes};

      const templatePathFromIndexedPath = (path: string) =>
        path.split(".").filter((p) => !/^\\d+$/.test(p)).join(".");

      const resolveFieldType = (path: string): string | undefined =>
        FIELD_TYPES[path] ?? FIELD_TYPES[templatePathFromIndexedPath(path)];

      const setDeepValue = (target: Record<string, any>, path: string, value: any) => {
        const parts = path.split(".");
        let current: Record<string, any> = target;
        for (let i = 0; i < parts.length - 1; i++) {
          const segment = parts[i]!;
          if (
            typeof current[segment] !== "object" ||
            current[segment] === null ||
            Array.isArray(current[segment])
          ) {
            current[segment] = {};
          }
          current = current[segment];
        }
        current[parts[parts.length - 1]!] = value;
      };

      const coerceValue = (fieldType: string | undefined, rawValue: FormDataEntryValue) => {
        if (fieldType === "number") {
          const value = typeof rawValue === "string" ? rawValue.trim() : String(rawValue);
          if (!value) return null;
          const numeric = Number(value);
          return Number.isNaN(numeric) ? null : numeric;
        }
        if (fieldType === "checkbox") {
          if (typeof rawValue !== "string") return false;
          return rawValue === "on" || rawValue === "true" || rawValue === "1";
        }
        return rawValue;
      };

      const numericKeysToArrays = (value: unknown): unknown => {
        if (value === null || typeof value !== "object") return value;
        if (Array.isArray(value)) return value.map(numericKeysToArrays);
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj);
        const allNumeric =
          keys.length > 0 && keys.every((k) => /^\\d+$/.test(k));
        if (allNumeric) {
          const sorted = keys.sort((a, b) => Number(a) - Number(b));
          return sorted.map((k) => numericKeysToArrays(obj[k]));
        }
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
          out[k] = numericKeysToArrays(v);
        }
        return out;
      };

      const stripEmptyJsonValues = (value: unknown): unknown => {
        if (value === "" || value === null || value === undefined) return undefined;
        if (typeof value !== "object") return value;
        if (Array.isArray(value)) {
          return value
            .map(stripEmptyJsonValues)
            .filter((v) => v !== undefined);
        }
        const o = value as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(o)) {
          const s = stripEmptyJsonValues(v);
          if (s === undefined) continue;
          if (
            typeof s === "object" &&
            s !== null &&
            !Array.isArray(s) &&
            Object.keys(s as Record<string, unknown>).length === 0
          ) {
            continue;
          }
          out[k] = s;
        }
        return out;
      };

      const readAsDataURL = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(typeof r.result === "string" ? r.result : "");
          r.onerror = () => reject(r.error);
          r.readAsDataURL(file);
        });

      const embedFileInputsAsBase64 = async (
        form: HTMLFormElement,
        payload: Record<string, any>,
      ) => {
        const inputs = form.querySelectorAll<HTMLInputElement>('input[type="file"][name]');
        for (const input of inputs) {
          const name = input.name;
          const ft = resolveFieldType(name);
          if (ft !== "file") continue;
          const files = input.files;
          if (!files || files.length === 0) {
            setDeepValue(payload, name, undefined);
            continue;
          }
          if (input.multiple) {
            const urls = await Promise.all(Array.from(files).map((f) => readAsDataURL(f)));
            setDeepValue(payload, name, urls);
          } else {
            setDeepValue(payload, name, await readAsDataURL(files[0]!));
          }
        }
      };

      const toPayload = (form: HTMLFormElement) => {
        const payload: Record<string, any> = {};
        const formData = new FormData(form);

        for (const [key, value] of formData.entries()) {
          if (value instanceof File) continue;
          setDeepValue(payload, key, coerceValue(resolveFieldType(key), value));
        }

        const checkboxes = Array.from(
          form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name]'),
        );
        for (const checkbox of checkboxes) {
          if (!checkbox.checked) {
            setDeepValue(payload, checkbox.name, false);
          }
        }

        return payload;
      };

      const payload = toPayload(e.currentTarget);
      await embedFileInputsAsBase64(e.currentTarget, payload);
      const withArrays = numericKeysToArrays(payload);
      const jsonBody = stripEmptyJsonValues(withArrays);
      const response = await fetch(\`\${API_BASE_URL}\${API_PATH}\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonBody !== undefined ? jsonBody : {}),
      });

      if (!response.ok) {
        throw new Error(\`Submission failed (\${response.status})\`);
      }

      alert("Submitted successfully");
      console.log("Form submitted:", jsonBody !== undefined ? jsonBody : {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      setStatusMessage(msg);
    }
    /* FORMSYNC_API_SUBMIT_END */`;
}
