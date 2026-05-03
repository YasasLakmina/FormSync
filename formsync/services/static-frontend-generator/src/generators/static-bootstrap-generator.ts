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

/** Wizard step slice — nested group/repeater children use stepIndex ?? 0. */
function pruneFieldsForWizardStep(fields: FieldModel[], stepIdx: number): FieldModel[] {
  const out: FieldModel[] = [];
  for (const f of fields) {
    if (f.type === "group" && f.children?.length) {
      const children = pruneFieldsForWizardStep(f.children, stepIdx);
      if (children.length > 0) {
        out.push({ ...f, children });
      }
      continue;
    }
    if (f.type === "repeater" && f.children?.length) {
      const children = pruneFieldsForWizardStep(f.children, stepIdx);
      if (children.length > 0) {
        out.push({ ...f, children });
      }
      continue;
    }
    if ((f.stepIndex ?? 0) === stepIdx) {
      out.push(f);
    }
  }
  return out;
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

  function resolveRuleFromKeys(rules, tk) {
    var r = rules[tk];
    if (r) return r;
    var parts = tk.split(".").filter(function (p) {
      return p;
    });
    return parts.length ? rules[parts[parts.length - 1]] : undefined;
  }

  function collectNamedFieldErrors(root, rules) {
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

    var named = root.querySelectorAll("[name]");
    for (var i = 0; i < named.length; i++) {
      var el = named[i];
      var nm = el.name;
      if (!nm) continue;
      var tk = templatePathFromIndexedPath(nm);
      var rule = resolveRuleFromKeys(rules, tk);
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

  function validateForm(form, rules) {
    return collectNamedFieldErrors(form, rules);
  }

  function validateFormScoped(form, rules, scope) {
    if (!scope) return {};
    return collectNamedFieldErrors(scope, rules);
  }
`;
}

function relativeUnderRepeater(repeaterRoot: string, fieldKey: string): string {
  if (fieldKey.startsWith(repeaterRoot + ".")) return fieldKey.slice(repeaterRoot.length + 1);
  return fieldKey;
}

/** Inline styles for repeater fieldset / table from field.ui.styleOverrides. */
function repeaterChromeStyleAttr(field: FieldModel): {
  fieldset: string;
  legend: string;
  theadTr: string;
  addBtn: string;
} {
  const o = field.ui?.styleOverrides as Record<string, string> | undefined;
  const border = o?.borderColor ?? "#dee2e6";
  const bg = o?.backgroundColor;
  const lc = o?.labelColor;
  const accent = o?.focusColor;
  const fss = [`border:1px solid ${border}`, "border-radius:0.375rem", "padding:1rem"];
  if (bg) fss.push(`background-color:${bg}`);
  const fieldset = ` style="${fss.join(";")}"`;
  const legend = lc ? ` style="color:${lc}"` : "";
  const theadBg =
    lc && bg
      ? `color-mix(in srgb, ${lc} 12%, ${bg})`
      : bg
        ? `color-mix(in srgb, #64748b 8%, ${bg})`
        : "#f8f9fa";
  const theadTr = ` style="background:${theadBg}${lc ? `;color:${lc}` : ""}"`;
  const addBtn = accent ? ` style="color:${accent};border-color:${accent}"` : "";
  return { fieldset, legend, theadTr, addBtn };
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

function generateBootstrapField(
  field: FieldModel,
  domIdByKey: Map<string, string>,
  ctx?: RepeaterCtx,
  tableCell = false,
): string {
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
    if (children.length === 0) {
      const rc = repeaterChromeStyleAttr(field);
      return `<fieldset class="mb-4"${rc.fieldset}>
  <legend class="float-none w-auto px-2 fs-6 fw-semibold"${rc.legend}>${escapeHtml(label)}</legend>
  <p class="text-muted small mb-2">Add child fields to this repeater in the FormSync builder, then re-export. Repeating tables expect one column per child field.</p>
  <button type="button" class="btn btn-sm btn-outline-secondary" disabled title="Add child fields in the builder first">Add row</button>
</fieldset>`;
    }
    const displayMode =
      field.ui && typeof field.ui === "object" && (field.ui as Record<string, unknown>)["displayMode"] === "table"
        ? "table"
        : "cards";

    if (displayMode === "table" && children.length > 0) {
      const rc = repeaterChromeStyleAttr(field);
      const th = children
        .map(
          (c) =>
            `<th scope="col">${escapeHtml(c.label)}${c.required ? ' <span class="text-danger" aria-hidden="true">*</span>' : ""}</th>`,
        )
        .join("");
      const tdTemplate = children
        .map((c) => `<td class="align-middle">${generateBootstrapField(c, domIdByKey, { repeaterRoot: field.key, rowIdx: 0 }, true)}</td>`)
        .join("");
      const rootEsc = escapeHtml(field.key);
      return `<fieldset class="mb-4"${rc.fieldset} data-fs-repeater="${rootEsc}">
  <legend class="float-none w-auto px-2 fs-6 fw-semibold"${rc.legend}>${escapeHtml(label)}</legend>
  <div class="table-responsive">
    <table class="table table-bordered align-middle mb-0 fs-repeater-data-table">
      <thead><tr${rc.theadTr}>${th}<th scope="col" class="text-end" style="width:6rem">Actions</th></tr></thead>
      <tbody class="repeater-rows">
        <tr class="repeater-row table-light" data-row-index="0">
          ${tdTemplate}
          <td class="text-end align-middle">
            <button type="button" class="btn btn-sm btn-outline-secondary fs-repeater-remove" style="display:none">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <button type="button" class="btn btn-sm btn-outline-primary fs-repeater-add"${rc.addBtn}>Add row</button>
</fieldset>`;
    }

    const rc = repeaterChromeStyleAttr(field);
    const inner = children
      .map((c) => generateBootstrapField(c, domIdByKey, { repeaterRoot: field.key, rowIdx: 0 }))
      .join("\n");
    const rootEsc = escapeHtml(field.key);
    return `<fieldset class="mb-4"${rc.fieldset} data-fs-repeater="${rootEsc}">
  <legend class="float-none w-auto px-2 fs-6 fw-semibold"${rc.legend}>${escapeHtml(label)}</legend>
  <div class="repeater-rows">
    <div class="repeater-row border rounded p-3 mb-2 bg-light" data-row-index="0">
      ${inner}
    </div>
  </div>
  <button type="button" class="btn btn-sm btn-outline-secondary me-2 fs-repeater-remove" style="display:none">Remove row</button>
  <button type="button" class="btn btn-sm btn-outline-primary fs-repeater-add"${rc.addBtn}>Add row</button>
</fieldset>`;
  }

  if (type === "group") {
    const children = field.children || [];
    const inner = children.map((c) => generateBootstrapField(c, domIdByKey, ctx, tableCell)).join("\n");
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
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<textarea
          class="form-control"
          name="${nameAttr}"
          id="${domId}"
          rows="3"
          ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
          ${required ? "required" : ""}
          ${ariaRequired}
          ${ariaDescribedBy}
          ${autoCompleteAttr}
        ></textarea>`,
        tableCell,
      );
    case "richtext": {
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<div class="richtext-wrap w-100">
  <div class="richtext-toolbar btn-group flex-wrap mb-1" role="toolbar" aria-label="Formatting">
    <button type="button" class="btn btn-sm btn-outline-secondary fs-richtext-cmd" data-cmd="bold" title="Bold"><strong>B</strong></button>
    <button type="button" class="btn btn-sm btn-outline-secondary fs-richtext-cmd" data-cmd="italic" title="Italic"><em>I</em></button>
    <button type="button" class="btn btn-sm btn-outline-secondary fs-richtext-cmd" data-cmd="underline" title="Underline"><span style="text-decoration:underline">U</span></button>
    <button type="button" class="btn btn-sm btn-outline-secondary fs-richtext-cmd" data-cmd="insertUnorderedList" title="List">•</button>
    <button type="button" class="btn btn-sm btn-outline-secondary fs-richtext-cmd" data-cmd="insertOrderedList" title="Numbered">1.</button>
  </div>
  <div id="${domId}" class="form-control richtext-editable" contenteditable="true" ${placeholder ? `data-placeholder="${escapeHtml(placeholder)}"` : ""} ${ariaRequired} ${ariaDescribedBy}></div>
  <input type="hidden" data-fs-richtext name="${nameAttr}" value="" />
</div>`,
        tableCell,
      );
    }
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
        tableCell,
      );
    }
    case "checkbox": {
      const chkMb = tableCell ? "mb-1" : "mb-3";
      const chkLbl = tableCell ? "form-check-label visually-hidden" : "form-check-label";
      return `<div class="form-check ${chkMb}">
  <input
    class="form-check-input"
    type="checkbox"
    name="${nameAttr}"
    id="${domId}"
    value="true"
    ${ariaRequired}
    ${ariaDescribedBy}
  />
  <label class="${chkLbl}" for="${domId}">
    ${escapeHtml(label)}${required ? ' <span class="text-danger" aria-hidden="true">*</span>' : ""}
  </label>
  ${helpText && !tableCell ? `<div id="${domId}-help" class="form-text">${escapeHtml(helpText)}</div>` : ""}
  <div id="${domId}-error" class="invalid-feedback d-block" role="alert"></div>
</div>`;
    }
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
        tableCell,
      );
    }
    case "signature": {
      const hidId = `${domId}_sig`;
      return wrapControl(
        label,
        required,
        domId,
        helpText,
        `<canvas id="${domId}_canvas" width="400" height="160" class="form-control signature-pad-canvas mb-2" style="max-width:100%;touch-action:none" data-fs-sig-target="${escapeHtml(hidId)}"></canvas>
        <input type="hidden" name="${nameAttr}" id="${escapeHtml(hidId)}" />`,
        tableCell,
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
        tableCell,
      );
    }
    case "calculated": {
      const formula = field["x-calc"] ?? "";
      const calcRep = ctx ? ` data-fs-calc-repeater="${escapeHtml(ctx.repeaterRoot)}"` : "";
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
          data-fs-calculated="${escapeHtml(formula)}"${calcRep}
          value=""
          ${ariaRequired}
          ${ariaDescribedBy}
        />`,
        tableCell,
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
        tableCell,
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
        tableCell,
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
        tableCell,
      );
  }
}

function wrapControl(
  label: string,
  required: boolean,
  domId: string,
  helpText: string | undefined,
  control: string,
  tableCell = false,
): string {
  const labelClass = tableCell ? "form-label visually-hidden" : "form-label";
  const wrapClass = tableCell ? "mb-1" : "mb-3";
  return `<div class="${wrapClass}">
  <label class="${labelClass}" for="${domId}">
    ${escapeHtml(label)}${required ? ' <span class="text-danger" aria-hidden="true">*</span>' : ""}
  </label>
  ${control}
  ${helpText && !tableCell ? `<div id="${domId}-help" class="form-text">${escapeHtml(helpText)}</div>` : ""}
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
    const stepCount = layout.steps.length;
    const multiWizard = stepCount > 1;

    if (stepCount === 1) {
      const sole = layout.steps[0]!;
      const stepFields = pruneFieldsForWizardStep(orderedFields, 0);
      const inner = stepFields.map((f) => generateBootstrapField(f, domIdByKey)).join("\n");
      return `<div class="fs-form-panel rounded shadow-sm p-4 mb-4">
<form id="main-form" novalidate>
  <div class="card mb-4" role="region" aria-label="${escapeHtml(sole.title)}">
    <div class="card-header fw-semibold"><span class="badge bg-primary me-2">1</span>${escapeHtml(sole.title)}</div>
    <div class="card-body">
      ${inner}
    </div>
  </div>
  <button type="submit" class="btn btn-primary"${btnStyle}>${escapeHtml(submitText)}</button>
</form>
</div>`;
    }

    const sections = layout.steps.map((step, stepIdx) => {
      const stepFields = pruneFieldsForWizardStep(orderedFields, stepIdx);
      const inner = stepFields.map((f) => generateBootstrapField(f, domIdByKey)).join("\n");
      const hidePanel = stepIdx > 0 ? " d-none" : "";
      return `<div class="card mb-4 fs-wizard-panel${hidePanel}" data-wizard-step="${stepIdx}" role="region" aria-label="${escapeHtml(step.title)}">
  <div class="card-header fw-semibold"><span class="badge bg-primary me-2">${stepIdx + 1}</span>${escapeHtml(step.title)}</div>
  <div class="card-body">
    ${inner}
  </div>
</div>`;
    });

    const footer = `<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
  <button type="button" class="btn btn-outline-secondary" id="wizard-prev" style="visibility:hidden">Previous</button>
  <div class="d-flex gap-2 ms-auto">
    <button type="button" class="btn btn-primary" id="wizard-next">Next</button>
    <button type="submit" class="btn btn-primary" id="wizard-submit"${btnStyle} style="display:none">${escapeHtml(submitText)}</button>
  </div>
</div>`;

    return `<div class="fs-form-panel rounded shadow-sm p-4 mb-4">
<form id="main-form" novalidate>
  ${sections.join("\n")}
  ${footer}
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
  const inputBg = colors.inputBackground ?? "#ffffff";
  const muted = colors.muted ?? "#6c757d";
  return `/* Theme derived from FormModel */
:root {
  --bs-primary: ${colors.primary};
  --bs-body-bg: ${colors.background};
  --bs-body-color: ${colors.text};
  --bs-border-color: ${colors.border};
  --fs-surface: ${colors.surface};
  --fs-input-bg: ${inputBg};
  --fs-muted: ${muted};
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

/* Readable column width (Bootstrap .container is still wide at lg/xl) */
.fs-page-inner {
  max-width: min(100%, 40rem);
}

.fs-form-panel {
  background-color: var(--fs-surface);
  border: 1px solid color-mix(in srgb, var(--bs-border-color) 65%, transparent);
  border-radius: var(--fs-form-radius);
}

/* BS5 defaults .form-control background to --bs-body-bg; use theme inputBackground so fields contrast with page + panel */
.form-control,
.form-select {
  background-color: var(--fs-input-bg);
  color: var(--bs-body-color);
  border-color: var(--bs-border-color);
}

.form-control::placeholder {
  color: color-mix(in srgb, var(--fs-muted) 85%, transparent);
}

.form-control:focus,
.form-select:focus {
  background-color: var(--fs-input-bg);
  color: var(--bs-body-color);
  border-color: ${colors.primary};
  box-shadow: 0 0 0 0.2rem color-mix(in srgb, ${colors.primary} 25%, transparent);
}

.form-control:disabled,
.form-select:disabled {
  background-color: color-mix(in srgb, var(--fs-input-bg) 88%, var(--fs-muted));
}

.richtext-editable.form-control {
  min-height: 6rem;
  overflow-y: auto;
}
.richtext-editable[contenteditable="true"]:empty:before {
  content: attr(data-placeholder);
  color: color-mix(in srgb, var(--fs-muted) 85%, transparent);
  pointer-events: none;
}
canvas.form-control.signature-pad-canvas {
  display: block;
  min-height: 10rem;
  cursor: crosshair;
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

  function scopedRepeaterValues(form, repeaterRoot, rowIdx) {
    var flat = formValuesStringMap(form);
    var prefix = repeaterRoot + '.' + rowIdx + '.';
    var out = {};
    Object.keys(flat).forEach(function (k) {
      out[k] = flat[k];
    });
    Object.keys(flat).forEach(function (k) {
      if (k.indexOf(prefix) === 0) {
        out[k.slice(prefix.length)] = flat[k];
      }
    });
    return out;
  }

  function updateCalculatedFields(form) {
    form.querySelectorAll('input[data-fs-calculated]').forEach(function (el) {
      var formula = el.getAttribute('data-fs-calculated') || '';
      var rep = el.getAttribute('data-fs-calc-repeater');
      var vals;
      if (rep) {
        var row = el.closest('tr.repeater-row, .repeater-row');
        var ri = row ? parseInt(row.getAttribute('data-row-index') || '0', 10) : 0;
        vals = scopedRepeaterValues(form, rep, ri);
      } else {
        vals = formValuesStringMap(form);
      }
      var r = evaluateCalcExpression(formula, vals);
      el.value = typeof r === 'number' && isFinite(r) ? String(r) : String(r);
    });
  }

  function syncRichTextEditors(form) {
    form.querySelectorAll('input[type="hidden"][data-fs-richtext]').forEach(function (hid) {
      var wrap = hid.closest('.richtext-wrap');
      var ed = wrap && wrap.querySelector('.richtext-editable');
      if (ed) hid.value = ed.innerHTML;
    });
  }

  function wireRichTextToolbar(form) {
    form.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('.fs-richtext-cmd');
      if (!btn || !form.contains(btn)) return;
      e.preventDefault();
      var cmd = btn.getAttribute('data-cmd');
      var wrap = btn.closest('.richtext-wrap');
      var ed = wrap && wrap.querySelector('.richtext-editable');
      if (ed && cmd) {
        ed.focus();
        document.execCommand(cmd, false, undefined);
      }
    });
    form.addEventListener('input', function (e) {
      var t = e.target;
      if (!t || !t.classList || !t.classList.contains('richtext-editable')) return;
      var wrap = t.closest('.richtext-wrap');
      var hid = wrap && wrap.querySelector('input[data-fs-richtext]');
      if (hid) hid.value = t.innerHTML;
    }, true);
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
      if (!rowsC || !template || !addBtn) return;

      function refreshRemoveButtons() {
        var rows = rowsC.querySelectorAll('.repeater-row');
        rows.forEach(function (row, i) {
          row.setAttribute('data-row-index', String(i));
          setRepeaterRowIndex(row, root, i);
        });
        var show = rows.length > 1;
        fs.querySelectorAll('.fs-repeater-remove').forEach(function (btn) {
          btn.style.display = show ? 'inline-block' : 'none';
        });
      }

      addBtn.addEventListener('click', function () {
        var clone = template.cloneNode(true);
        var n = rowsC.querySelectorAll('.repeater-row').length;
        setRepeaterRowIndex(clone, root, n);
        rowsC.appendChild(clone);
        wireSignatureDrawing(clone);
        updateCalculatedFields(form);
        refreshRemoveButtons();
      });

      fs.addEventListener('click', function (e) {
        var t = e.target;
        if (!t || typeof t.closest !== 'function') return;
        var btn = t.closest('.fs-repeater-remove');
        if (!btn || !fs.contains(btn)) return;
        e.preventDefault();
        var rows = rowsC.querySelectorAll('.repeater-row');
        if (rows.length <= 1) return;
        var row = btn.closest('.repeater-row');
        if (!row || !rowsC.contains(row)) {
          row = rows[rows.length - 1];
        }
        row.remove();
        updateCalculatedFields(form);
        refreshRemoveButtons();
      });

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

/** Vanilla wizard wiring when layout has more than one step (must run before submit listener). */
function buildMultiWizardInstallJs(formModel: FormModel): string {
  const steps = formModel.layout.steps;
  if (!steps || steps.length <= 1) return "";

  const n = steps.length;
  return `
  var WIZARD_STEP_COUNT = ${n};
  var wizardStep = 0;
  var wizardPanels = Array.prototype.slice.call(form.querySelectorAll(".fs-wizard-panel"));
  var btnPrev = document.getElementById("wizard-prev");
  var btnNext = document.getElementById("wizard-next");
  var btnSubmit = document.getElementById("wizard-submit");

  function focusActiveWizardPanel() {
    var panel = form.querySelector('[data-wizard-step="' + wizardStep + '"]');
    if (!panel) return;
    var focusable = panel.querySelector(
      'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.focus) {
      focusable.focus({ preventScroll: true });
    }
  }

  function applyWizardView() {
    for (var pi = 0; pi < wizardPanels.length; pi++) {
      if (pi === wizardStep) {
        wizardPanels[pi].classList.remove("d-none");
      } else {
        wizardPanels[pi].classList.add("d-none");
      }
    }
    if (btnPrev) {
      btnPrev.style.visibility = wizardStep === 0 ? "hidden" : "visible";
    }
    if (btnNext && btnSubmit) {
      var last = wizardStep >= WIZARD_STEP_COUNT - 1;
      btnNext.hidden = last;
      btnSubmit.hidden = !last;
    }
    focusActiveWizardPanel();
  }

  function tryWizardNext() {
    syncRichTextEditors(form);
    syncSignaturePads(form);
    var scope = form.querySelector('[data-wizard-step="' + wizardStep + '"]');
    var stepErrs = validateFormScoped(form, FIELD_RULES, scope);
    var errorKeys = Object.keys(stepErrs);
    if (errorKeys.length > 0) {
      applyInlineFieldErrors(form, stepErrs);
      var statusEl = document.getElementById("form-status");
      var firstKey = errorKeys[0];
      var firstMsg = firstKey ? stepErrs[firstKey] : "";
      if (statusEl) {
        statusEl.textContent =
          errorKeys.length === 1
            ? firstMsg || "Please fix the highlighted field."
            : errorKeys.length +
                " errors found. " +
                (firstMsg || "Please review the highlighted fields.");
        statusEl.className = "alert alert-danger mb-3";
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
    var st = document.getElementById("form-status");
    if (st) {
      st.textContent = "";
      st.className = "mb-3";
    }
    wizardStep += 1;
    applyWizardView();
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", function () {
      if (wizardStep > 0) {
        wizardStep -= 1;
        applyWizardView();
        var st2 = document.getElementById("form-status");
        if (st2) {
          st2.textContent = "";
          st2.className = "mb-3";
        }
        clearInlineFieldErrors(form);
      }
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", function () {
      tryWizardNext();
    });
  }
  applyWizardView();
`;
}

function generateAppJs(
  formModel: FormModel,
  wiring?: StaticGeneratorWiring & { fieldTypesJson: string },
): string {
  const fieldMapLines = buildFieldIdMapJs(formModel);
  const wizardInstallJs = buildMultiWizardInstallJs(formModel);
  const wizardSubmitGateJs =
    formModel.layout.steps && formModel.layout.steps.length > 1
      ? `
    if (wizardStep < WIZARD_STEP_COUNT - 1) {
      tryWizardNext();
      return;
    }
`
      : "";

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
  wireRichTextToolbar(form);
  initRepeaters(form);
  initTypeaheads(form);
  form.addEventListener("input", function () {
    updateCalculatedFields(form);
  });
  updateCalculatedFields(form);

  var FIELD_ID_MAP = {
${fieldMapLines}
  };
${wizardInstallJs}
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    syncRichTextEditors(form);
    syncSignaturePads(form);${wizardSubmitGateJs}

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
        statusEl.className = "alert alert-danger mb-3";
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
    if (statusClear) {
      statusClear.textContent = "";
      statusClear.className = "mb-3";
    }

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
    <div class="fs-page-inner mx-auto">
      <div id="form-status" class="mb-3" role="status" aria-live="polite"></div>
      <h1 class="h3 mb-2">${escapeHtml(title)}</h1>
      ${description ? `<p class="text-muted mb-4">${escapeHtml(description)}</p>` : ""}
      ${bodyInner}
    </div>
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
