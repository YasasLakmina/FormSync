import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X,
  ChevronRight,
  Wand2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
  Tag,
  Layout,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { ParseSrsResponse, ExtractedUserStory } from "../api/schemaApi";
import { projectApi } from "../api/projectApi";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────── */
interface Props {
  result: ParseSrsResponse;
  projectName: string;
  token: string;
  onClose: () => void;
  onProjectSaved: (projectId: string) => void;
  /** When provided the modal injects the schema directly into the editor instead of navigating */
  onSchemaGenerated?: (schemaJson: string, storyTitle: string) => void;
}

/* ─── Feature area accent colours ───────────────────────── */
const AREA_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Authentication:  { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    dot: "bg-blue-400" },
  Registration:    { bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700",  dot: "bg-indigo-400" },
  Profile:         { bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  dot: "bg-purple-400" },
  Search:          { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    dot: "bg-cyan-400" },
  Checkout:        { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   dot: "bg-amber-400" },
  Payment:         { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-400" },
  Dashboard:       { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  dot: "bg-violet-400" },
  Notifications:   { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  dot: "bg-orange-400" },
  Settings:        { bg: "bg-neutral-50", border: "border-neutral-200", text: "text-neutral-700", dot: "bg-neutral-400" },
};
const defaultArea = { bg: "bg-neutral-50", border: "border-neutral-200", text: "text-neutral-600", dot: "bg-neutral-400" };
const areaStyle = (a: string) => AREA_COLORS[a] ?? defaultArea;

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export const UserStorySelectorModal: React.FC<Props> = ({
  result,
  projectName,
  token,
  onClose,
  onProjectSaved,
  onSchemaGenerated,
}) => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);

  /* ── Group stories by feature area ─────────────────── */
  const filtered = result.userStories.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.featureArea.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce<Record<string, ExtractedUserStory[]>>((acc, s) => {
    const area = s.featureArea || "General";
    if (!acc[area]) acc[area] = [];
    acc[area].push(s);
    return acc;
  }, {});

  const selected = result.userStories.find((s) => s.id === selectedId);

  /* ── Save project to backend ─────────────────────────── */
  const saveProject = async (): Promise<string | null> => {
    if (savedProjectId) return savedProjectId;
    if (!token) {
      toast.error("You must be logged in to save a project.");
      return null;
    }
    try {
      const res = await projectApi.create(token, {
        name: projectName,
        userStories: result.userStories,
      });
      setSavedProjectId(res.data.id);
      onProjectSaved(res.data.id);
      return res.data.id;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Unknown error";
      toast.error(`Save failed: ${msg}`);
      return null;
    }
  };

  /* ── Generate form from selected story ────────────────── */
  const handleGenerate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // Save project first (errors are shown by saveProject itself)
      await saveProject();

      // Build a JSON Schema from suggested fields
      const properties: Record<string, any> = {};
      const required: string[] = [];

      (selected.suggestedFields ?? []).forEach((f: any) => {
        const prop: any = { type: f.type };
        if (f.format) prop.format = f.format;
        if (f.label) prop["x-accessibility"] = { label: f.label, hint: f.placeholder ?? "" };
        if (f.placeholder) prop.examples = [f.placeholder];
        if (f.validationHint) prop.description = f.validationHint;
        properties[f.name] = prop;
        if (f.required) required.push(f.name);
      });

      const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: selected.title,
        description: `As a ${selected.role}, I want to ${selected.action}, so that ${selected.benefit}.`,
        type: "object",
        properties,
        ...(required.length ? { required } : {}),
        "x-formsync-metadata": {
          source: "srs-import",
          featureArea: selected.featureArea,
          acceptanceCriteria: selected.acceptanceCriteria,
        },
      };

      const schemaJson = JSON.stringify(schema, null, 2);

      if (onSchemaGenerated) {
        // Inline mode: inject directly into the editor that hosts this modal
        onSchemaGenerated(schemaJson, selected.title);
      } else {
        // Standalone mode: bridge via sessionStorage and navigate
        sessionStorage.setItem("srs_preload_schema", schemaJson);
        navigate("/editor?fromSrs=1");
      }
      toast.success(`"${selected.title}" loaded into editor`);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const pid = await saveProject();
      if (pid) {
        toast.success(`Project "${projectName}" saved with ${result.totalFound} stories`);
        onClose();
      } else {
        toast.error("Failed to save project");
      }
    } finally {
      setSaving(false);
    }
  };

  const confidenceBadge = (c: number) =>
    c >= 0.85
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : c >= 0.6
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-200/60 flex-shrink-0">
              <Layout className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-neutral-900 text-base leading-tight truncate">
                {projectName}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {result.totalFound} user {result.totalFound === 1 ? "story" : "stories"} extracted — select one to generate a form
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-neutral-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories by title, area or role…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Story list */}
          <div className="w-[55%] border-r border-neutral-100 overflow-y-auto p-3 space-y-3">
            {Object.keys(grouped).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-neutral-300 mb-3" />
                <p className="text-sm font-semibold text-neutral-700">No stories match</p>
                <p className="text-xs text-neutral-400">Try a different search term</p>
              </div>
            ) : (
              Object.entries(grouped).map(([area, stories]) => {
                const ac = areaStyle(area);
                return (
                  <div key={area}>
                    {/* Area group header */}
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className={`w-2 h-2 rounded-full ${ac.dot}`} />
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{area}</span>
                      <span className="text-xs text-neutral-400">({stories.length})</span>
                    </div>

                    <div className="space-y-1.5">
                      {stories.map((story) => {
                        const isSelected = selectedId === story.id;
                        const isExpanded = expandedId === story.id;
                        return (
                          <div
                            key={story.id}
                            className={`rounded-xl border transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-purple-300 bg-purple-50/60 shadow-sm shadow-purple-100"
                                : "border-neutral-200/70 bg-neutral-50/60 hover:border-purple-200 hover:bg-white"
                            }`}
                            onClick={() => setSelectedId(isSelected ? null : story.id)}
                          >
                            <div className="flex items-start gap-2.5 p-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                isSelected ? "border-purple-500 bg-purple-500" : "border-neutral-300"
                              }`}>
                                {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-neutral-900 truncate">{story.title}</p>
                                <p className="text-xs text-neutral-400 truncate">
                                  {story.suggestedFields?.length ?? 0} fields · {story.role}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-bold ${confidenceBadge(story.confidence)}`}>
                                  {Math.round(story.confidence * 100)}%
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : story.id); }}
                                  className="text-neutral-300 hover:text-neutral-500 transition-colors"
                                >
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>

                            {/* Expandable detail */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden border-t border-neutral-100"
                                >
                                  <div className="px-3 pb-3 pt-2 space-y-2">
                                    <p className="text-xs text-neutral-600 italic">
                                      "{story.rawText || `As a ${story.role}, I want to ${story.action}.`}"
                                    </p>
                                    {story.acceptanceCriteria?.length > 0 && (
                                      <div>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Acceptance Criteria</p>
                                        <ul className="space-y-0.5">
                                          {story.acceptanceCriteria.slice(0, 3).map((c, i) => (
                                            <li key={i} className="flex items-start gap-1 text-xs text-neutral-500">
                                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                                              {c}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Preview pane */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {/* Story details */}
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold mb-2 ${areaStyle(selected.featureArea).bg} ${areaStyle(selected.featureArea).border} ${areaStyle(selected.featureArea).text}`}>
                      <Tag className="w-3 h-3" />
                      {selected.featureArea}
                    </div>
                    <h3 className="font-bold text-neutral-900 text-sm">{selected.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      As a <strong>{selected.role}</strong>, I want to {selected.action}, so that {selected.benefit}.
                    </p>
                  </div>

                  {/* Fields preview */}
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Form fields ({selected.suggestedFields?.length ?? 0})
                    </p>
                    <div className="space-y-1.5">
                      {(selected.suggestedFields ?? []).map((f: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-2.5 py-2 bg-neutral-50 border border-neutral-200/70 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-neutral-800 flex-1">{f.label || f.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{f.type}{f.format ? `/${f.format}` : ""}</span>
                          {f.required && (
                            <span className="text-[10px] text-red-500 font-bold">*</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acceptance criteria */}
                  {selected.acceptanceCriteria?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                        Acceptance Criteria
                      </p>
                      <ul className="space-y-1">
                        {selected.acceptanceCriteria.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-neutral-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    {saving ? "Generating…" : "Generate Form"}
                    {!saving && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-neutral-300" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-700">Select a user story</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-[160px]">
                    Click any story to preview its fields and generate a form
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-neutral-400">
            All stories are saved to your Projects dashboard
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              Save All to Projects
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
