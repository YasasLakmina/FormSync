/**
 * Generated vanilla JS for static HTML export — wired API submit (inside submit handler).
 * Uses #form-status for errors (aria-live).
 */

export interface VanillaWiredSubmitOptions {
  serializedFieldTypes: string;
  apiBaseUrl: string;
  apiPath: string;
}

export function buildVanillaWiredSubmitReplacement(
  opts: VanillaWiredSubmitOptions,
): string {
  const apiBase = opts.apiBaseUrl.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const apiPathEsc = opts.apiPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `/* FORMSYNC_API_SUBMIT_START */
    var statusEl = document.getElementById("form-status");
    if (statusEl) statusEl.textContent = "";
    try {
      var API_BASE_URL = "${apiBase}";
      var API_PATH = "${apiPathEsc}";
      var FIELD_TYPES = ${opts.serializedFieldTypes};

      var templatePathFromIndexedPath = function (path) {
        return path.split(".").filter(function (p) {
          return !/^\\d+$/.test(p);
        }).join(".");
      };

      var resolveFieldType = function (path) {
        return FIELD_TYPES[path] || FIELD_TYPES[templatePathFromIndexedPath(path)];
      };

      var setDeepValue = function (target, path, value) {
        var parts = path.split(".");
        var current = target;
        for (var i = 0; i < parts.length - 1; i++) {
          var segment = parts[i];
          if (
            typeof current[segment] !== "object" ||
            current[segment] === null ||
            Array.isArray(current[segment])
          ) {
            current[segment] = {};
          }
          current = current[segment];
        }
        current[parts[parts.length - 1]] = value;
      };

      var coerceValue = function (fieldType, rawValue) {
        if (fieldType === "number") {
          var value = typeof rawValue === "string" ? rawValue.trim() : String(rawValue);
          if (!value) return null;
          var numeric = Number(value);
          return isNaN(numeric) ? null : numeric;
        }
        if (fieldType === "checkbox") {
          if (typeof rawValue !== "string") return false;
          return rawValue === "on" || rawValue === "true" || rawValue === "1";
        }
        return rawValue;
      };

      var numericKeysToArrays = function (value) {
        if (value === null || typeof value !== "object") return value;
        if (Array.isArray(value)) return value.map(numericKeysToArrays);
        var keys = Object.keys(value);
        var allNumeric = keys.length > 0 && keys.every(function (k) {
          return /^\\d+$/.test(k);
        });
        if (allNumeric) {
          return keys
            .sort(function (a, b) {
              return Number(a) - Number(b);
            })
            .map(function (k) {
              return numericKeysToArrays(value[k]);
            });
        }
        var out = {};
        for (var k in value) {
          if (!Object.prototype.hasOwnProperty.call(value, k)) continue;
          out[k] = numericKeysToArrays(value[k]);
        }
        return out;
      };

      var stripEmptyJsonValues = function (value) {
        if (value === "" || value === null || value === undefined) return undefined;
        if (typeof value !== "object") return value;
        if (Array.isArray(value)) {
          return value.map(stripEmptyJsonValues).filter(function (v) {
            return v !== undefined;
          });
        }
        var obj = value;
        var out = {};
        for (var k in obj) {
          if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
          var s = stripEmptyJsonValues(obj[k]);
          if (s === undefined) continue;
          if (
            typeof s === "object" &&
            s !== null &&
            !Array.isArray(s) &&
            Object.keys(s).length === 0
          ) {
            continue;
          }
          out[k] = s;
        }
        return out;
      };

      var readAsDataURL = function (file) {
        return new Promise(function (resolve, reject) {
          var r = new FileReader();
          r.onload = function () {
            resolve(typeof r.result === "string" ? r.result : "");
          };
          r.onerror = function () {
            reject(r.error);
          };
          r.readAsDataURL(file);
        });
      };

      var embedFileInputsAsBase64 = async function (form, payload) {
        var inputs = form.querySelectorAll('input[type="file"][name]');
        for (var i = 0; i < inputs.length; i++) {
          var input = inputs[i];
          var name = input.name;
          if (resolveFieldType(name) !== "file") continue;
          var files = input.files;
          if (!files || files.length === 0) {
            setDeepValue(payload, name, undefined);
            continue;
          }
          if (input.multiple) {
            var urls = await Promise.all(
              Array.prototype.map.call(files, function (f) {
                return readAsDataURL(f);
              }),
            );
            setDeepValue(payload, name, urls);
          } else {
            setDeepValue(payload, name, await readAsDataURL(files[0]));
          }
        }
      };

      var toPayload = function (form) {
        var payload = {};
        var formData = new FormData(form);
        var it = formData.entries();
        var step = it.next();
        while (!step.done) {
          var key = step.value[0];
          var value = step.value[1];
          if (value instanceof File) {
            step = it.next();
            continue;
          }
          setDeepValue(payload, key, coerceValue(resolveFieldType(key), value));
          step = it.next();
        }
        var checkboxes = form.querySelectorAll('input[type="checkbox"][name]');
        for (var i = 0; i < checkboxes.length; i++) {
          var checkbox = checkboxes[i];
          if (!checkbox.checked) {
            setDeepValue(payload, checkbox.name, false);
          }
        }
        return payload;
      };

      var payload = toPayload(form);
      await embedFileInputsAsBase64(form, payload);
      var withArrays = numericKeysToArrays(payload);
      var jsonBody = stripEmptyJsonValues(withArrays);
      var response = await fetch(API_BASE_URL + API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonBody !== undefined ? jsonBody : {}),
      });

      if (!response.ok) {
        throw new Error("Submission failed (" + response.status + ")");
      }

      alert("Submitted successfully");
      console.log("Form submitted:", jsonBody !== undefined ? jsonBody : {});
    } catch (err) {
      var msg = err && err.message ? err.message : "Submission failed";
      var statusEl = document.getElementById("form-status");
      if (statusEl) statusEl.textContent = msg;
    }
    /* FORMSYNC_API_SUBMIT_END */`;
}
