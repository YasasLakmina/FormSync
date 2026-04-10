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

/** Wizard step slice: nested group/repeater children honor stepIndex ?? 0. */
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

/** Repeater chrome from field.ui.styleOverrides (matches builder preview + static HTML). */
function repeaterChromeStyles(field: FieldModel): {
  fieldsetStyle: string;
  legendStyle: string;
  theadTrStyle: string;
  addButtonStyle: string;
} {
  const o = field.ui?.styleOverrides as Record<string, string> | undefined;
  const border = o?.borderColor ?? "#e5e7eb";
  const bg = o?.backgroundColor;
  const lc = o?.labelColor;
  const accent = o?.focusColor;
  const fs: string[] = [`border: '1px solid ${border}'`, `borderRadius: '4px'`, `padding: '1rem'`];
  if (bg) fs.push(`background: '${bg}'`);
  const fieldsetStyle = fs.join(", ");
  const legendParts = [`padding: '0 0.5rem'`, `fontWeight: 600`];
  if (lc) legendParts.push(`color: '${lc}'`);
  const legendStyle = legendParts.join(", ");
  const theadBg =
    lc && bg ? `color-mix(in srgb, ${lc} 12%, ${bg})` : bg ? `color-mix(in srgb, #64748b 8%, ${bg})` : "#f1f5f9";
  const theadTrParts = [`background: '${theadBg}'`];
  if (lc) theadTrParts.push(`color: '${lc}'`);
  const theadTrStyle = theadTrParts.join(", ");
  const addButtonStyle = accent ? `color: '${accent}', borderColor: '${accent}'` : "";
  return { fieldsetStyle, legendStyle, theadTrStyle, addButtonStyle };
}

/** Rules for generated client-side validate() — keyed by semantic field key (matches indexed form names via template path). */
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

/** Source appended to App.tsx: FIELD_RULES + validate helpers (strict TS). */
function buildGeneratedClientValidationSource(): string {
  return `type FieldRule = {
  label: string;
  type: string;
  required: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

function templatePathFromIndexedPath(path: string): string {
  return path.split(".").filter((p) => !/^\\d+$/.test(p)).join(".");
}

function resolveRuleFromKeys(rules: Record<string, FieldRule>, tk: string): FieldRule | undefined {
  let rule = rules[tk];
  if (rule) return rule;
  const parts = tk.split(".").filter(Boolean);
  return parts.length ? rules[parts[parts.length - 1]] : undefined;
}

function collectNamedFieldErrors(root: Element, rules: Record<string, FieldRule>): Record<string, string> {
  const errs: Record<string, string> = {};
  const emailRe = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

  const applyTextRules = (rule: FieldRule, raw: string, path: string): void => {
    const v = raw.trim();
    if (rule.required && v === "") {
      errs[path] = rule.label + " is required.";
      return;
    }
    if (v === "") return;

    if (rule.type === "number") {
      const normalized = v.replace(/\\s/g, "");
      if (/[eE]/.test(normalized)) {
        errs[path] = rule.label + " must be a valid number.";
        return;
      }
      if (!/^-?(?:\\d+\\.?\\d*|\\.\\d+)$/.test(normalized)) {
        errs[path] = rule.label + " must be a valid number.";
        return;
      }
      const num = Number(normalized);
      if (Number.isNaN(num)) {
        errs[path] = rule.label + " must be a valid number.";
        return;
      }
      const disallowNegative = rule.min !== undefined && rule.min >= 0;
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
        const re = new RegExp(rule.pattern);
        if (!re.test(v)) errs[path] = rule.label + " format is invalid.";
      } catch {
        /* ignore bad pattern */
      }
    }
  };

  root.querySelectorAll<HTMLElement>("[name]").forEach((el) => {
    const nm = (el as HTMLInputElement).name;
    if (!nm) return;
    const tk = templatePathFromIndexedPath(nm);
    const rule = resolveRuleFromKeys(rules, tk);
    if (!rule) return;

    const tag = el.tagName.toLowerCase();

    if (tag === "input") {
      const inp = el as HTMLInputElement;
      const ty = inp.type;
      if (ty === "checkbox") {
        if (rule.required && !inp.checked) errs[nm] = rule.label + " is required.";
        return;
      }
      if (ty === "file") {
        if (rule.required && (!inp.files || inp.files.length === 0)) errs[nm] = rule.label + " is required.";
        return;
      }
      if (ty === "hidden") {
        if (rule.required && !(inp.value || "").trim()) errs[nm] = rule.label + " is required.";
        return;
      }
      if (inp.readOnly && rule.type === "calculated") return;
      applyTextRules(rule, inp.value ?? "", nm);
      return;
    }

    if (tag === "select") {
      const sel = el as HTMLSelectElement;
      const val = sel.value;
      if (rule.required && (val === "" || val == null)) errs[nm] = rule.label + " is required.";
      return;
    }

    if (tag === "textarea") {
      applyTextRules(rule, (el as HTMLTextAreaElement).value ?? "", nm);
    }
  });

  return errs;
}

function validateForm(form: HTMLFormElement, rules: Record<string, FieldRule>): Record<string, string> {
  return collectNamedFieldErrors(form, rules);
}

function validateFormScoped(
  _form: HTMLFormElement,
  rules: Record<string, FieldRule>,
  scope: Element | null,
): Record<string, string> {
  if (!scope) return {};
  return collectNamedFieldErrors(scope, rules);
}
`;
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
  return `name={\`${rootLit}.\${rowIdx}.${relLit}\`}`;
}

function jsxIdAttr(domBase: string, ctx?: RepeaterCodegenCtx): string {
  if (!ctx) return `id="${escapeHtml(domBase)}"`;
  const base = domBase.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `id={\`${base}_\${rowIdx}\`}`;
}

function jsxHtmlForAttr(domBase: string, ctx?: RepeaterCodegenCtx): string {
  if (!ctx) return `htmlFor="${escapeHtml(domBase)}"`;
  const base = domBase.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `htmlFor={\`${base}_\${rowIdx}\`}`;
}

function jsxErrorsLookup(repeaterRoot: string | undefined, field: FieldModel): string {
  if (!repeaterRoot) return `errors['${escapeJsSingleQuotedString(field.key)}']`;
  const rel = relativeUnderRepeater(repeaterRoot, field.key);
  const rootLit = repeaterRoot.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  const relLit = rel.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `errors[\`${rootLit}.\${rowIdx}.${relLit}\`]`;
}

function jsxAriaDescribedBy(domBase: string, ctx?: RepeaterCodegenCtx): string {
  if (!ctx) return `aria-describedby="${domBase}-help ${domBase}-error"`;
  const b = domBase.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `aria-describedby={\`${b}_\${rowIdx}-help ${b}_\${rowIdx}-error\`}`;
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

  const wizardStepCount = layout.steps?.length ?? 0;
  const isWizardLayout = !!(layout.steps && layout.steps.length > 0);
  const multiStepWizard = !!(layout.steps && layout.steps.length > 1);

  let formBody: string;
  if (hasFields && isWizardLayout && layout.steps && multiStepWizard) {
    const sections = layout.steps
      .map((step: FormStep, stepIdx: number) => {
        const stepFields = pruneFieldsForWizardStep(orderedFields, stepIdx);
        const fieldComponents = stepFields
          .map((f: FieldModel) => generateFieldComponent(f, domIdByKey, undefined, repeaterStates))
          .join("\n\n");
        return `<section
          className="form-section wizard-panel"
          data-wizard-step={${stepIdx}}
          hidden={wizardStep !== ${stepIdx}}
          aria-hidden={wizardStep !== ${stepIdx}}
        >
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

    const submitBtnStyle = submitColor
      ? `style={{ '--submit-bg-color': '${submitColor}' } as React.CSSProperties}`
      : "";

    formBody = `<form ref={formRef} onInput={() => setFormTick((v) => v + 1)} onSubmit={handleSubmit} noValidate>
        ${sections}
        <div className="wizard-footer">
          {wizardStep > 0 ? (
            <button
              type="button"
              className="wizard-btn wizard-btn-secondary"
              onClick={() => {
                setStatusMessage("");
                setWizardStep((s) => Math.max(0, s - 1));
              }}
            >
              Previous
            </button>
          ) : (
            <span className="wizard-footer-spacer" aria-hidden />
          )}
          <div className="wizard-footer-actions">
            {wizardStep < ${wizardStepCount - 1} ? (
              <button type="button" className="wizard-btn wizard-btn-primary" onClick={handleWizardNext}>
                Next
              </button>
            ) : null}
            {wizardStep === ${wizardStepCount - 1} ? (
              <button type="submit" className="submit-button" ${submitBtnStyle}>${escapeHtml(submitText)}</button>
            ) : null}
          </div>
        </div>
      </form>`;
  } else if (hasFields && isWizardLayout && layout.steps?.length === 1) {
    const soleStep = layout.steps[0]!;
    const stepFields = pruneFieldsForWizardStep(orderedFields, 0);
    const fieldComponents = stepFields
      .map((f: FieldModel) => generateFieldComponent(f, domIdByKey, undefined, repeaterStates))
      .join("\n\n");
    formBody = `<form ref={formRef} onInput={() => setFormTick((v) => v + 1)} onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <h2 className="section-title">
            <span className="section-number">1</span>
            ${escapeHtml(soleStep.title)}
          </h2>
          <div className="section-fields">
            ${fieldComponents}
          </div>
        </section>
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

function scopedRepeaterValuesForCalc(
  form: HTMLFormElement | null,
  repeaterRoot: string,
  rowIdx: number,
): Record<string, string> {
  const flat = formValuesForCalc(form);
  const prefix = repeaterRoot + "." + rowIdx + ".";
  const out: Record<string, string> = { ...flat };
  for (const [k, v] of Object.entries(flat)) {
    if (k.startsWith(prefix)) {
      out[k.slice(prefix.length)] = v;
    }
  }
  return out;
}

function syncRichTextEditors(form: HTMLFormElement | null) {
  if (!form) return;
  form.querySelectorAll<HTMLInputElement>('input[type="hidden"][data-fs-richtext]').forEach((hid) => {
    const wrap = hid.closest(".richtext-wrap");
    const ed = wrap?.querySelector<HTMLElement>(".richtext-editable");
    if (ed) hid.value = ed.innerHTML;
  });
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

  const wizardStepStateLine =
    hasFields && multiStepWizard
      ? `  const [wizardStep, setWizardStep] = useState(0);\n`
      : "";

  const wizardFocusEffect =
    hasFields && multiStepWizard
      ? `
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const panel = form.querySelector(\`[data-wizard-step="\${wizardStep}"]\`);
    if (!panel) return;
    const focusable = panel.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus({ preventScroll: true });
  }, [wizardStep]);
`
      : "";

  const wizardSubmitGate =
    hasFields && isWizardLayout && wizardStepCount > 1
      ? `
    if (wizardStep < ${wizardStepCount - 1}) {
      handleWizardNext();
      return;
    }
`
      : "";

  const handleWizardNextBlock =
    hasFields && isWizardLayout && wizardStepCount > 1
      ? `
  const handleWizardNext = () => {
    const form = formRef.current;
    if (!form) return;
    syncRichTextEditors(form);
    syncSignaturePads(form);
    const scope = form.querySelector(\`[data-wizard-step="\${wizardStep}"]\`);
    const stepErrs = validateFormScoped(form, FIELD_RULES, scope);
    setErrors(stepErrs);
    const errorKeys = Object.keys(stepErrs);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const firstDetail = firstKey ? stepErrs[firstKey] : "";
      setStatusKind("error");
      setStatusMessage(
        errorKeys.length === 1
          ? firstDetail || "Please fix the highlighted field."
          : errorKeys.length +
              " errors found. " +
              (firstDetail || "Please review the highlighted fields."),
      );
      if (firstKey) {
        let focusEl: HTMLElement | null = null;
        const els = form.elements;
        for (let i = 0; i < els.length; i++) {
          const fe = els[i];
          if (
            fe instanceof HTMLElement &&
            "name" in fe &&
            (fe as HTMLInputElement).name === firstKey
          ) {
            focusEl = fe;
            break;
          }
        }
        const tk = templatePathFromIndexedPath(firstKey);
        const fallbackId = FIELD_ID_MAP[tk];
        const el = focusEl ?? (fallbackId ? (document.getElementById(fallbackId) as HTMLElement | null) : null);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setErrors({});
    setStatusMessage("");
    setWizardStep((s) => s + 1);
  };

`
      : "";

  const fieldRulesJson = buildClientFieldRulesJson(formModel);

  return `import React, { FormEvent, useState, useRef, useEffect } from 'react';

${calcHelpers}
${buildGeneratedClientValidationSource()}
const FIELD_ID_MAP: Record<string, string> = {
${fieldIdMapEntries}
};

const FIELD_RULES = ${fieldRulesJson} as Record<string, FieldRule>;

function App() {
  const formRef = useRef<HTMLFormElement>(null);
  const [, setFormTick] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusKind, setStatusKind] = useState<'error' | 'success'>('error');
${wizardStepStateLine}${repeaterStateDeclarations ? `\n${repeaterStateDeclarations}\n` : ""}

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
${wizardFocusEffect}${handleWizardNextBlock}
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    syncRichTextEditors(e.currentTarget);
    syncSignaturePads(e.currentTarget);${wizardSubmitGate}
    const errs = validateForm(e.currentTarget, FIELD_RULES);
    setErrors(errs);
    const errorKeys = Object.keys(errs);
    const errorCount = errorKeys.length;
    if (errorCount > 0) {
      const firstKey = errorKeys[0];
      const firstDetail = firstKey ? errs[firstKey] : "";
      setStatusKind("error");
      setStatusMessage(
        errorCount === 1
          ? firstDetail || "Please fix the highlighted field."
          : errorCount +
              " errors found. " +
              (firstDetail || "Please review the highlighted fields."),
      );
      if (firstKey) {
        let focusEl: HTMLElement | null = null;
        const els = e.currentTarget.elements;
        for (let i = 0; i < els.length; i++) {
          const fe = els[i];
          if (
            fe instanceof HTMLElement &&
            "name" in fe &&
            (fe as HTMLInputElement).name === firstKey
          ) {
            focusEl = fe;
            break;
          }
        }
        const tk = templatePathFromIndexedPath(firstKey);
        const fallbackId = FIELD_ID_MAP[tk];
        const el = focusEl ?? (fallbackId ? (document.getElementById(fallbackId) as HTMLElement | null) : null);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    /* FORMSYNC_API_SUBMIT_START */
    setStatusKind("success");
    setStatusMessage("Submitted successfully. Thanks — your response was recorded.");
    console.log('Form submitted:', data);
    /* FORMSYNC_API_SUBMIT_END */
  };

  return (
    <div className="form-container">
      {statusMessage ? (
        <div
          className={
            statusKind === "success"
              ? "form-validation-summary form-submit-success"
              : "form-validation-summary"
          }
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          {statusMessage}
        </div>
      ) : null}
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
  asTableCell = false,
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
    ? `aria-errormessage={\`${domBase.replace(/`/g, "\\`")}_\${rowIdx}-error\`}`
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
    if (children.length === 0) {
      const emptyRc = repeaterChromeStyles(field);
      const emptyAdd = emptyRc.addButtonStyle
        ? `<button type="button" className="btn btn-sm btn-outline-primary" style={{ ${emptyRc.addButtonStyle} }} onClick={() => {}} disabled title="Add child fields in the builder first">Add row</button>`
        : `<button type="button" className="btn btn-sm btn-outline-primary" disabled title="Add child fields in the builder first">Add row</button>`;
      return `<fieldset className="field-group repeater-field mb-4" style={{ ${emptyRc.fieldsetStyle} }}>
        <legend className="field-legend" style={{ ${emptyRc.legendStyle} }}>${escapeHtml(label)}${required ? ' <span className="required" aria-hidden="true">*</span>' : ""}</legend>
        <p className="text-muted small mb-3" role="note">
          This repeater has no column fields yet. In FormSync, select the repeater → add fields inside it (each becomes a table column or card row). Then re-export.
        </p>
        ${emptyAdd}
      </fieldset>`;
    }
    const setterName = `set${spec.stateVar.charAt(0).toUpperCase()}${spec.stateVar.slice(1)}`;
    const innerRows = children
      .map((child: FieldModel) =>
        generateFieldComponent(child, domIdByKey, { repeaterRoot: field.key }, repeaterStates, false),
      )
      .join("\n\n");

    const displayMode =
      field.ui && typeof field.ui === "object" && (field.ui as Record<string, unknown>)["displayMode"] === "table"
        ? "table"
        : "cards";

    if (displayMode === "table" && children.length > 0) {
      const rc = repeaterChromeStyles(field);
      const addTableBtn = rc.addButtonStyle
        ? `<button type="button" className="btn btn-sm btn-outline-primary mt-2" style={{ ${rc.addButtonStyle} }} onClick={() => ${setterName}((rows) => [...rows, String(Date.now())])}>Add row</button>`
        : `<button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => ${setterName}((rows) => [...rows, String(Date.now())])}>Add row</button>`;
      const thCells = children
        .map(
          (c: FieldModel) =>
            `<th scope="col" className="align-middle">${escapeHtml(c.label)}${
              c.required ? ' <span className="text-danger" aria-hidden="true">*</span>' : ""
            }</th>`,
        )
        .join("");
      const tdCells = children
        .map(
          (child: FieldModel) =>
            `<td className="align-middle repeater-table-cell" style={{ minWidth: "8rem", verticalAlign: "middle" }}>${generateFieldComponent(
              child,
              domIdByKey,
              { repeaterRoot: field.key },
              repeaterStates,
              true,
            )}</td>`,
        )
        .join("");

      return `<fieldset className="field-group repeater-field repeater-table mb-4" style={{ ${rc.fieldsetStyle} }}>
        <legend className="field-legend" style={{ ${rc.legendStyle} }}>${escapeHtml(label)}${required ? ' <span className="required" aria-hidden="true">*</span>' : ""}</legend>
        <div style={{ overflowX: "auto" }}>
        <table className="repeater-data-table" style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.95rem" }}>
          <thead>
            <tr style={{ ${rc.theadTrStyle} }}>
              ${thCells}
              <th scope="col" className="text-end repeater-table-actions" style={{ width: "6rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {${spec.stateVar}.map((rowId, rowIdx) => (
              <tr key={rowId} className="repeater-row">
                ${tdCells}
                <td className="text-end align-middle">
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => ${setterName}((rows) => rows.length <= 1 ? rows : rows.filter((_, i) => i !== rowIdx))}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        ${addTableBtn}
      </fieldset>`;
    }

    const rcCards = repeaterChromeStyles(field);
    const addCardBtn = rcCards.addButtonStyle
      ? `<button type="button" className="btn btn-sm btn-outline-primary" style={{ ${rcCards.addButtonStyle} }} onClick={() => ${setterName}((rows) => [...rows, String(Date.now())])}>Add row</button>`
      : `<button type="button" className="btn btn-sm btn-outline-primary" onClick={() => ${setterName}((rows) => [...rows, String(Date.now())])}>Add row</button>`;

    return `<fieldset className="field-group repeater-field mb-4" style={{ ${rcCards.fieldsetStyle} }}>
        <legend className="field-legend" style={{ ${rcCards.legendStyle} }}>${escapeHtml(label)}${required ? ' <span className="required" aria-hidden="true">*</span>' : ""}</legend>
        {${spec.stateVar}.map((rowId, rowIdx) => (
        <div key={rowId} className="repeater-row border rounded p-3 mb-3 bg-light">
          ${innerRows}
          <button type="button" className="btn btn-sm btn-outline-danger mt-2" onClick={() => ${setterName}((rows) => rows.length <= 1 ? rows : rows.filter((_, i) => i !== rowIdx))}>Remove row</button>
        </div>
        ))}
        ${addCardBtn}
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
      ? `<small id={\`${domBase.replace(/`/g, "\\`")}_\${rowIdx}-help\`} className="field-help-text">${escapeHtml(helpText)}</small>`
      : `<small id="${domBase}-help" className="field-help-text">${escapeHtml(helpText)}</small>`
    : "";

  const errSpan = ctx
    ? `<span id={\`${domBase.replace(/`/g, "\\`")}_\${rowIdx}-error\`} className="field-error" role="alert" aria-live="polite">{${errExpr}}</span>`
    : `<span id="${domBase}-error" className="field-error" role="alert" aria-live="polite">{${errExpr}}</span>`;

  switch (type) {
    case "textarea": {
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
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
    }
    case "richtext": {
      const richInput = `<div className="richtext-wrap">
            <div className="richtext-toolbar" role="toolbar" aria-label="Formatting">
              <button type="button" className="richtext-tool" onClick={(e) => { const ed = e.currentTarget.closest('.richtext-wrap')?.querySelector<HTMLElement>('.richtext-editable'); ed?.focus(); document.execCommand('bold'); }} title="Bold"><strong>B</strong></button>
              <button type="button" className="richtext-tool" onClick={(e) => { const ed = e.currentTarget.closest('.richtext-wrap')?.querySelector<HTMLElement>('.richtext-editable'); ed?.focus(); document.execCommand('italic'); }} title="Italic"><em>I</em></button>
              <button type="button" className="richtext-tool" onClick={(e) => { const ed = e.currentTarget.closest('.richtext-wrap')?.querySelector<HTMLElement>('.richtext-editable'); ed?.focus(); document.execCommand('underline'); }} title="Underline"><span style={{ textDecoration: 'underline' }}>U</span></button>
              <button type="button" className="richtext-tool" onClick={(e) => { const ed = e.currentTarget.closest('.richtext-wrap')?.querySelector<HTMLElement>('.richtext-editable'); ed?.focus(); document.execCommand('insertUnorderedList'); }} title="Bullets">•</button>
              <button type="button" className="richtext-tool" onClick={(e) => { const ed = e.currentTarget.closest('.richtext-wrap')?.querySelector<HTMLElement>('.richtext-editable'); ed?.focus(); document.execCommand('insertOrderedList'); }} title="Numbered list">1.</button>
            </div>
            <div
              ${idAttr}
              className="field-input richtext-editable"
              contentEditable
              suppressContentEditableWarning
              ${placeholder ? `data-placeholder="${escapeHtml(placeholder)}"` : ""}
              ${ariaRequired}
              ${ariaInvalid}
              ${ariaErrMsg}
              ${ariaDescribedBy}
              onInput={(e) => {
                const wrap = e.currentTarget.closest('.richtext-wrap');
                const hid = wrap?.querySelector<HTMLInputElement>('input[data-fs-richtext]');
                if (hid) hid.value = e.currentTarget.innerHTML;
              }}
            />
            <input type="hidden" data-fs-richtext ${nameAttr} />
          </div>`;
      return wrapField(label, required, htmlForAttr, richInput, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
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
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
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
          `id={\`${domBase.replace(/`/g, "\\`")}_\${rowIdx}-help\`}`
        : `id="${domBase}-help"`;
      const cbHelp = helpText
        ? `<small ${cbHelpId} className="field-help-text" style={{ marginLeft: 'auto' }}>${escapeHtml(helpText)}</small>`
        : "";
      const labelCls = asTableCell ? "field-label sr-only" : "field-label";
      const itemCls = asTableCell ? "field-item checkbox-item mb-0" : "field-item checkbox-item";
      return `<div className="${itemCls}" ${buildStyle(rowStyle)}>
          ${input}
          <label ${htmlForAttr} className="${labelCls}" style={{ marginBottom: 0 }}>
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
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
    }
    case "signature": {
      const hidId = `${domBase}_sig`;
      const hidIdExpr = ctx
        ? `{\`${domBase.replace(/`/g, "\\`")}_\${rowIdx}_sig\`}`
        : `"${escapeHtml(hidId)}"`;
      const canvasIdExpr = ctx
        ? `{\`${domBase.replace(/`/g, "\\`")}_\${rowIdx}_canvas\`}`
        : `"${escapeHtml(domBase)}_canvas"`;
      const sigTargetAttr = ctx
        ? `data-fs-sig-target={\`${domBase.replace(/`/g, "\\`")}_\${rowIdx}_sig\`}`
        : `data-fs-sig-target="${escapeHtml(hidId)}"`;
      const input = `<canvas
            id=${canvasIdExpr}
            width={400}
            height={160}
            className="field-input signature-pad-canvas"
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
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
    }
    case "typeahead": {
      const url = ui?.["x-ui"]?.asyncSource?.url ?? "";
      const dlId = `${domBase}_dl`;
      const dlIdExpr = ctx
        ? `{\`${domBase.replace(/`/g, "\\`")}_\${rowIdx}_dl\`}`
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
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
    }
    case "calculated": {
      const formula = field["x-calc"] ?? "";
      const calcValuesExpr = ctx
        ? `scopedRepeaterValuesForCalc(formRef.current, '${escapeJsSingleQuotedString(ctx.repeaterRoot)}', rowIdx)`
        : `formValuesForCalc(formRef.current)`;
      const input = `<input
            readOnly
            ${nameAttr}
            ${idAttr}
            className="field-input"
            value={String(evaluateCalcExpression(${JSON.stringify(formula)}, ${calcValuesExpr}))}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
          />`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
    }
    case "number": {
      const c = field.constraints;
      const minAttr = c?.min !== undefined ? `min={${c.min}}` : "";
      const maxAttr = c?.max !== undefined ? `max={${c.max}}` : "";
      const input = `<input
            type="number"
            ${nameAttr}
            ${idAttr}
            className="field-input"
            inputMode="decimal"
            ${minAttr}
            ${maxAttr}
            step="any"
            ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
            ${required ? "required" : ""}
            ${ariaRequired}
            ${ariaInvalid}
            ${ariaErrMsg}
            ${ariaDescribedBy}
          />`;
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
    }
    case "text":
    case "email":
    case "password":
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
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
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
      return wrapField(label, required, htmlForAttr, input, buildStyle, helpSpan, errSpan, { tableCell: !!asTableCell });
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
  opts?: { tableCell?: boolean },
): string {
  const tc = opts?.tableCell;
  const labelClass = tc ? "field-label sr-only" : "field-label";
  const itemClass = tc ? "field-item mb-0" : "field-item";
  return `<div className="${itemClass}" ${buildStyle()}>
          <label ${htmlForAttr} className="${labelClass}">
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
