/**
 * Static HTML + Bootstrap 5 + vanilla JS from FormModel.
 * Field markup aligned with react-generator semantics (palette parity).
 */

import { buildVanillaWiredSubmitReplacement } from "@formsync/formgen-shared";
import type { FieldModel, FormModel } from "../types";

const AUTO_COMPLETE_MAP: Record<string, string> = {
  name: "name",
  firstName: "given-name",
  lastName: "family-name",
  email: "email",
  phone: "tel",
  mobile: "tel",
  password: "current-password",
  newPassword: "new-password",
  street: "street-address",
  city: "address-level2",
  state: "address-level1",
  zip: "postal-code",
  country: "country-name",
  organisation: "organization",
  company: "organization",
};

export interface StaticGeneratorWiring {
  apiBaseUrl: string;
  apiPath: string;
}

export interface RepeaterCtx {
  repeaterRoot: string;
  rowIdx: number;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/** Mirrors react-generator: JSON for client-side FIELD_RULES. */
function buildClientFieldRulesJson(formModel: FormModel): string {
  type Rule = {
    label: string;
    type: string;
    required: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  const rules: Record<string, Rule> = {};
  const walk = (fields: FieldModel[]) => {
    for (const f of fields) {
      if (f.type === "group" || f.type === "repeater") {
        if (f.children?.length) walk(f.children);
      } else {
        const r: Rule = {
          label: f.label,
          type: f.type,
          required: f.required,
        };
        const c = f.constraints;
        if (c?.min !== undefined) r.min = c.min;
        if (c?.max !== undefined) r.max = c.max;
        if (c?.minLength !== undefined) r.minLength = c.minLength;
        if (c?.maxLength !== undefined) r.maxLength = c.maxLength;
        if (c?.pattern !== undefined) r.pattern = c.pattern;
        rules[f.key] = r;
      }
    }
  };
  walk(formModel.fields);
  return JSON.stringify(rules);
}

/** Vanilla JS: templatePathFromIndexedPath + validateForm (parity with React export). */
function buildVanillaClientValidationSource(): string {
  return `
  function templatePathFromIndexedPath(path) {
    return path.split(".").filter(function (p) {
      return !/^\\d+$/.test(p);
    }).join(".");
  }

  function validateForm(form, rules) {
    var errs = {};
    var emailRe = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

    function applyTextRules(rule, raw, path) {
      var v = String(raw || "").trim();
      if (rule.required && v === "") {
        errs[path] = rule.label + " is required.";
        return;
      }
      if (v === "") return;

      if (rule.type === "number") {
        var normalized = v.replace(/\\s/g, "");
        if (/[eE]/.test(normalized)) {
          errs[path] = rule.label + " must be a valid number.";
          return;
        }
        if (!/^-?(?:\\d+\\.?\\d*|\\.\\d+)$/.test(normalized)) {
          errs[path] = rule.label + " must be a valid number.";
          return;
        }
        var num = Number(normalized);
        if (isNaN(num)) {
          errs[path] = rule.label + " must be a valid number.";
          return;
        }
        var disallowNegative = rule.min !== undefined && rule.min >= 0;
        if (disallowNegative && num < 0) {
          errs[path] = rule.label + " cannot be negative.";
          return;
        }
        if (rule.min !== undefined && num < rule.min) {
          errs[path] = rule.label + " must be at least " + rule.min + ".";
          return;
        }
        if (rule.max !== undefined && num > rule.max) {
          errs[path] = rule.label + " must be at most " + rule.max + ".";
          return;
        }
      } else if (rule.type === "email") {
        if (!emailRe.test(v)) errs[path] = "Enter a valid email address.";
      }

      if (!errs[path] && rule.minLength !== undefined && v.length < rule.minLength) {
        errs[path] = rule.label + " is too short.";
      }
      if (!errs[path] && rule.maxLength !== undefined && v.length > rule.maxLength) {
        errs[path] = rule.label + " is too long.";
      }
      if (!errs[path] && rule.pattern) {
        try {
          var re = new RegExp(rule.pattern);
          if (!re.test(v)) errs[path] = rule.label + " format is invalid.";
        } catch (e) {}
      }
    }

    var named = form.querySelectorAll("[name]");
    for (var i = 0; i < named.length; i++) {
      var el = named[i];
      var nm = el.name;
      if (!nm) continue;
      var tk = templatePathFromIndexedPath(nm);
      var rule = rules[tk];
      if (!rule) continue;

      var tag = el.tagName.toLowerCase();

      if (tag === "input") {
        var inp = el;
        var ty = inp.type;
        if (ty === "checkbox") {
          if (rule.required && !inp.checked) errs[nm] = rule.label + " is required.";
          continue;
        }
        if (ty === "file") {
          if (rule.required && (!inp.files || inp.files.length === 0)) errs[nm] = rule.label + " is required.";
          continue;
        }
        if (ty === "hidden") {
          if (rule.required && !(inp.value || "").trim()) errs[nm] = rule.label + " is required.";
          continue;
        }
        if (inp.readOnly && rule.type === "calculated") continue;
        applyTextRules(rule, inp.value || "", nm);
        continue;
      }

      if (tag === "select") {
        var val = el.value;
        if (rule.required && (val === "" || val == null)) errs[nm] = rule.label + " is required.";
        continue;
      }

      if (tag === "textarea") {
        applyTextRules(rule, el.value || "", nm);
      }
    }

    return errs;
  }
`;
}

function relativeUnderRepeater(repeaterRoot: string, fieldKey: string): string {
  if (fieldKey.startsWith(repeaterRoot + ".")) return fieldKey.slice(repeaterRoot.length + 1);
  return fieldKey;
}

/** Indexed name for repeater rows (matches React export). */
function indexedName(repeaterRoot: string, field: FieldModel, rowIdx: number): string {
  const rel = relativeUnderRepeater(repeaterRoot, field.key);
  return `${repeaterRoot}.${rowIdx}.${rel}`;
}

function domIdFor(field: FieldModel, domIdByKey: Map<string, string>, ctx?: RepeaterCtx): string {
  const base = domIdByKey.get(field.key) ?? field.id;
  if (!ctx) return base;
  return `${base}_r${ctx.rowIdx}`;
}

function collectAllFields(fields: FieldModel[]): FieldModel[] {
  const result: FieldModel[] = [];
  for (const f of fields) {
    if ((f.type === "group" || f.type === "repeater") && f.children?.length) {
      result.push(...collectAllFields(f.children));
    } else {
      result.push(f);
    }
  }
  return result;
}

function generateBootstrapField(field: FieldModel, domIdByKey: Map<string, string>, ctx?: RepeaterCtx): string {
  const { key, type, label, required, ui } = field;
  const nameAttr = ctx ? escapeHtml(indexedName(ctx.repeaterRoot, field, ctx.rowIdx)) : escapeHtml(key);
  const domId = domIdFor(field, domIdByKey, ctx);
  const explicitPlaceholder = ui?.placeholder;
  const computedPlaceholder = explicitPlaceholder ?? `Enter ${label.toLowerCase()}...`;
  const placeholder = type === "date" ? "" : computedPlaceholder;
  const helpText = ui?.helpText;
  const autoComplete = AUTO_COMPLETE_MAP[key] ?? "";

  if (type === "repeater") {
    const children = field.children || [];
    if (children.some((c) => c.type === "repeater")) {
      return `<div class="border rounded p-3 mb-4"><p class="text-muted small mb-0">Nested repeaters are not supported in this export.</p></div>`;
    }
    const inner = children
      .map((c) => generateBootstrapField(c, domIdByKey, { repeaterRoot: field.key, rowIdx: 0 }))
      .join("\n");
    const rootEsc = escapeHtml(field.key);
    return `<fieldset class="border rounded p-3 mb-4" data-fs-repeater="${rootEsc}">
  <legend class="float-none w-auto px-2 fs-6 fw-semibold">${escapeHtml(label)}</legend>
  <div class="repeater-rows">
    <div class="repeater-row border rounded p-3 mb-2 bg-light" data-row-index="0">
      ${inner}
    </div>
  </div>
  <button type="button" class="btn btn-sm btn-outline-secondary me-2 fs-repeater-remove" style="display:none">Remove row</button>
  <button type="button" class="btn btn-sm btn-outline-primary fs-repeater-add">Add row</button>
</fieldset>`;
  }

  if (type === "group") {
    const children = field.children || [];
    const inner = children.map((c) => generateBootstrapField(c, domIdByKey, ctx)).join("\n");
    return `<fieldset class="border rounded p-3 mb-4">
  <legend class="float-none w-auto px-2 fs-6 fw-semibold">${escapeHtml(label)}</legend>
  ${inner}
</fieldset>`;
  }

  const describedByParts: string[] = [];
  if (helpText) describedByParts.push(`${domId}-help`);
  describedByParts.push(`${domId}-error`);
  const ariaDescribedBy = `aria-describedby="${describedByParts.join(" ")}"`;
  const ariaRequired = required ? `aria-required="true"` : "";
  const autoCompleteAttr = autoComplete ? `autocomplete="${autoComplete}"` : "";

  switch (type) {
    case "textarea":
    case "richtext":
      return wrapControl(label, required, domId, helpText, `<textarea
          class="form-control"
          name="${nameAttr}"
          id="${domId}"
          rows="3"
          ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
          ${required ? "required" : ""}
          ${ariaRequired}
          ${ariaDescribedBy}
          ${autoCompleteAttr}
        ></textarea>`);
    case "select": {
      const options = field.constraints?.enum || [];
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<select
          class="form-select"
          name="${nameAttr}"
          id="${domId}"
          ${required ? "required" : ""}
          ${ariaRequired}
          ${ariaDescribedBy}
          ${autoCompleteAttr}
        >
          <option value="">${escapeHtml(placeholder) || "Select..."}</option>
          ${options.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("\n")}
        </select>`,
      );
    }
    case "checkbox":
      return `<div class="form-check mb-3">
  <input
    class="form-check-input"
    type="checkbox"
    name="${nameAttr}"
    id="${domId}"
    value="true"
    ${ariaRequired}
    ${ariaDescribedBy}
  />
  <label class="form-check-label" for="${domId}">
    ${escapeHtml(label)}${required ? ' <span class="text-danger" aria-hidden="true">*</span>' : ""}
  </label>
  ${helpText ? `<div id="${domId}-help" class="form-text">${escapeHtml(helpText)}</div>` : ""}
  <div id="${domId}-error" class="invalid-feedback d-block" role="alert"></div>
</div>`;
    case "file": {
      const xui = ui?.["x-ui"];
      const accept = xui?.accept ? `accept="${escapeHtml(String(xui.accept))}"` : "";
      const multiple = xui?.multiple ? "multiple" : "";
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<input
          class="form-control"
          type="file"
          name="${nameAttr}"
          id="${domId}"
          ${accept}
          ${multiple}
          ${required ? "required" : ""}
          ${ariaRequired}
          ${ariaDescribedBy}
        />`,
      );
    }
    case "signature": {
      const hidId = `${domId}_sig`;
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<canvas id="${domId}_canvas" width="400" height="160" class="border rounded bg-white mb-2" style="max-width:100%;touch-action:none" data-fs-sig-target="${escapeHtml(hidId)}"></canvas>
        <input type="hidden" name="${nameAttr}" id="${escapeHtml(hidId)}" />`,
      );
    }
    case "typeahead": {
      const url = ui?.["x-ui"]?.asyncSource?.url ?? "";
      const dlId = `${domId}_dl`;
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<input
          class="form-control"
          type="text"
          name="${nameAttr}"
          id="${domId}"
          list="${escapeHtml(dlId)}"
          data-typeahead-url="${escapeHtml(url)}"
          ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
          ${required ? "required" : ""}
          ${ariaRequired}
          ${ariaDescribedBy}
        />
        <datalist id="${escapeHtml(dlId)}"></datalist>`,
      );
    }
    case "calculated": {
      const formula = field["x-calc"] ?? "";
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<input
          class="form-control"
          type="text"
          name="${nameAttr}"
          id="${domId}"
          readonly
          data-fs-calculated="${escapeHtml(formula)}"
          value=""
          ${ariaRequired}
          ${ariaDescribedBy}
        />`,
      );
    }
    case "number": {
      const c = field.constraints;
      const minAttr = c?.min !== undefined ? `min="${escapeHtml(String(c.min))}"` : "";
      const maxAttr = c?.max !== undefined ? `max="${escapeHtml(String(c.max))}"` : "";
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<input
          class="form-control"
          type="number"
          name="${nameAttr}"
          id="${domId}"
          inputmode="decimal"
          step="any"
          ${minAttr}
          ${maxAttr}
          ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
          ${required ? "required" : ""}
          ${ariaRequired}
          ${ariaDescribedBy}
          ${autoCompleteAttr}
        />`,
      );
    }
    case "text":
    case "email":
    case "password":
    case "date":
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<input
          class="form-control"
          type="${escapeHtml(type)}"
          name="${nameAttr}"
          id="${domId}"
          ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
          ${required ? "required" : ""}
          ${ariaRequired}
          ${ariaDescribedBy}
          ${autoCompleteAttr}
        />`,
      );
    case "unknown":
    default:
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<input
          class="form-control"
          type="text"
          name="${nameAttr}"
          id="${domId}"
          ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
          ${required ? "required" : ""}
          ${ariaRequired}
          ${ariaDescribedBy}
        />`,
      );
  }
}

function wrapControl(
  label: string,
  required: boolean,
  domId: string,
  helpText: string | undefined,
  control: string,
): string {
  return `<div class="mb-3">
  <label class="form-label" for="${domId}">
    ${escapeHtml(label)}${required ? ' <span class="text-danger" aria-hidden="true">*</span>' : ""}
  </label>
  ${control}
  ${helpText ? `<div id="${domId}-help" class="form-text">${escapeHtml(helpText)}</div>` : ""}
  <div id="${domId}-error" class="invalid-feedback d-block" role="alert"></div>
</div>`;
}

function buildFormBody(formModel: FormModel, domIdByKey: Map<string, string>): string {
  const { fields, layout, submit } = formModel;
  const orderedFields = layout.order
    .map((fid) => fields.find((f) => f.id === fid))
    .filter((f): f is FieldModel => !!f);

  const hasFields = orderedFields.length > 0;
  const submitText = submit?.text || "Submit";
  const submitColor = submit?.color;

  const btnStyle = submitColor ? ` style="background-color:${escapeHtml(submitColor)};border-color:${escapeHtml(submitColor)}"` : "";

  if (!hasFields) {
    return `<p class="text-muted">Form is empty.</p>`;
  }

  if (layout.steps && layout.steps.length > 0) {
    const sections = layout.steps.map((step, stepIdx) => {
      const stepFields = orderedFields.filter(
        (f) => f.stepIndex === stepIdx || f.stepIndex === undefined,
      );
      const inner = stepFields.map((f) => generateBootstrapField(f, domIdByKey)).join("\n");
      return `<div class="card mb-4">
  <div class="card-header fw-semibold"><span class="badge bg-primary me-2">${stepIdx + 1}</span>${escapeHtml(step.title)}</div>
  <div class="card-body">
    ${inner}
  </div>
</div>`;
    });
    return `<div class="fs-form-panel rounded shadow-sm p-4 mb-4">
<form id="main-form" novalidate>
  ${sections.join("\n")}
  <button type="submit" class="btn btn-primary"${btnStyle}>${escapeHtml(submitText)}</button>
</form>
</div>`;
  }

  const fieldHtml = orderedFields.map((f) => generateBootstrapField(f, domIdByKey)).join("\n");
  return `<div class="fs-form-panel rounded shadow-sm p-4 mb-4">
<form id="main-form" novalidate>
  ${fieldHtml}
  <button type="submit" class="btn btn-primary"${btnStyle}>${escapeHtml(submitText)}</button>
</form>
</div>`;
}

function generateThemeCss(formModel: FormModel): string {
  const { colors, typography, radius } = formModel.theme;
  return `/* Theme derived from FormModel */
:root {
  --bs-primary: ${colors.primary};
  --bs-body-bg: ${colors.background};
  --bs-body-color: ${colors.text};
  --bs-border-color: ${colors.border};
  --fs-surface: ${colors.surface};
  --fs-form-radius: ${radius}px;
  --fs-font-family: ${typography.fontFamily};
  --fs-base-font-size: ${typography.baseFontSize}px;
}

body {
  font-family: var(--fs-font-family);
  font-size: var(--fs-base-font-size);
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
}

.fs-form-panel {
  background-color: var(--fs-surface);
  border: 1px solid color-mix(in srgb, var(--bs-border-color) 65%, transparent);
  border-radius: var(--fs-form-radius);
}

.form-control:focus {
  border-color: ${colors.primary};
  box-shadow: 0 0 0 0.2rem color-mix(in srgb, ${colors.primary} 25%, transparent);
}
`;
}

function buildFieldIdMapJs(formModel: FormModel): string {
  const orderedFields = formModel.layout.order
    .map((fid) => formModel.fields.find((f) => f.id === fid))
    .filter((f): f is FieldModel => !!f);
  const domIdByKey = new Map<string, string>();
  collectAllFields(orderedFields).forEach((f, i) => {
    domIdByKey.set(f.key, `field_${i + 1}`);
  });
  const allFields = collectAllFields(orderedFields);
  return allFields
    .map((f) => `    '${f.key.replace(/'/g, "\\'")}': '${domIdByKey.get(f.key) ?? f.id}'`)
    .join(",\n");
}

const STATIC_RUNTIME_HELPERS = `
  function evaluateCalcExpression(formula, values) {
    if (!formula) return '';
    var interpolated = formula.replace(/\\{([^}]+)\\}/g, function (_, key) {
      var k = key.trim();
      var val = values[k];
      return val !== undefined && val !== null ? String(val) : '0';
    });
    var isArithmetic = /^[\\d\\s+\\-*/().]+$/.test(interpolated);
    if (isArithmetic) {
      try {
        return Function('"use strict"; return (' + interpolated + ')')();
      } catch (e) {
        return interpolated;
      }
    }
    return interpolated;
  }

  function formValuesStringMap(form) {
    var fd = new FormData(form);
    var out = {};
    fd.forEach(function (v, k) {
      if (typeof v === 'string') out[k] = v;
    });
    return out;
  }

  function updateCalculatedFields(form) {
    var vals = formValuesStringMap(form);
    form.querySelectorAll('input[data-fs-calculated]').forEach(function (el) {
      var f = el.getAttribute('data-fs-calculated') || '';
      var r = evaluateCalcExpression(f, vals);
      el.value = typeof r === 'number' && isFinite(r) ? String(r) : String(r);
    });
  }

  function syncSignaturePads(form) {
    form.querySelectorAll('canvas[data-fs-sig-target]').forEach(function (canvas) {
      var hidId = canvas.getAttribute('data-fs-sig-target');
      if (!hidId) return;
      var hid = document.getElementById(hidId);
      if (hid) hid.value = canvas.toDataURL('image/png');
    });
  }

  function wireSignatureDrawing(form) {
    form.querySelectorAll('canvas[data-fs-sig-target]').forEach(function (canvas) {
      canvas.addEventListener('pointerdown', function (e) {
        var g = canvas.getContext('2d');
        if (!g) return;
        var rect = canvas.getBoundingClientRect();
        var drawing = true;
        g.beginPath();
        g.strokeStyle = '#111';
        g.lineWidth = 2;
        g.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        function move(ev) {
          if (!drawing) return;
          g.lineTo(ev.clientX - rect.left, ev.clientY - rect.top);
          g.stroke();
        }
        function up() {
          drawing = false;
          canvas.removeEventListener('pointermove', move);
        }
        canvas.setPointerCapture(e.pointerId);
        canvas.addEventListener('pointermove', move);
        canvas.addEventListener('pointerup', up, { once: true });
      });
    });
  }

  function setRepeaterRowIndex(rowEl, root, idx) {
    var prefix = root + '.';
    rowEl.querySelectorAll('[name]').forEach(function (el) {
      var name = el.getAttribute('name');
      if (!name || name.indexOf(prefix) !== 0) return;
      var tail = name.slice(prefix.length);
      var dot = tail.indexOf('.');
      if (dot === -1) return;
      var first = tail.slice(0, dot);
      if (!/^\\d+$/.test(first)) return;
      el.setAttribute('name', prefix + idx + tail.slice(dot));
    });
    rowEl.querySelectorAll('[id]').forEach(function (el) {
      var id = el.getAttribute('id');
      if (id) el.setAttribute('id', id.replace(/_r\\d+$/, '_r' + idx));
    });
    rowEl.querySelectorAll('[for]').forEach(function (el) {
      var f = el.getAttribute('for');
      if (f) el.setAttribute('for', f.replace(/_r\\d+$/, '_r' + idx));
    });
  }

  function initRepeaters(form) {
    form.querySelectorAll('[data-fs-repeater]').forEach(function (fs) {
      var root = fs.getAttribute('data-fs-repeater');
      if (!root) return;
      var rowsC = fs.querySelector('.repeater-rows');
      var template = rowsC ? rowsC.querySelector('.repeater-row') : null;
      var addBtn = fs.querySelector('.fs-repeater-add');
      var remBtn = fs.querySelector('.fs-repeater-remove');
      if (!rowsC || !template || !addBtn) return;

      function refreshRemoveButtons() {
        var rows = rowsC.querySelectorAll('.repeater-row');
        rows.forEach(function (row, i) {
          row.setAttribute('data-row-index', String(i));
          setRepeaterRowIndex(row, root, i);
        });
        if (remBtn) remBtn.style.display = rows.length > 1 ? 'inline-block' : 'none';
      }

      addBtn.addEventListener('click', function () {
        var clone = template.cloneNode(true);
        var n = rowsC.querySelectorAll('.repeater-row').length;
        setRepeaterRowIndex(clone, root, n);
        rowsC.appendChild(clone);
        wireSignatureDrawing(clone);
        refreshRemoveButtons();
      });

      if (remBtn) {
        remBtn.addEventListener('click', function () {
          var rows = rowsC.querySelectorAll('.repeater-row');
          if (rows.length <= 1) return;
          rows[rows.length - 1].remove();
          refreshRemoveButtons();
        });
      }

      refreshRemoveButtons();
    });
  }

  function initTypeaheads(form) {
    var timers = {};
    form.querySelectorAll('input[data-typeahead-url]').forEach(function (input) {
      var urlTpl = input.getAttribute('data-typeahead-url') || '';
      var listId = input.getAttribute('list');
      if (!listId || !urlTpl) return;
      var dl = document.getElementById(listId);
      if (!dl) return;
      input.addEventListener('input', function () {
        var key = input.id || listId;
        clearTimeout(timers[key]);
        var q = input.value.trim();
        timers[key] = setTimeout(function () {
          var url = urlTpl.split('{query}').join(encodeURIComponent(q));
          fetch(url)
            .then(function (r) {
              return r.json();
            })
            .then(function (data) {
              var arr = Array.isArray(data) ? data : [];
              dl.innerHTML = '';
              arr.slice(0, 50).forEach(function (item) {
                var opt = document.createElement('option');
                opt.value = typeof item === 'string' ? item : (item.label || item.value || String(item));
                dl.appendChild(opt);
              });
            })
            .catch(function () {});
        }, 300);
      });
    });
  }

  function clearInlineFieldErrors(form) {
    form.querySelectorAll(".is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
    form.querySelectorAll(".invalid-feedback").forEach(function (node) {
      node.textContent = "";
    });
  }

  function applyInlineFieldErrors(form, errs) {
    clearInlineFieldErrors(form);
    Object.keys(errs).forEach(function (name) {
      var found = null;
      for (var i = 0; i < form.elements.length; i++) {
        if (form.elements[i].name === name) {
          found = form.elements[i];
          break;
        }
      }
      if (!found) return;
      var wrap = found.closest && found.closest(".mb-3, .form-check");
      var errNode = wrap ? wrap.querySelector(".invalid-feedback") : null;
      if (found.classList) found.classList.add("is-invalid");
      if (errNode) errNode.textContent = errs[name];
    });
  }
`;

function generateAppJs(
  formModel: FormModel,
  wiring?: StaticGeneratorWiring & { fieldTypesJson: string },
): string {
  const fieldMapLines = buildFieldIdMapJs(formModel);

  const submitBody = wiring
    ? buildVanillaWiredSubmitReplacement({
        serializedFieldTypes: wiring.fieldTypesJson,
        apiBaseUrl: wiring.apiBaseUrl,
        apiPath: wiring.apiPath,
      })
    : `/* FORMSYNC_API_SUBMIT_START */
    console.log("Form submitted:", Object.fromEntries(new FormData(form)));
    /* FORMSYNC_API_SUBMIT_END */`;

  const submitIndented = submitBody
    .split("\n")
    .map((line) => "    " + line)
    .join("\n");

  const fieldRulesJson = buildClientFieldRulesJson(formModel);

  return `/**
 * Generated by FormSync static-frontend-generator — do not edit by hand.
 */
(function () {
  var form = document.getElementById("main-form");
  if (!form) return;

${STATIC_RUNTIME_HELPERS}
${buildVanillaClientValidationSource()}
  var FIELD_RULES = ${fieldRulesJson};

  wireSignatureDrawing(form);
  initRepeaters(form);
  initTypeaheads(form);
  form.addEventListener("input", function () {
    updateCalculatedFields(form);
  });
  updateCalculatedFields(form);

  var FIELD_ID_MAP = {
${fieldMapLines}
  };

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    syncSignaturePads(form);

    var errs = validateForm(form, FIELD_RULES);
    var errorKeys = Object.keys(errs);
    if (errorKeys.length > 0) {
      applyInlineFieldErrors(form, errs);
      var statusEl = document.getElementById("form-status");
      var firstKey = errorKeys[0];
      var firstMsg = firstKey ? errs[firstKey] : "";
      if (statusEl) {
        statusEl.textContent =
          errorKeys.length === 1
            ? firstMsg || "Please fix the highlighted field."
            : errorKeys.length +
                " errors found. " +
                (firstMsg || "Please review the highlighted fields.");
      }
      var focusEl = null;
      var els = form.elements;
      for (var fi = 0; fi < els.length; fi++) {
        var fe = els[fi];
        if (fe.name === firstKey) {
          focusEl = fe;
          break;
        }
      }
      var tk = firstKey ? templatePathFromIndexedPath(firstKey) : "";
      var fallbackId = tk ? FIELD_ID_MAP[tk] : "";
      var el = focusEl || (fallbackId ? document.getElementById(fallbackId) : null);
      if (el && el.focus) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    clearInlineFieldErrors(form);
    var statusClear = document.getElementById("form-status");
    if (statusClear) statusClear.textContent = "";

${submitIndented}
  });
})();
`;
}

export function collectFieldTypeMap(formModel: FormModel): Record<string, string> {
  const map: Record<string, string> = {};
  const walk = (fields: FieldModel[]) => {
    for (const field of fields) {
      map[field.key] = field.type;
      if (field.children?.length) walk(field.children);
    }
  };
  walk(formModel.fields);
  return map;
}

export function generateStaticBootstrapFiles(
  formModel: FormModel,
  wiring?: StaticGeneratorWiring,
): Record<string, string> {
  const wiringWithTypes =
    wiring &&
    ({
      ...wiring,
      fieldTypesJson: JSON.stringify(collectFieldTypeMap(formModel), null, 2),
    } as StaticGeneratorWiring & { fieldTypesJson: string });

  const orderedFields = formModel.layout.order
    .map((fid) => formModel.fields.find((f) => f.id === fid))
    .filter((f): f is FieldModel => !!f);

  const domIdByKey = new Map<string, string>();
  collectAllFields(orderedFields).forEach((f, i) => {
    domIdByKey.set(f.key, `field_${i + 1}`);
  });

  const title = formModel.meta?.title || formModel.name;
  const description = formModel.meta?.description;

  const bodyInner = buildFormBody(formModel, domIdByKey);

  const appJs = generateAppJs(formModel, wiringWithTypes || undefined);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous" />
  <link rel="stylesheet" href="css/theme.css" />
</head>
<body>
  <main class="container py-4">
    <div id="form-status" class="text-danger mb-3" role="status" aria-live="polite"></div>
    <h1 class="h3 mb-2">${escapeHtml(title)}</h1>
    ${description ? `<p class="text-muted mb-4">${escapeHtml(description)}</p>` : ""}
    ${bodyInner}
  </main>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  <script src="js/app.js"></script>
</body>
</html>
`;

  const readme = `# ${escapeHtml(title)} — static form

Generated HTML + Bootstrap 5 + vanilla JavaScript (no build step).

## Advanced fields

- **File uploads** are sent as **Base64 / data URL strings inside JSON** when wired POST is enabled. Keep files small; very large payloads may fail (browser/server limits).
- **Rich text** is a plain \`<textarea>\` (HTML string). Add a WYSIWYG library if you need an editor.
- **Typeahead** calls \`data-typeahead-url\` with \`{query}\` replaced; your API must allow **CORS** from this origin.
- **Repeater** uses indexed field names (\`root.0.child\`, \`root.1.child\`, …). Use **Add row** / **Remove row** (last row removed).

## Run locally

Use any static file server from this folder, for example:

\`\`\`bash
npx serve .
\`\`\`

Then open the printed URL in your browser.

## API wiring

${
    wiring
      ? `This bundle is configured to POST JSON to **${escapeHtml(wiring.apiBaseUrl)}${escapeHtml(wiring.apiPath)}**. Edit \`js/app.js\` if your backend runs elsewhere (ensure CORS allows your origin).`
      : `Wire your backend by replacing the placeholder in \`js/app.js\` between the FORMSYNC markers, or regenerate from FormSync with fullstack export.`
  }
`;

  return {
    "index.html": html,
    "css/theme.css": generateThemeCss(formModel),
    "js/app.js": appJs,
    "README.md": readme,
  };
}
