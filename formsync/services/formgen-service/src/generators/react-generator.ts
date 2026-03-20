/**
 * React Component Generator — FormModel → App.tsx (palette parity for ZIP exports).
 */

import type { FieldModel, FormModel, FormStep } from "../types";

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

export interface RepeaterCodegenCtx {
  repeaterRoot: string;
}

function escapeJsSingleQuotedString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function sanitizeIdent(s: string): string {
  return s.replace(/[^a-zA-Z0-9]/g, "_");
}

function relativeUnderRepeater(repeaterRoot: string, fieldKey: string): string {
  if (fieldKey.startsWith(repeaterRoot + ".")) return fieldKey.slice(repeaterRoot.length + 1);
  return fieldKey;
}

function staticNameAttr(field: FieldModel): string {
  return `name="${escapeHtml(field.key)}"`;
}

/** JSX: name={\`root.${rowIdx}.rel\`} */
function jsxRepeaterNameAttr(repeaterRoot: string, field: FieldModel): string {
  const rel = relativeUnderRepeater(repeaterRoot, field.key);
  const rootLit = repeaterRoot.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  const relLit = rel.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `name={\\\`${rootLit}.\\\${rowIdx}.${relLit}\\\`}`;
}

function jsxIdAttr(domBase: string, ctx?: RepeaterCodegenCtx): string {
  if (!ctx) return `id="${escapeHtml(domBase)}"`;
  const base = domBase.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `id={\\\`${base}_\\\${rowIdx}\\\`}`;
}

function jsxHtmlForAttr(domBase: string, ctx?: RepeaterCodegenCtx): string {
  if (!ctx) return `htmlFor="${escapeHtml(domBase)}"`;
  const base = domBase.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `htmlFor={\\\`${base}_\\\${rowIdx}\\\`}`;
}

function jsxErrorsLookup(repeaterRoot: string | undefined, field: FieldModel): string {
  if (!repeaterRoot) return `errors['${escapeJsSingleQuotedString(field.key)}']`;
  const rel = relativeUnderRepeater(repeaterRoot, field.key);
  const rootLit = repeaterRoot.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  const relLit = rel.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `errors[\\\`${rootLit}.\\\${rowIdx}.${relLit}\\\`]`;
}

function jsxAriaDescribedBy(domBase: string, ctx?: RepeaterCodegenCtx): string {
  if (!ctx) return `aria-describedby="${domBase}-help ${domBase}-error"`;
  const b = domBase.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `aria-describedby={\\\`${b}_\\\${rowIdx}-help ${b}_\\\${rowIdx}-error\\\`}`;
}

export function generateAppTsx(formModel: FormModel): string {
  const { fields, layout, meta, submit } = formModel;

  const orderedFields = layout.order
    .map((id: string) => fields.find((f: FieldModel) => f.id === id))
    .filter((f): f is FieldModel => !!f);

  const domIdByKey = new Map<string, string>();
  collectAllFields(orderedFields).forEach((f: FieldModel, i: number) => {
    domIdByKey.set(f.key, `field_${i + 1}`);
  });

  const hasFields = orderedFields.length > 0;
  const title = meta?.title || formModel.name;
  const description = meta?.description;
  const submitText = submit?.text || "Submit";
  const submitColor = submit?.color;

  const repeaterStates = orderedFields.filter((f: FieldModel) => f.type === "repeater").map((f: FieldModel) => ({
    field: f,
    stateVar: `repRowIds_${sanitizeIdent(f.key)}_${sanitizeIdent(f.id)}`,
  }));

  const repeaterStateDeclarations = repeaterStates
    .map(
      ({ stateVar }: { stateVar: string }) =>
        `  const [${stateVar}, set${stateVar.charAt(0).toUpperCase() + stateVar.slice(1)}] = useState<string[]>(() => ['0']);`,
    )
    .join("\n");

  let formBody: string;
  if (hasFields && layout.steps && layout.steps.length > 0) {
    const sections = layout.steps
      .map((step: FormStep, stepIdx: number) => {
        const stepFields = orderedFields.filter(
          (f: FieldModel) => f.stepIndex === stepIdx || f.stepIndex === undefined,
        );
        const fieldComponents = stepFields
          .map((f: FieldModel) => generateFieldComponent(f, domIdByKey, undefined, repeaterStates))
          .join("\n\n");
        return `<section className="form-section">
          <h2 className="section-title">
            <span className="section-number">${stepIdx + 1}</span>
            ${escapeHtml(step.title)}
          </h2>
          <div className="section-fields">
            ${fieldComponents}
          </div>
        </section>`;
      })
      .join("\n\n        ");

    formBody = `<form ref={formRef} onInput={() => setFormTick((v) => v + 1)} onSubmit={handleSubmit} noValidate>
        ${sections}
        <button type="submit" className="submit-button" ${submitColor ? `style={{ '--submit-bg-color': '${submitColor}' } as React.CSSProperties}` : ""}>${escapeHtml(submitText)}</button>
      </form>`;
  } else if (hasFields) {
    const fieldComponents = orderedFields
      .map((f: FieldModel) => generateFieldComponent(f, domIdByKey, undefined, repeaterStates))
      .join("\n\n");
    formBody = `<form ref={formRef} onInput={() => setFormTick((v) => v + 1)} onSubmit={handleSubmit} noValidate>
        ${fieldComponents}
        <button type="submit" className="submit-button" ${submitColor ? `style={{ '--submit-bg-color': '${submitColor}' } as React.CSSProperties}` : ""}>${escapeHtml(submitText)}</button>
      </form>`;
  } else {
    formBody = `<div className="empty-state">Form is empty.</div>`;
  }

  const allFields = collectAllFields(orderedFields);
  const fieldIdMapEntries = allFields
    .map((f: FieldModel) => `  '${escapeJsSingleQuotedString(f.key)}': '${domIdByKey.get(f.key)}'`)
    .join(",\n");

  const calcHelpers = `function evaluateCalcExpression(formula: string, values: Record<string, string>): string | number {
  if (!formula) return '';
  const interpolated = formula.replace(/\\{([^}]+)\\}/g, (_, key: string) => {
    const k = key.trim();
    const val = values[k];
    return val !== undefined && val !== null ? String(val) : '0';
  });
  const isArithmetic = /^[\\d\\s+\\-*/().]+$/.test(interpolated);
  if (isArithmetic) {
    try {
      const result = new Function('"use strict"; return (' + interpolated + ');')() as number;
      return typeof result === 'number' && isFinite(result) ? result : interpolated;
    } catch {
      return interpolated;
    }
  }
  return interpolated;
}

function formValuesForCalc(form: HTMLFormElement | null): Record<string, string> {
  if (!form) return {};
  const fd = new FormData(form);
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

function syncSignaturePads(form: HTMLFormElement | null) {
  if (!form) return;
  form.querySelectorAll<HTMLCanvasElement>('canvas[data-fs-sig-target]').forEach((canvas) => {
    const hidId = canvas.getAttribute('data-fs-sig-target');
    if (!hidId) return;
    const hid = document.getElementById(hidId) as HTMLInputElement | null;
    if (hid) hid.value = canvas.toDataURL('image/png');
  });
}
`;

  return `import React, { FormEvent, useState, useRef, useEffect } from 'react';

${calcHelpers}
const FIELD_ID_MAP: Record<string, string> = {
${fieldIdMapEntries}
};

function App() {
  const formRef = useRef<HTMLFormElement>(null);
  const [, setFormTick] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
${repeaterStateDeclarations ? `\n${repeaterStateDeclarations}\n` : ""}

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const timers: Record<string, number> = {};
    const cleanups: (() => void)[] = [];
    form.querySelectorAll<HTMLInputElement>('input[data-typeahead-url]').forEach((input) => {
      const urlTpl = input.dataset.typeaheadUrl || '';
      const listId = input.getAttribute('list');
      if (!listId || !urlTpl) return;
      const dl = document.getElementById(listId);
      if (!dl) return;
      const onInput = () => {
        const key = input.id || listId;
        window.clearTimeout(timers[key]);
        const q = input.value.trim();
        timers[key] = window.setTimeout(() => {
          const url = urlTpl.split('{query}').join(encodeURIComponent(q));
          fetch(url)
            .then((r) => r.json())
            .then((data: unknown) => {
              const arr = Array.isArray(data) ? data : [];
              dl.innerHTML = '';
              arr.slice(0, 50).forEach((item: unknown) => {
                const opt = document.createElement('option');
                const v =
                  typeof item === 'string'
                    ? item
                    : String(
                        (item as { label?: unknown }).label ??
                          (item as { value?: unknown }).value ??
                          item,
                      );
                opt.value = v;
                dl.appendChild(opt);
              });
            })
            .catch(() => {});
        }, 300);
      };
      input.addEventListener('input', onInput);
      cleanups.push(() => input.removeEventListener('input', onInput));
    });
    return () => cleanups.forEach((c) => c());
  }, []);

  const validate = (data: Record<string, FormDataEntryValue>): Record<string, string> => {
    const errs: Record<string, string> = {};
    return errs;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    syncSignaturePads(e.currentTarget);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const errs = validate(data);
    setErrors(errs);
    const errorCount = Object.keys(errs).length;
    if (errorCount > 0) {
      setStatusMessage(
        errorCount === 1
          ? '1 error found. Please review the highlighted field.'
          : errorCount + ' errors found. Please review the highlighted fields.'
      );
      const firstErrorKey = Object.keys(errs)[0];
      const firstErrorId = FIELD_ID_MAP[firstErrorKey];
      if (firstErrorId) {
        const el = document.getElementById(firstErrorId) as HTMLElement | null;
        el?.focus();
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    /* FORMSYNC_API_SUBMIT_START */
    setStatusMessage('');
    console.log('Form submitted:', data);
    /* FORMSYNC_API_SUBMIT_END */
  };

  return (
    <div className="form-container">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>
      <h1 className="form-title">${escapeHtml(title)}</h1>
      ${description ? `<p className="form-description">${escapeHtml(description)}</p>` : ""}
      ${formBody}
    </div>
  );
}

export default App;
`;
}

interface RepeaterStateSpec {
  field: FieldModel;
  stateVar: string;
}

function generateFieldComponent(
  field: FieldModel,
  domIdByKey: Map<string, string>,
  ctx: RepeaterCodegenCtx | undefined,
  repeaterStates: RepeaterStateSpec[],
): string {
  const { type, label, required, ui } = field;
  const domBase = domIdByKey.get(field.key) ?? field.id;
  const nameAttr = ctx ? jsxRepeaterNameAttr(ctx.repeaterRoot, field) : staticNameAttr(field);
  const idAttr = jsxIdAttr(domBase, ctx);
  const htmlForAttr = jsxHtmlForAttr(domBase, ctx);
  const errExpr = jsxErrorsLookup(ctx?.repeaterRoot, field);
  const ariaDescribedBy = jsxAriaDescribedBy(domBase, ctx);
  const ariaInvalid = `aria-invalid={${errExpr} ? 'true' : 'false'}`;
  const ariaErrMsg = ctx
    ? `aria-errormessage={\\\`${domBase.replace(/`/g, "\\`")}_\\\${rowIdx}-error\\\`}`
    : `aria-errormessage="${domBase}-error"`;

  if (type === "repeater") {
    const spec = repeaterStates.find((s) => s.field.id === field.id);
    if (!spec) {
      return `<div className="field-item"><p className="field-help-text">Repeater configuration error.</p></div>`;
    }
    const children = field.children || [];
    if (children.some((c: FieldModel) => c.type === "repeater")) {
      return `<div className="field-item border rounded p-3 mb-3">
          <div className="field-label fw-semibold mb-2">${escapeHtml(label)}</div>
          <p className="text-muted small">Nested repeaters are not supported in this export.</p>
        </div>`;
    }
    const setterName = `set${spec.stateVar.charAt(0).toUpperCase()}${spec.stateVar.slice(1)}`;
    const innerRows = children
      .map((child: FieldModel) =>
        generateFieldComponent(child, domIdByKey, { repeaterRoot: field.key }, repeaterStates),
      )
      .join("\n\n");

    return `<fieldset className="field-group repeater-field mb-4" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '1rem' }}>
        <legend className="field-legend" style={{ padding: '0 0.5rem', fontWeight: 600 }}>${escapeHtml(label)}${required ? ' <span className="required" aria-hidden="true">*</span>' : ""}</legend>
        {${spec.stateVar}.map((rowId, rowIdx) => (
        <div key={rowId} className="repeater-row border rounded p-3 mb-3 bg-light">
          ${innerRows}
          <button type="button" className="btn btn-sm btn-outline-danger mt-2" onClick={() => ${setterName}((rows) => rows.length <= 1 ? rows : rows.filter((_, i) => i !== rowIdx))}>Remove row</button>
        </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => ${setterName}((rows) => [...rows, String(Date.now())])}>Add row</button>
      </fieldset>`;
  }

  const explicitPlaceholder = ui?.placeholder;
  const computedPlaceholder = explicitPlaceholder ?? `Enter ${label.toLowerCase()}...`;
  const placeholder = type === "date" ? "" : computedPlaceholder;
  const helpText = ui?.helpText;
  const overrides = ui?.styleOverrides as Record<string, string> | undefined;
  const autoComplete = AUTO_COMPLETE_MAP[field.key] ?? "";

  const overrideVars: string[] = overrides
    ? ([
        overrides.labelColor && `'--field-label-color': '${overrides.labelColor}'`,
        overrides.inputTextColor && `'--field-input-text-color': '${overrides.inputTextColor}'`,
        overrides.backgroundColor && `'--field-bg-color': '${overrides.backgroundColor}'`,
        overrides.borderColor && `'--field-border-color': '${overrides.borderColor}'`,
        overrides.focusColor && `'--color-primary': '${overrides.focusColor}'`,
      ].filter(Boolean) as string[])
    : [];

  const buildStyle = (extra: string[] = []): string => {
    const all = [...extra, ...overrideVars];
    return all.length > 0 ? `style={{ ${all.join(", ")} } as React.CSSProperties}` : "";
  };

  if (type === "group") {
    const children = field.children || [];
    const childComponents = children
      .map((child: FieldModel) => generateFieldComponent(child, domIdByKey, ctx, repeaterStates))
      .join("\n");
    const groupExtra = [
      `border: '1px solid #e5e7eb'`,
      `borderRadius: '4px'`,
      `padding: '1rem'`,
      `marginBottom: '1.5rem'`,
    ];
    return `<fieldset className="field-group" ${buildStyle(groupExtra)}>
          <legend className="field-legend" style={{ padding: '0 0.5rem', fontWeight: 600 }}>${escapeHtml(label)}</legend>
          ${childComponents}
        </fieldset>`;
  }

  const ariaRequired = required ? `aria-required="true"` : "";
  const autoCompleteAttr = autoComplete ? `autoComplete="${autoComplete}"` : "";

  const helpSpan = helpText
    ? ctx
      ? `<small id={\\\`${domBase.replace(/`/g, "\\`")}_\\\${rowIdx}-help\\\`} className="field-help-text">${escapeHtml(helpText)}</small>`
      : `<small id="${domBase}-help" className="field-help-text">${escapeHtml(helpText)}</small>`
    : "";

  const errSpan = ctx
    ? `<span id={\\\`${domBase.replace(/`/g, "\\`")}_\\\${rowIdx}-error\\\`} className="field-error" role="alert" aria-live="polite">{${errExpr}}</span>`
    : `<span id="${domBase}-error" className="field-error" role="alert" aria-live="polite">{${errExpr}}</span>`;

  switch (type) {
    case "textarea":
    case "richtext": {
      const input = `<textarea
            ${nameAttr}
            ${idAttr}
            className="field-input"
            ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
            ${required ? "required" : ""}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
            ${autoCompleteAttr}
          ></textarea>`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan);
    }
    case "select": {
      const options = field.constraints?.enum || [];
      const input = `<select
            ${nameAttr}
            ${idAttr}
            className="field-input"
            ${required ? "required" : ""}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
            ${autoCompleteAttr}
          >
            <option value="">${escapeHtml(placeholder) || "Select..."}</option>
            ${options.map((o: string) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("\n            ")}
          </select>`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan);
    }
    case "checkbox": {
      const input = `<input
            type="checkbox"
            ${nameAttr}
            ${idAttr}
            className="field-input"
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
          />`;
      const rowStyle = [`display: 'flex'`, `alignItems: 'center'`, `flexWrap: 'wrap'`];
      const cbHelpId =
        ctx ?
          `id={\\\`${domBase.replace(/`/g, "\\`")}_\\\${rowIdx}-help\\\`}`
        : `id="${domBase}-help"`;
      const cbHelp = helpText
        ? `<small ${cbHelpId} className="field-help-text" style={{ marginLeft: 'auto' }}>${escapeHtml(helpText)}</small>`
        : "";
      return `<div className="field-item checkbox-item" ${buildStyle(rowStyle)}>
          ${input}
          <label ${htmlForAttr} className="field-label" style={{ marginBottom: 0 }}>
            ${escapeHtml(label)}${required ? '<span className="required" aria-hidden="true">*</span>' : ""}
          </label>
          ${cbHelp}
          ${errSpan}
        </div>`;
    }
    case "file": {
      const xui = ui?.["x-ui"];
      const accept = xui?.accept ? `accept="${escapeHtml(String(xui.accept))}"` : "";
      const multiple = xui?.multiple ? "multiple" : "";
      const input = `<input
            type="file"
            ${nameAttr}
            ${idAttr}
            className="field-input"
            ${accept}
            ${multiple}
            ${required ? "required" : ""}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
          />`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan);
    }
    case "signature": {
      const hidId = `${domBase}_sig`;
      const hidIdExpr = ctx
        ? `{\\\`${domBase.replace(/`/g, "\\`")}_\\\${rowIdx}_sig\\\`}`
        : `"${escapeHtml(hidId)}"`;
      const canvasIdExpr = ctx
        ? `{\\\`${domBase.replace(/`/g, "\\`")}_\\\${rowIdx}_canvas\\\`}`
        : `"${escapeHtml(domBase)}_canvas"`;
      const sigTargetAttr = ctx
        ? `data-fs-sig-target={\\\`${domBase.replace(/`/g, "\\`")}_\\\${rowIdx}_sig\\\`}`
        : `data-fs-sig-target="${escapeHtml(hidId)}"`;
      const input = `<canvas
            id=${canvasIdExpr}
            width={400}
            height={160}
            className="border rounded bg-white"
            ${sigTargetAttr}
            style={{ maxWidth: '100%', touchAction: 'none' }}
            onPointerDown={(e) => {
              const c = e.currentTarget;
              const g = c.getContext('2d');
              if (!g) return;
              const rect = c.getBoundingClientRect();
              let drawing = true;
              g.beginPath();
              g.strokeStyle = '#111';
              g.lineWidth = 2;
              g.moveTo(e.clientX - rect.left, e.clientY - rect.top);
              const move = (ev: PointerEvent) => {
                if (!drawing) return;
                g.lineTo(ev.clientX - rect.left, ev.clientY - rect.top);
                g.stroke();
              };
              const up = () => {
                drawing = false;
                c.removeEventListener('pointermove', move);
              };
              c.setPointerCapture(e.pointerId);
              c.addEventListener('pointermove', move);
              c.addEventListener('pointerup', up, { once: true });
            }}
          />
          <input type="hidden" ${nameAttr} id=${hidIdExpr} />`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan);
    }
    case "typeahead": {
      const url = ui?.["x-ui"]?.asyncSource?.url ?? "";
      const dlId = `${domBase}_dl`;
      const dlIdExpr = ctx
        ? `{\\\`${domBase.replace(/`/g, "\\`")}_\\\${rowIdx}_dl\\\`}`
        : `"${escapeHtml(dlId)}"`;
      const input = `<input
            type="text"
            ${nameAttr}
            ${idAttr}
            className="field-input"
            list=${dlIdExpr}
            data-typeahead-url="${escapeHtml(url)}"
            ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
            ${required ? "required" : ""}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
          />
          <datalist id=${dlIdExpr}></datalist>`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan);
    }
    case "calculated": {
      const formula = field["x-calc"] ?? "";
      const input = `<input
            readOnly
            ${nameAttr}
            ${idAttr}
            className="field-input"
            value={String(evaluateCalcExpression(${JSON.stringify(formula)}, formValuesForCalc(formRef.current)))}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
          />`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan);
    }
    case "text":
    case "email":
    case "password":
    case "number":
    case "date": {
      const input = `<input
            type="${type}"
            ${nameAttr}
            ${idAttr}
            className="field-input"
            ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
            ${required ? "required" : ""}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
            ${autoCompleteAttr}
          />`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan);
    }
    case "unknown":
    default: {
      const input = `<input
            type="text"
            ${nameAttr}
            ${idAttr}
            className="field-input"
            ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
            ${required ? "required" : ""}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
          />`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan);
    }
  }
}

function wrapField(
  label: string,
  required: boolean,
  htmlForAttr: string,
  input: string,
  buildStyle: (e?: string[]) => string,
  helpSpan: string,
  errSpan: string,
): string {
  return `<div className="field-item" ${buildStyle()}>
          <label ${htmlForAttr} className="field-label">
            ${escapeHtml(label)}${required ? '<span className="required" aria-hidden="true">*</span>' : ""}
          </label>
          ${input}
          ${helpSpan}
          ${errSpan}
        </div>`;
}

function collectAllFields(fields: FieldModel[]): FieldModel[] {
  const result: FieldModel[] = [];
  for (const f of fields) {
    if (f.type === "group" || f.type === "repeater") {
      if (f.children?.length) result.push(...collectAllFields(f.children));
    } else {
      result.push(f);
    }
  }
  return result;
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
