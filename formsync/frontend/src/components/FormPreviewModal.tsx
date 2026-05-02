import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, FileJson2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  schemaJson: string;
  storyTitle: string;
  onClose: () => void;
}

/* ── Derive a simple field list from a JSON Schema Draft-07 ── */
interface FormField {
  name: string;
  label: string;
  type: string;
  format?: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  enum?: string[];
}

function deriveFields(schema: any): FormField[] {
  if (!schema?.properties) return [];
  const required: string[] = schema.required ?? [];
  return Object.entries(schema.properties).map(([name, def]: [string, any]) => ({
    name,
    label: def["x-accessibility"]?.label || def.title || toLabel(name),
    type: def.type ?? "string",
    format: def.format,
    required: required.includes(name),
    placeholder:
      def["x-accessibility"]?.hint ||
      (Array.isArray(def.examples) ? def.examples[0] : undefined) ||
      "",
    description: def.description,
    enum: Array.isArray(def.enum) ? def.enum : undefined,
  }));
}

function toLabel(name: string) {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function inputType(f: FormField): string {
  if (f.enum) return "select";
  if (f.type === "boolean") return "checkbox";
  if (f.type === "number" || f.type === "integer") return "number";
  if (f.format === "email") return "email";
  if (f.format === "uri") return "url";
  if (f.format === "date") return "date";
  if (f.format === "date-time") return "datetime-local";
  if (f.format === "password" || f.name.toLowerCase().includes("password")) return "password";
  if (f.type === "array") return "textarea";
  return "text";
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export const FormPreviewModal: React.FC<Props> = ({ schemaJson, storyTitle, onClose }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  let schema: any = null;
  try {
    schema = JSON.parse(schemaJson);
  } catch {
    setParseError("Could not parse schema JSON.");
  }

  const fields = schema ? deriveFields(schema) : [];

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-200/60 flex-shrink-0">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-neutral-900 text-base leading-tight truncate">
                Form Preview
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 truncate">{storyTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Schema info strip */}
        <div className="px-6 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2 flex-shrink-0">
          <FileJson2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-neutral-500">
            {fields.length} field{fields.length !== 1 ? "s" : ""}
            {schema?.title && ` · ${schema.title}`}
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full font-semibold">
            Preview only
          </span>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {parseError ? (
            <div className="flex items-center gap-2 px-3 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {parseError}
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-10 text-sm text-neutral-400">
              No renderable fields found in this schema.
            </div>
          ) : submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-10 gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="font-bold text-neutral-900">Form submitted!</p>
              <p className="text-xs text-neutral-400 text-center max-w-[220px]">
                This is a preview — no data was sent anywhere.
              </p>
              <button
                onClick={() => { setSubmitted(false); setValues({}); }}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
              >
                Reset form
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {schema?.description && (
                <p className="text-xs text-neutral-500 italic border-l-2 border-indigo-200 pl-3">
                  {schema.description}
                </p>
              )}

              {fields.map((field) => {
                const itype = inputType(field);
                const baseInput = "w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-neutral-900";
                return (
                  <div key={field.name} className="space-y-1">
                    <label className="flex items-center gap-1 text-xs font-semibold text-neutral-700">
                      {field.label}
                      {field.required && <span className="text-red-500 font-bold">*</span>}
                    </label>

                    {itype === "checkbox" ? (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!values[field.name]}
                          onChange={(e) => handleChange(field.name, e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 accent-indigo-500 cursor-pointer"
                        />
                        <span className="text-sm text-neutral-600">{field.placeholder || field.description || "Enable"}</span>
                      </label>
                    ) : itype === "select" && field.enum ? (
                      <select
                        value={values[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className={baseInput}
                      >
                        <option value="" disabled>Select {field.label}…</option>
                        {field.enum.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : itype === "textarea" ? (
                      <textarea
                        value={values[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}…`}
                        required={field.required}
                        rows={3}
                        className={`${baseInput} resize-none`}
                      />
                    ) : (
                      <input
                        type={itype}
                        value={values[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}…`}
                        required={field.required}
                        className={baseInput}
                      />
                    )}

                    {field.description && itype !== "checkbox" && (
                      <p className="text-[11px] text-neutral-400 leading-relaxed">{field.description}</p>
                    )}
                  </div>
                );
              })}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Form
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
