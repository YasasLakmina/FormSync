import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronRight, Copy, Check, Info, AlertTriangle,
  Sparkles, FileJson2, Upload, FolderOpen, Eye, Wand2,
  ShieldCheck, Zap, BookOpen, ArrowRight, ArrowLeft,
  Code2, Layers, BarChart3, CheckCircle2, XCircle,
  Lightbulb, Terminal, ChevronDown, Star, Clock,
  FileText, Settings, HelpCircle, ExternalLink,
} from "lucide-react";
import { Footer } from "./layout/Footer";

/* ─── Nav tree ───────────────────────────────────────────────── */
interface NavLeaf { id: string; label: string }
interface NavGroup { title: string; groupId: string; icon: React.ReactNode; items: NavLeaf[] }

const NAV: NavGroup[] = [
  {
    title: "Getting Started", groupId: "getting-started",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    items: [
      { id: "overview",      label: "Overview" },
      { id: "quickstart",    label: "Quick Start Guide" },
      { id: "user-types",    label: "User Types" },
    ],
  },
  {
    title: "Core Features", groupId: "core-features",
    icon: <Zap className="w-3.5 h-3.5" />,
    items: [
      { id: "schema-editor",  label: "Schema Editor" },
      { id: "templates",      label: "Template Builder" },
      { id: "formats",        label: "Input Formats" },
      { id: "form-preview",   label: "Form Preview" },
    ],
  },
  {
    title: "AI Features", groupId: "ai-features",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    items: [
      { id: "ai-suggestions",  label: "AI Schema Suggestions" },
      { id: "apply-undo",      label: "Applying & Undoing" },
      { id: "quality-scoring", label: "Quality Scoring" },
      { id: "suggest-name",    label: "AI Name Suggestions" },
    ],
  },
  {
    title: "SRS Import", groupId: "srs",
    icon: <FileText className="w-3.5 h-3.5" />,
    items: [
      { id: "srs-overview",    label: "What is SRS Import?" },
      { id: "srs-upload",      label: "Uploading Documents" },
      { id: "srs-stories",     label: "User Story Selection" },
      { id: "srs-projects",    label: "Managing Projects" },
    ],
  },
  {
    title: "Validation", groupId: "validation",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    items: [
      { id: "validation",   label: "Validation Process" },
      { id: "errors",       label: "Error Detection" },
      { id: "best-practices", label: "Best Practices" },
    ],
  },
  {
    title: "Export & Integration", groupId: "export",
    icon: <Code2 className="w-3.5 h-3.5" />,
    items: [
      { id: "export",       label: "Exporting Schemas" },
      { id: "integration",  label: "External Systems" },
      { id: "code-gen",     label: "Code Generation" },
    ],
  },
  {
    title: "Profile & Projects", groupId: "profile",
    icon: <Settings className="w-3.5 h-3.5" />,
    items: [
      { id: "profile-overview", label: "Profile Page" },
      { id: "managing-schemas", label: "Managing Schemas" },
      { id: "srs-projects-mgmt", label: "SRS Projects" },
    ],
  },
  {
    title: "Help & Reference", groupId: "help",
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    items: [
      { id: "faqs",          label: "FAQs" },
      { id: "common-errors", label: "Common Errors" },
      { id: "shortcuts",     label: "Keyboard Shortcuts" },
      { id: "limitations",   label: "Limitations" },
    ],
  },
];

// Flat ordered list for prev/next nav
const FLAT_SECTIONS: NavLeaf[] = NAV.flatMap((g) => g.items);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(NAV.map((g) => g.groupId)),
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isNavigatingRef.current) return;
      const sections = document.querySelectorAll("section[id]");
      let current = "overview";
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= 120 && r.bottom >= 120) current = s.id;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    isNavigatingRef.current = true;
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 88;
      window.scrollTo({ top: y, behavior: "smooth" });
      setTimeout(() => { isNavigatingRef.current = false; }, 1000);
    } else {
      isNavigatingRef.current = false;
    }
  };

  const toggleGroup = (id: string) =>
    setExpandedGroups((p) => {
      const s = new Set(p);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Search: highlight matching nav items
  const matchesSearch = (label: string) =>
    searchQuery.trim()
      ? label.toLowerCase().includes(searchQuery.toLowerCase())
      : false;

  // Prev / Next
  const currentIdx = FLAT_SECTIONS.findIndex((s) => s.id === activeSection);
  const prevPage = currentIdx > 0 ? FLAT_SECTIONS[currentIdx - 1] : null;
  const nextPage = currentIdx < FLAT_SECTIONS.length - 1 ? FLAT_SECTIONS[currentIdx + 1] : null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-1 relative">
        {/* ── Left sidebar ─────────────────────────────────────── */}
        <motion.aside
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-64 shrink-0 border-r border-neutral-200 sticky top-0 h-screen overflow-y-auto bg-white z-20"
        >
          <div className="p-5">
            {/* Brand */}
            <div className="mb-5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <FileJson2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900 leading-none">FormSync</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Documentation</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-sm leading-none">×</button>
              )}
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {NAV.map((group) => (
                <div key={group.groupId} className="mb-1">
                  <button
                    onClick={() => toggleGroup(group.groupId)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 group-hover:text-purple-600 transition-colors">
                      <span className="text-neutral-400 group-hover:text-purple-500">{group.icon}</span>
                      {group.title}
                    </div>
                    <motion.div animate={{ rotate: expandedGroups.has(group.groupId) ? 90 : 0 }} transition={{ duration: 0.15 }}>
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedGroups.has(group.groupId) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-2 space-y-0.5 py-1">
                          {group.items.map((item) => {
                            const isActive = activeSection === item.id;
                            const isMatch = matchesSearch(item.label);
                            return (
                              <button
                                key={item.id}
                                onClick={() => scrollTo(item.id)}
                                className={`relative w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                                  isActive
                                    ? "bg-purple-50 text-purple-700 font-semibold"
                                    : isMatch
                                    ? "bg-yellow-50 text-yellow-800 font-medium"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                }`}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="navIndicator"
                                    className="absolute left-0 top-1 bottom-1 w-0.5 bg-purple-600 rounded-r"
                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                  />
                                )}
                                <span className={isActive ? "ml-1" : ""}>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>
        </motion.aside>

        {/* ── Main content ──────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-8 lg:px-14 py-10 max-w-4xl mx-auto w-full">
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>

            {/* Hero */}
            <div className="mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
                <Star className="w-3 h-3" /> v1.0 — Full Documentation
              </div>
              <h1 className="text-4xl font-extrabold text-neutral-900 mb-3 tracking-tight leading-tight">
                FormSync <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Documentation</span>
              </h1>
              <p className="text-base text-neutral-500 leading-relaxed max-w-xl">
                Everything you need to build, validate, and optimise form schemas — from templates and the Monaco editor to AI enhancement and SRS document import.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  { label: "Quick Start", id: "quickstart", icon: <Zap className="w-3.5 h-3.5" /> },
                  { label: "AI Features", id: "ai-suggestions", icon: <Sparkles className="w-3.5 h-3.5" /> },
                  { label: "SRS Import", id: "srs-overview", icon: <FileText className="w-3.5 h-3.5" /> },
                  { label: "Quality Scoring", id: "quality-scoring", icon: <BarChart3 className="w-3.5 h-3.5" /> },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => scrollTo(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all"
                  >
                    {c.icon}{c.label} <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>

            {/* ═══ GETTING STARTED ═════════════════════════════════ */}
            <DocSection id="overview" title="Overview" badge="Getting Started">
              <p className="text-neutral-600 leading-relaxed mb-4">
                FormSync is a web-based platform for creating, validating, and optimising form schemas with AI assistance. It supports multiple input formats (JSON, YAML, XML) and provides real-time quality scoring to ensure your forms meet enterprise standards.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: <FileJson2 className="w-4 h-4 text-indigo-500" />, title: "Schema Editor", desc: "Monaco-powered editor with syntax highlighting and live validation" },
                  { icon: <Layers className="w-4 h-4 text-purple-500" />, title: "Template Builder", desc: "Visual drag-and-drop form builder for non-technical users" },
                  { icon: <Sparkles className="w-4 h-4 text-amber-500" />, title: "AI Enhancement", desc: "Human-in-the-loop AI suggestions for quality improvements" },
                  { icon: <FileText className="w-4 h-4 text-emerald-500" />, title: "SRS Import", desc: "Extract user stories from PDF/DOCX requirements documents" },
                ].map((f) => (
                  <div key={f.title} className="flex gap-3 p-4 rounded-xl border border-neutral-200 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">{f.icon}</div>
                    <div><p className="text-sm font-semibold text-neutral-900">{f.title}</p><p className="text-xs text-neutral-500 mt-0.5">{f.desc}</p></div>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="quickstart" title="Quick Start Guide" badge="Getting Started">
              <Callout type="tip" title="New to FormSync?">Start with a template and run AI Enhancement — you'll have a production-quality schema in under 2 minutes.</Callout>
              <StepList steps={[
                { title: "Register or log in", desc: "Create your account at /register. Your schemas and projects are saved to your profile." },
                { title: "Open the Editor", desc: "Go to /editor. You'll see the Monaco schema editor on the left and the enhancement panel on the right." },
                { title: "Load a template or paste your schema", desc: 'Click the Templates button in the top toolbar, pick a starter template (e.g. "User Registration"), or paste your own JSON/YAML/XML.' },
                { title: "Click Convert", desc: "FormSync parses your input, normalises it to JSON Schema Draft-07, and displays it in the editor." },
                { title: "Run AI Enhancement", desc: "Click Enhance. The AI analyses your schema and returns a list of targeted suggestions." },
                { title: "Apply suggestions", desc: "Review each suggestion in the panel and click Apply or Reject. The quality score updates in real time." },
                { title: "Save to your profile", desc: "Name your schema and click Save. It will appear in My Library → JSON Schemas on your profile page." },
              ]} />
            </DocSection>

            <DocSection id="user-types" title="Supported User Types" badge="Getting Started">
              <div className="space-y-4">
                {[
                  {
                    type: "Non-Technical Users",
                    color: "border-purple-400 bg-purple-50/40",
                    badge: "bg-purple-100 text-purple-700",
                    points: ["Start with pre-built templates", "Use the visual Template Builder", "Accept AI suggestions with one click", "No JSON knowledge required"],
                  },
                  {
                    type: "Technical / Developer Users",
                    color: "border-indigo-400 bg-indigo-50/40",
                    badge: "bg-indigo-100 text-indigo-700",
                    points: ["Write schemas directly in Monaco", "Paste JSON, YAML, or XML", "Import schemas from a URL", "Generate Java Spring Boot boilerplate"],
                  },
                  {
                    type: "Business Analysts",
                    color: "border-emerald-400 bg-emerald-50/40",
                    badge: "bg-emerald-100 text-emerald-700",
                    points: ["Upload SRS documents (PDF/DOCX)", "Review extracted user stories", "Save story collections as Projects", "Generate form schemas per story"],
                  },
                ].map((u) => (
                  <div key={u.type} className={`p-4 rounded-xl border-l-4 ${u.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.badge}`}>{u.type}</span>
                    </div>
                    <ul className="space-y-1">
                      {u.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-neutral-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ═══ CORE FEATURES ═══════════════════════════════════ */}
            <DocSection id="schema-editor" title="Schema Editor" badge="Core Features">
              <p className="text-neutral-600 leading-relaxed mb-4">The Schema Editor is a Monaco-based code editor (the same engine powering VS Code) with real-time syntax validation, multi-format support, and a full undo/redo history.</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {[
                  "Syntax highlighting for JSON, YAML, XML",
                  "50-entry undo/redo history with debouncing",
                  "Real-time format detection",
                  "Schema name validation with inline alert",
                  "AI name suggestion on empty schema",
                  "Load schema by ID from profile",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />{f}
                  </div>
                ))}
              </div>
              <Callout type="info" title="Schema Name Required">You must enter a schema name before running Validate or Convert. If you forget, a popup will guide you to the name field with an animated highlight.</Callout>
              <CodeBlock code={`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User Registration",
  "type": "object",
  "required": ["email", "password"],
  "properties": {
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 }
  }
}`} filename="starter.json" language="json" copyCode={copyCode} copiedCode={copiedCode} />
            </DocSection>

            <DocSection id="templates" title="Template Builder" badge="Core Features">
              <p className="text-neutral-600 leading-relaxed mb-4">The Template Builder tab in the editor offers a visual drag-and-drop interface. Fields are added by type and configure themselves automatically.</p>
              <StepList steps={[
                { title: "Switch to Template Builder", desc: 'Click the "Template Builder" tab at the top of the editor page.' },
                { title: "Add fields", desc: "Use the field palette on the right to drag text, number, email, password, date, and select fields into the canvas." },
                { title: "Configure each field", desc: "Click a field to open its settings: label, placeholder, required toggle, validation rules." },
                { title: "Transfer to Schema Editor", desc: 'Click "Use in Editor" to convert the visual layout to a JSON Schema and load it into the Monaco editor.' },
              ]} />
            </DocSection>

            <DocSection id="formats" title="Input Formats" badge="Core Features">
              <p className="text-neutral-600 leading-relaxed mb-4">FormSync accepts three input formats and normalises them all to JSON Schema Draft-07.</p>
              <div className="space-y-3 mb-5">
                {[
                  { format: "JSON", color: "text-amber-700 bg-amber-50 border-amber-200", desc: "Default. Supports both raw JSON Schema and custom FormSync form definitions.", example: '{ "type": "object", "properties": { ... } }' },
                  { format: "YAML", color: "text-blue-700 bg-blue-50 border-blue-200", desc: "Human-readable. YAML mappings are automatically converted to JSON Schema.", example: "type: object\nproperties:\n  name:\n    type: string" },
                  { format: "XML", color: "text-purple-700 bg-purple-50 border-purple-200", desc: "Enterprise format. XML attributes and elements are mapped to schema properties.", example: '<form><field name="email" type="string" format="email"/></form>' },
                ].map((f) => (
                  <div key={f.format} className="rounded-xl border border-neutral-200 overflow-hidden">
                    <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-neutral-200 ${f.color.split(' ').slice(1).join(' ')}`}>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${f.color}`}>{f.format}</span>
                      <p className="text-xs text-neutral-600">{f.desc}</p>
                    </div>
                    <pre className="bg-neutral-900 px-4 py-3 text-xs text-neutral-200 font-mono overflow-x-auto">{f.example}</pre>
                  </div>
                ))}
              </div>
              <Callout type="tip" title="Auto-detection">FormSync auto-detects the format from your content — you don't need to select it manually before clicking Convert.</Callout>
            </DocSection>

            <DocSection id="form-preview" title="Form Preview" badge="Core Features">
              <p className="text-neutral-600 leading-relaxed mb-4">The Form Preview modal renders a fully interactive HTML form from any JSON Schema Draft-07 in real time. It lets you test how fields look and behave before exporting.</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {[
                  { label: "text / string", mapping: "→ <input type='text'>" },
                  { label: "string + email format", mapping: "→ <input type='email'>" },
                  { label: "string + password format", mapping: "→ <input type='password'>" },
                  { label: "string + date format", mapping: "→ <input type='date'>" },
                  { label: "string + enum", mapping: "→ <select>" },
                  { label: "boolean", mapping: "→ <input type='checkbox'>" },
                  { label: "number / integer", mapping: "→ <input type='number'>" },
                  { label: "x-multiline: true", mapping: "→ <textarea>" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs">
                    <span className="font-mono text-indigo-700">{m.label}</span>
                    <span className="text-neutral-500">{m.mapping}</span>
                  </div>
                ))}
              </div>
              <Callout type="info" title="Preview Only">Submitting the form in preview mode shows a success banner — no data is sent anywhere. It is purely a UI test.</Callout>
            </DocSection>

            {/* ═══ AI FEATURES ═════════════════════════════════════ */}
            <DocSection id="ai-suggestions" title="AI Schema Suggestions" badge="AI Features">
              <p className="text-neutral-600 leading-relaxed mb-4">The AI Enhancement Engine is designed as a <strong>human-in-the-loop</strong> system. AI proposes, you decide. Nothing is applied automatically.</p>
              <div className="space-y-3 mb-5">
                {[
                  { cat: "Validation", color: "bg-red-100 text-red-700", items: ["minLength / maxLength on string fields", "pattern for email, phone, password fields", "minimum / maximum on numeric fields", "enum constraints for fixed-choice fields"] },
                  { cat: "Accessibility", color: "bg-blue-100 text-blue-700", items: ["x-accessibility.label for every user-input field", "x-accessibility.hint (placeholder text)", "description for screen reader context"] },
                  { cat: "Structure", color: "bg-purple-100 text-purple-700", items: ["Adding missing $schema declaration", "required array for mandatory fields", "Nested object property completeness"] },
                  { cat: "Metadata", color: "bg-amber-100 text-amber-700", items: ["title and description at root level", "examples array per field", "x-formsync-metadata provenance"] },
                ].map((c) => (
                  <div key={c.cat} className="rounded-xl border border-neutral-200 p-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c.color} mb-3 inline-block`}>{c.cat}</span>
                    <ul className="space-y-1">
                      {c.items.map((i) => <li key={i} className="flex items-center gap-2 text-sm text-neutral-700"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <Callout type="warning" title="Enhancement Limit">Each schema can be enhanced by AI up to 2 times. After that, the Enhance button is disabled for that schema to prevent over-processing.</Callout>
            </DocSection>

            <DocSection id="apply-undo" title="Applying & Undoing Suggestions" badge="AI Features">
              <p className="text-neutral-600 leading-relaxed mb-4">Every suggestion is a precise, reversible patch — it adds only what is missing and never overwrites your existing values.</p>
              <StepList steps={[
                { title: "Review the suggestion", desc: "Each card shows the field path, category badge, estimated impact score (1–5), and a human-readable description of the change." },
                { title: "Click Apply", desc: "The suggestion's rule is deep-merged into your schema at the exact path. Arrays (like examples) are concatenated and deduplicated." },
                { title: "Quality score updates", desc: "The score recalculates immediately, showing the delta (+N pts) for that suggestion." },
                { title: "Click Undo", desc: "Only the keys introduced by that suggestion are removed. Your own values are never touched." },
              ]} />
              <Callout type="tip" title="Safe Merge Guarantee">If a field already has a <code className="text-xs bg-neutral-100 px-1 rounded">minLength</code>, the validation suggestion that would add it is automatically filtered out before reaching you.</Callout>
            </DocSection>

            <DocSection id="quality-scoring" title="Schema Quality Scoring" badge="AI Features">
              <p className="text-neutral-600 leading-relaxed mb-5">Quality is measured across 5 independent dimensions for a total of 100 points. Scores recalculate deterministically every time you apply or undo a suggestion.</p>
              <div className="space-y-3 mb-6">
                {[
                  { name: "Structural Completeness", pct: 25, color: "from-indigo-400 to-indigo-600", desc: "Root type=object, properties exist, nested objects/arrays are complete." },
                  { name: "Validation Coverage", pct: 25, color: "from-purple-400 to-purple-600", desc: "% of fields that have at least one validation rule (pattern, format, min/max, enum…)." },
                  { name: "Accessibility & Metadata", pct: 20, color: "from-blue-400 to-blue-600", desc: "Descriptions, titles, and x-accessibility labels on all user-input fields." },
                  { name: "Consistency & Safety", pct: 20, color: "from-emerald-400 to-emerald-600", desc: "No type mismatches, invalid required references, or contradictory constraints." },
                  { name: "Enhancement Impact", pct: 10, color: "from-amber-400 to-amber-500", desc: "Ratio of AI suggestions applied plus auto-fixes performed." },
                ].map((d) => (
                  <div key={d.name} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-neutral-900">{d.name}</p>
                      <span className="text-xs font-bold text-neutral-600">{d.pct} pts</span>
                    </div>
                    <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${d.pct * 4}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className={`h-full bg-gradient-to-r ${d.color} rounded-full`}
                      />
                    </div>
                    <p className="text-xs text-neutral-500">{d.desc}</p>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { range: "< 50", label: "Needs Work", color: "bg-red-50 border-red-200 text-red-700" },
                  { range: "50–79", label: "Good", color: "bg-amber-50 border-amber-200 text-amber-700" },
                  { range: "80+", label: "Excellent", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                ].map((r) => (
                  <div key={r.range} className={`flex flex-col items-center py-3 rounded-xl border text-sm font-bold ${r.color}`}>
                    <span className="text-lg">{r.range}</span>
                    <span className="text-xs mt-0.5 opacity-70">{r.label}</span>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="suggest-name" title="AI Name Suggestions" badge="AI Features">
              <p className="text-neutral-600 leading-relaxed mb-4">If you run AI Enhancement or Convert without entering a schema name, FormSync can auto-suggest one based on the fields in your schema.</p>
              <StepList steps={[
                { title: "Trigger the suggestion", desc: "Leave the Schema Name field empty and click Convert or Validate. A popup appears with a highlighted name field." },
                { title: "Click Suggest Name", desc: 'FormSync sends your schema to the AI and returns 1\u20133 candidate names (e.g. \u201cUserRegistration\u201d, \u201cProductCatalog\u201d).' },
                { title: "Accept with one click", desc: "Click a suggestion chip to fill the field instantly. You can then edit it further." },
              ]} />
            </DocSection>

            {/* ═══ SRS IMPORT ══════════════════════════════════════ */}
            <DocSection id="srs-overview" title="What is SRS Import?" badge="SRS Import">
              <p className="text-neutral-600 leading-relaxed mb-4">
                The SRS (Software Requirements Specification) import feature lets you upload a PDF or DOCX requirements document and automatically extract structured user stories using AI. Each story includes suggested form fields, acceptance criteria, and a confidence score.
              </p>
              <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Example output for "User Registration" story</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Role: user · Action: register with email · Benefit: access the platform · Fields: email, password, name · Confidence: 92%</p>
                </div>
              </div>
              <Callout type="info" title="Supported file types">PDF (via pdf-parse), DOCX (via Mammoth), and plain .txt files are all supported. Maximum file size is 20 MB.</Callout>
            </DocSection>

            <DocSection id="srs-upload" title="Uploading Documents" badge="SRS Import">
              <StepList steps={[
                { title: "Go to your Profile", desc: "Navigate to /profile. Switch to the Projects tab and click Import SRS." },
                { title: "Choose upload method", desc: 'Switch between "Upload File" (drag-and-drop PDF/DOCX) and "Paste Text" (paste SRS content directly into the textarea).' },
                { title: "Enter a project name", desc: 'The project name groups all extracted stories together. Choose something descriptive like \u201cE-Commerce MVP\u201d.' },
                { title: "Click Extract Stories", desc: "FormSync uploads the file, sends the text to the AI in chunks, and returns a list of structured user stories." },
                { title: "Review the extraction", desc: "A preview step shows all extracted stories with their confidence scores before you proceed." },
              ]} />
              <Callout type="warning" title="Large documents">Documents longer than ~12,000 characters are processed in chunks. Very long documents may take 10–20 seconds. A progress bar is shown during extraction.</Callout>
            </DocSection>

            <DocSection id="srs-stories" title="User Story Selection" badge="SRS Import">
              <p className="text-neutral-600 leading-relaxed mb-4">After extraction, the User Story Selector modal lets you review, filter, and act on each story before saving.</p>
              <div className="space-y-3 mb-5">
                {[
                  { icon: <Search className="w-4 h-4 text-neutral-500" />, title: "Search", desc: "Filter stories by title, feature area, or role using the search bar." },
                  { icon: <BarChart3 className="w-4 h-4 text-neutral-500" />, title: "Confidence Filter", desc: "Use the slider to show only stories with ≥ a minimum confidence score (0–90%)." },
                  { icon: <Eye className="w-4 h-4 text-neutral-500" />, title: "Preview fields", desc: "Click a story to see its suggested form fields, types, and acceptance criteria on the right." },
                  { icon: <Wand2 className="w-4 h-4 text-neutral-500" />, title: "Generate Form", desc: "Click Generate Form to build a JSON Schema from that story's suggested fields and open it in the editor." },
                  { icon: <FolderOpen className="w-4 h-4 text-neutral-500" />, title: "Save All to Projects", desc: "Click Save All to save every story as an SRS Project and navigate directly to the Projects tab." },
                ].map((a) => (
                  <div key={a.title} className="flex gap-3 p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50">
                    <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">{a.icon}</div>
                    <div><p className="text-sm font-semibold text-neutral-900">{a.title}</p><p className="text-xs text-neutral-500 mt-0.5">{a.desc}</p></div>
                  </div>
                ))}
              </div>
              <Callout type="tip" title="Editing stories before saving">In the preview step, you can rename any story title or delete stories you don't need. Only the curated list is saved to your project.</Callout>
            </DocSection>

            <DocSection id="srs-projects" title="Managing Projects" badge="SRS Import">
              <p className="text-neutral-600 leading-relaxed mb-4">Saved SRS projects appear in the Projects tab of your Profile. Each project card shows a progress bar indicating how many stories have had forms generated.</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {[
                  { icon: <Eye className="w-4 h-4 text-purple-500" />, label: "Click a project card", desc: "Opens the Project Detail modal with stats, feature area chips, and the full story list." },
                  { icon: <Wand2 className="w-4 h-4 text-indigo-500" />, label: "Generate Form in Editor", desc: "For draft stories, opens the editor pre-loaded with the story's schema." },
                  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: "Preview Generated Form", desc: "For stories already generated, opens the Form Preview modal directly." },
                  { icon: <XCircle className="w-4 h-4 text-red-500" />, label: "Delete a project", desc: "Hover the card and click the trash icon. A confirmation modal prevents accidental deletion." },
                ].map((a) => (
                  <div key={a.label} className="flex gap-3 p-3 rounded-xl border border-neutral-200">
                    <div className="w-7 h-7 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center flex-shrink-0">{a.icon}</div>
                    <div><p className="text-xs font-semibold text-neutral-900">{a.label}</p><p className="text-xs text-neutral-500 mt-0.5">{a.desc}</p></div>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ═══ VALIDATION ══════════════════════════════════════ */}
            <DocSection id="validation" title="Validation Process" badge="Validation">
              <p className="text-neutral-600 leading-relaxed mb-5">Validation runs in two tiers before AI enhancement can be triggered.</p>
              <div className="space-y-3">
                {[
                  { tier: "Tier 1", title: "Syntax Validation", color: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", items: ["Format mismatch detection", "Line-level error reporting with column info", "Quick-fix for trailing commas, missing braces", "AI fallback for complex syntax errors"] },
                  { tier: "Tier 2", title: "Schema Validation (AJV)", color: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700", items: ["JSON Schema Draft-07 compliance", "Required fields presence check", "Type constraint verification", "Enum value validation"] },
                  { tier: "Tier 3", title: "Accessibility Validation (WCAG)", color: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700", items: ["x-accessibility label presence", "Field description completeness", "Error message field checks"] },
                ].map((t) => (
                  <div key={t.tier} className={`p-4 rounded-xl border ${t.color}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badge}`}>{t.tier}</span>
                      <p className="text-sm font-semibold text-neutral-900">{t.title}</p>
                    </div>
                    <ul className="space-y-1">
                      {t.items.map((i) => <li key={i} className="flex items-center gap-2 text-xs text-neutral-700"><Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="errors" title="Error Detection & Handling" badge="Validation">
              <CodeBlock
                filename="error-example.json"
                language="json"
                code={`// ❌ Common mistake — missing comma
{
  "type": "object"
  "properties": {}
}

// ✅ Fixed
{
  "type": "object",
  "properties": {}
}`}
                copyCode={copyCode}
                copiedCode={copiedCode}
              />
              <div className="space-y-3 mt-5">
                {[
                  { error: "Unexpected token", solution: "Check for missing commas between properties or array items.", severity: "error" },
                  { error: "Type mismatch", solution: "Ensure field types are valid JSON Schema types (string, number, integer, boolean, array, object, null).", severity: "error" },
                  { error: "Invalid required reference", solution: "Every key in the required array must also exist in properties.", severity: "error" },
                  { error: "Missing $schema", solution: "Add \"$schema\": \"http://json-schema.org/draft-07/schema#\" at the root. This is a warning, not an error.", severity: "warning" },
                ].map((e) => (
                  <div key={e.error} className={`flex items-start gap-3 p-3.5 rounded-xl border ${e.severity === "error" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                    {e.severity === "error"
                      ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{e.error}</p>
                      <p className="text-xs text-neutral-600 mt-0.5">{e.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="best-practices" title="Best Practices" badge="Validation">
              <div className="space-y-3">
                {[
                  { icon: "1", title: "Start with a template", desc: "Templates are pre-validated and include common fields. They save time and avoid basic structure errors." },
                  { icon: "2", title: "Validate before enhancing", desc: "Run Validate first. Fixing syntax errors before running AI enhancement gives cleaner, more targeted suggestions." },
                  { icon: "3", title: "Apply accessibility suggestions", desc: "Forms used publicly or in regulated industries should always have labels and descriptions. The WCAG score measures this." },
                  { icon: "4", title: "Use consistent naming", desc: "Use camelCase for property keys (e.g. firstName, emailAddress). The AI consistency checker flags mixed conventions." },
                  { icon: "5", title: "Target 80+ quality score", desc: "Schemas scoring 80+ are considered production-ready. Scores above 85 indicate excellent coverage." },
                ].map((b) => (
                  <div key={b.icon} className="flex gap-3 p-4 rounded-xl border border-neutral-200 hover:border-purple-200 hover:bg-purple-50/20 transition-all">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{b.icon}</span>
                    <div><p className="text-sm font-semibold text-neutral-900">{b.title}</p><p className="text-xs text-neutral-500 mt-0.5">{b.desc}</p></div>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ═══ EXPORT & INTEGRATION ════════════════════════════ */}
            <DocSection id="export" title="Exporting Schemas" badge="Export">
              <p className="text-neutral-600 leading-relaxed mb-4">After enhancement, copy the final JSON from the output panel or download it directly. FormSync outputs valid JSON Schema Draft-07.</p>
              <CodeBlock
                filename="user-form.schema.json"
                language="json"
                code={`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User Registration",
  "description": "Sign-up form for new users",
  "type": "object",
  "required": ["email", "password", "name"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 80,
      "description": "User's full name",
      "x-accessibility": { "label": "Full Name", "hint": "Enter your full name" }
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "User's email address",
      "x-accessibility": { "label": "Email Address", "hint": "e.g. you@example.com" }
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
      "x-accessibility": { "label": "Password", "hint": "Min 8 chars, uppercase, lowercase, number" }
    }
  }
}`}
                copyCode={copyCode}
                copiedCode={copiedCode}
              />
            </DocSection>

            <DocSection id="integration" title="External Systems" badge="Export">
              <p className="text-neutral-600 leading-relaxed mb-4">FormSync schemas are standard JSON Schema Draft-07 and work out-of-the-box with many popular libraries.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: "React Hook Form", lang: "React", desc: "Use with @hookform/resolvers/ajv for client-side validation." },
                  { name: "Ajv", lang: "Node.js", desc: "Compile and validate API request bodies server-side." },
                  { name: "Pydantic (v2)", lang: "Python", desc: "Generate Pydantic models from the schema using datamodel-code-generator." },
                  { name: "Spring Validation", lang: "Java", desc: "Use the built-in Backend DTO Generator to produce annotated Java classes." },
                  { name: "Mongoose / Zod", lang: "TypeScript", desc: "Convert with zod-to-json-schema or json-schema-to-zod." },
                  { name: "OpenAPI 3.0", lang: "API Spec", desc: "Embed the schema in the components/schemas section of an OpenAPI document." },
                ].map((l) => (
                  <div key={l.name} className="p-3.5 rounded-xl border border-neutral-200 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-neutral-900">{l.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500 font-mono">{l.lang}</span>
                    </div>
                    <p className="text-xs text-neutral-500">{l.desc}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="code-gen" title="Code Generation" badge="Export">
              <p className="text-neutral-600 leading-relaxed mb-4">Beyond exporting the schema, FormSync can generate framework boilerplate directly from your schema.</p>
              <div className="space-y-3">
                {[
                  { engine: "Backend DTO Generator", icon: <Terminal className="w-4 h-4 text-blue-500" />, desc: "Generates Java Spring Boot: Entity, Repository, Service, Controller, and pom.xml — all from your JSON Schema.", route: "/dto" },
                  { engine: "Runtime Binding Engine", icon: <Code2 className="w-4 h-4 text-cyan-500" />, desc: "Generates a Spring Boot REST API skeleton with OpenAPI spec.", route: "/runtime" },
                ].map((g) => (
                  <div key={g.engine} className="flex gap-3 p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
                    <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">{g.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{g.engine}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{g.desc}</p>
                      <span className="text-[10px] font-mono text-indigo-600 mt-1 inline-block">{g.route}/*</span>
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ═══ PROFILE ═════════════════════════════════════════ */}
            <DocSection id="profile-overview" title="Profile Page" badge="Profile & Projects">
              <p className="text-neutral-600 leading-relaxed mb-4">Your profile page at <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded font-mono">/profile</code> is the central hub for everything you've saved in FormSync.</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {[
                  { icon: <User className="w-4 h-4 text-indigo-500" />, title: "Personal Info", desc: "Edit your display name and email address inline." },
                  { icon: <ShieldCheck className="w-4 h-4 text-purple-500" />, title: "Security", desc: "Change your password from the collapsible Security section." },
                  { icon: <FileJson2 className="w-4 h-4 text-blue-500" />, title: "JSON Schemas", desc: "All schemas saved from the editor, with status badges and quick-open links." },
                  { icon: <FolderOpen className="w-4 h-4 text-emerald-500" />, title: "SRS Projects", desc: "All saved projects with progress bars and story counts." },
                ].map((c) => (
                  <div key={c.title} className="flex gap-3 p-3.5 rounded-xl border border-neutral-200">
                    <div className="w-7 h-7 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center flex-shrink-0">{c.icon}</div>
                    <div><p className="text-xs font-semibold text-neutral-900">{c.title}</p><p className="text-xs text-neutral-500 mt-0.5">{c.desc}</p></div>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="managing-schemas" title="Managing Schemas" badge="Profile & Projects">
              <StepList steps={[
                { title: "Open a schema", desc: 'Click "Open →" on any schema card to load it into the editor with its full history.' },
                { title: "Delete a schema", desc: "Hover the card and click the trash icon. A confirmation modal will ask you to confirm before deleting." },
                { title: "View schema status", desc: "Each card has a status badge: Draft, Validated, Enhanced, or Published." },
              ]} />
              <Callout type="warning" title="Deletion is permanent">Deleted schemas cannot be recovered. There is no recycle bin. Make sure you export a copy before deleting.</Callout>
            </DocSection>

            <DocSection id="srs-projects-mgmt" title="SRS Projects" badge="Profile & Projects">
              <p className="text-neutral-600 leading-relaxed mb-4">Each SRS project groups related user stories together. The project card shows a generation progress bar tracking how many stories have been converted to forms.</p>
              <StepList steps={[
                { title: "Click a project card", desc: "Opens the Project Detail modal showing stats (Total / Generated / Pending), a progress bar, feature area chips, and the full story list." },
                { title: "Select a story", desc: "Click any story in the left column to see its full details on the right: user story statement, form fields, and acceptance criteria." },
                { title: "Generate or Preview", desc: "Draft stories show a \"Generate Form in Editor\" button. Generated stories show \"Preview Generated Form\"." },
                { title: "Delete a project", desc: "Hover the project card and click the trash icon. A confirmation modal prevents accidental deletion." },
              ]} />
            </DocSection>

            {/* ═══ HELP ════════════════════════════════════════════ */}
            <DocSection id="faqs" title="Frequently Asked Questions" badge="Help">
              <div className="space-y-3">
                {[
                  { q: "Do I need coding knowledge to use FormSync?", a: "No. Non-technical users can start with templates and the visual Template Builder, then use AI suggestions without ever writing JSON." },
                  { q: "What quality score should I target?", a: "Aim for 80 or higher. Scores above 85 indicate excellent schema quality and are considered production-ready." },
                  { q: "Can I undo all AI changes at once?", a: "You can undo suggestions one at a time. Each undo is deterministic and removes only the keys that suggestion introduced. Bulk undo (\"Undo All\") applies all reversals in order." },
                  { q: "Are my schemas saved automatically?", a: "No. You must explicitly click Save from the editor toolbar. Unsaved work will be lost on page refresh." },
                  { q: "What file types does SRS Import support?", a: "PDF (.pdf), Word documents (.docx), and plain text (.txt) up to 20 MB." },
                  { q: "Can I use FormSync schemas with my existing codebase?", a: "Yes. FormSync outputs standard JSON Schema Draft-07, which is compatible with AJV, React Hook Form, Pydantic, Ajv, and most modern validation libraries." },
                  { q: "Why does the Enhance button get disabled after 2 uses?", a: "Each AI enhancement is counted against the schema. The limit of 2 prevents over-enhancement and cost runaway. You can still apply and undo the suggestions you already have." },
                ].map((faq) => <FaqItem key={faq.q} question={faq.q} answer={faq.a} />)}
              </div>
            </DocSection>

            <DocSection id="common-errors" title="Common Errors" badge="Help">
              <div className="space-y-3">
                {[
                  { error: "\"No file uploaded\" on SRS Import", solution: "Ensure you are selecting a PDF, DOCX, or TXT file. The file field name must be 'file' in the multipart form." },
                  { error: "Schema saves with 500 error", solution: "The SRS tables may not exist in the database on a new machine. Run: npx prisma migrate deploy inside services/user-management-service." },
                  { error: "Suggestions panel is empty after Enhance", solution: "All AI suggestions may have been filtered out because your schema already has all required properties. Check the quality breakdown for which dimensions are already at maximum." },
                  { error: "Form Preview shows no fields", solution: "The schema must have type: 'object' with a non-empty properties map. Ensure your conversion step completed successfully." },
                  { error: "Quality score does not change after applying suggestion", solution: "The suggestion may target a dimension that is already at its maximum. Check the per-dimension breakdown in the Quality panel." },
                ].map((e) => (
                  <div key={e.error} className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                    <p className="text-sm font-semibold text-red-900 mb-1 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />{e.error}</p>
                    <p className="text-xs text-neutral-700 ml-6">{e.solution}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="shortcuts" title="Keyboard Shortcuts" badge="Help">
              <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Editor Shortcuts</p>
                </div>
                <div className="divide-y divide-neutral-100">
                  {[
                    { keys: ["Ctrl", "Z"], action: "Undo last schema edit" },
                    { keys: ["Ctrl", "Shift", "Z"], action: "Redo" },
                    { keys: ["Ctrl", "S"], action: "Save schema to profile" },
                    { keys: ["Ctrl", "/"], action: "Toggle line comment (Monaco)" },
                    { keys: ["Alt", "Shift", "F"], action: "Format / pretty-print JSON (Monaco)" },
                    { keys: ["Ctrl", "F"], action: "Find in editor (Monaco)" },
                    { keys: ["Escape"], action: "Close any open modal" },
                  ].map((s) => (
                    <div key={s.action} className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 transition-colors">
                      <span className="text-sm text-neutral-700">{s.action}</span>
                      <div className="flex items-center gap-1">
                        {s.keys.map((k) => (
                          <kbd key={k} className="px-2 py-0.5 text-xs font-mono bg-white border border-neutral-300 rounded-md text-neutral-700 shadow-sm">{k}</kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DocSection>

            <DocSection id="limitations" title="Limitations" badge="Help">
              <div className="space-y-2">
                {[
                  { type: "warning", text: "AI enhancement requires an active internet connection and a configured OpenAI-compatible API key on the server." },
                  { type: "warning", text: "Each schema can be AI-enhanced a maximum of 2 times." },
                  { type: "info", text: "SRS documents longer than ~12,000 characters are truncated to the first chunk. Very large specification documents may lose later sections." },
                  { type: "info", text: "Suggestion state (applied / pending) is stored in browser memory. Refreshing the page before saving will lose your session's suggestion selections." },
                  { type: "info", text: "The WCAG validator performs structural checks only. It does not render or visually inspect forms." },
                  { type: "info", text: "JSON Schema Draft 2020-12 is not yet supported. All output targets Draft-07." },
                ].map((l, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${l.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-neutral-50 border-neutral-200 text-neutral-700"}`}>
                    {l.type === "warning"
                      ? <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      : <Info className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                    }
                    {l.text}
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ── Prev / Next navigation ────────────────────────── */}
            <div className="flex items-center justify-between mt-16 pt-8 border-t border-neutral-200">
              {prevPage ? (
                <button
                  onClick={() => scrollTo(prevPage.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <div className="text-left">
                    <p className="text-[10px] text-neutral-400 font-normal">Previous</p>
                    <p>{prevPage.label}</p>
                  </div>
                </button>
              ) : <div />}
              {nextPage ? (
                <button
                  onClick={() => scrollTo(nextPage.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all group ml-auto"
                >
                  <div className="text-right">
                    <p className="text-[10px] text-neutral-400 font-normal">Next</p>
                    <p>{nextPage.label}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              ) : <div />}
            </div>

          </motion.div>
        </main>

        {/* ── Right TOC sidebar ─────────────────────────────────── */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-neutral-200 bg-white">
          <div className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">On this page</p>
            <nav className="space-y-0.5">
              {NAV.flatMap((g) => g.items).map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                      isActive
                        ? "text-purple-700 font-semibold bg-purple-50"
                        : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
};

/* ── Missing import ──────────────────────────────────────────── */
const User: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════════════ */
const DocSection: React.FC<{ id: string; title: string; badge?: string; children: React.ReactNode }> = ({ id, title, badge, children }) => (
  <motion.section
    id={id}
    className="mb-14 scroll-mt-24"
    initial={{ y: 16, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.4 }}
  >
    {badge && (
      <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-2">{badge}</p>
    )}
    <h2 className="text-2xl font-bold text-neutral-900 mb-5 pb-3 border-b border-neutral-200">{title}</h2>
    <div className="space-y-5">{children}</div>
  </motion.section>
);

const Callout: React.FC<{ type: "info" | "warning" | "tip" | "danger"; title: string; children: React.ReactNode }> = ({ type, title, children }) => {
  const map = {
    info:    { border: "border-blue-200",   bg: "bg-blue-50",   icon: <Info className="w-4 h-4 text-blue-500" />,         title: "text-blue-900",   body: "text-blue-800" },
    warning: { border: "border-amber-200",  bg: "bg-amber-50",  icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, title: "text-amber-900",  body: "text-amber-800" },
    tip:     { border: "border-emerald-200",bg: "bg-emerald-50",icon: <Lightbulb className="w-4 h-4 text-emerald-500" />,  title: "text-emerald-900",body: "text-emerald-800" },
    danger:  { border: "border-red-200",    bg: "bg-red-50",    icon: <XCircle className="w-4 h-4 text-red-500" />,        title: "text-red-900",    body: "text-red-800" },
  };
  const s = map[type];
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${s.border} ${s.bg} my-4`}>
      <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
      <div>
        <p className={`text-sm font-bold ${s.title} mb-0.5`}>{title}</p>
        <div className={`text-sm ${s.body} leading-relaxed`}>{children}</div>
      </div>
    </div>
  );
};

const StepList: React.FC<{ steps: { title: string; desc: string }[] }> = ({ steps }) => (
  <ol className="space-y-4 relative">
    <div className="absolute left-[13px] top-6 bottom-6 w-px bg-neutral-200" />
    {steps.map((step, i) => (
      <motion.li
        key={i}
        initial={{ x: -8, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.06 }}
        className="flex gap-4 relative"
      >
        <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 z-10 shadow-sm shadow-purple-200">{i + 1}</span>
        <div className="pb-1">
          <p className="text-sm font-semibold text-neutral-900">{step.title}</p>
          <p className="text-sm text-neutral-500 mt-0.5 leading-relaxed">{step.desc}</p>
        </div>
      </motion.li>
    ))}
  </ol>
);

const CodeBlock: React.FC<{ language: string; code: string; filename?: string; copyCode: (c: string) => void; copiedCode: string | null }> = ({ code, filename, copyCode, copiedCode }) => {
  const isCopied = copiedCode === code;
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 my-4 group">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
          <span className="text-xs font-mono text-neutral-400">{filename}</span>
          <button onClick={() => copyCode(code)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
            {isCopied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy className="w-3.5 h-3.5" />Copy</>}
          </button>
        </div>
      )}
      <div className="relative bg-neutral-900">
        {!filename && (
          <button onClick={() => copyCode(code)} className="absolute top-3 right-3 p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md opacity-0 group-hover:opacity-100 transition-all">
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
          </button>
        )}
        <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
          <code className="text-neutral-100 font-mono text-xs">{code}</code>
        </pre>
      </div>
    </div>
  );
};

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors text-left gap-3"
      >
        <span className="text-sm font-semibold text-neutral-900">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
