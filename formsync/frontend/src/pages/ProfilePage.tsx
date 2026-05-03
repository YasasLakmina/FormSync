import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { schemaApi } from "../api/schemaApi";
import { projectApi, SrsProject, StoredUserStory } from "../api/projectApi";
import { ParseSrsResponse } from "../api/schemaApi";
import { SrsUploadModal } from "../components/SrsUploadModal";
import { UserStorySelectorModal } from "../components/UserStorySelectorModal";
import { FormPreviewModal } from "../components/FormPreviewModal";
import { toast } from "sonner";
import {
  FileJson2,
  LogOut,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  User,
  Mail,
  KeyRound,
  Pencil,
  X,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronDown,
  FolderOpen,
  Upload,
  Wand2,
  FileText,
  AlertTriangle,
  Tag,
  ChevronRight,
  Layers,
  BarChart3,
} from "lucide-react";

const SCHEMA_API_URL = import.meta.env.VITE_API_URL || "";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.38 } }),
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/* ─── Colour maps ────────────────────────────────────────── */
const AREA_DOT_COLORS: Record<string, string> = {
  Authentication: "bg-blue-400",
  Registration:   "bg-indigo-400",
  Profile:        "bg-purple-400",
  Search:         "bg-cyan-400",
  Checkout:       "bg-amber-400",
  Payment:        "bg-emerald-400",
  Dashboard:      "bg-violet-400",
};
const AREA_BADGE: Record<string, string> = {
  Authentication: "bg-blue-50 text-blue-700 border-blue-200",
  Registration:   "bg-indigo-50 text-indigo-700 border-indigo-200",
  Profile:        "bg-purple-50 text-purple-700 border-purple-200",
  Search:         "bg-cyan-50 text-cyan-700 border-cyan-200",
  Checkout:       "bg-amber-50 text-amber-700 border-amber-200",
  Payment:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  Dashboard:      "bg-violet-50 text-violet-700 border-violet-200",
};
const areaBadge = (a: string) => AREA_BADGE[a] ?? "bg-neutral-50 text-neutral-600 border-neutral-200";

/* ─── Schema builder helper ──────────────────────────────── */
function buildStorySchema(story: any): string {
  const properties: Record<string, any> = {};
  const required: string[] = [];
  (story.suggestedFields ?? []).forEach((f: any) => {
    const prop: any = { type: f.type };
    if (f.format) prop.format = f.format;
    if (f.label) prop["x-accessibility"] = { label: f.label, hint: f.placeholder ?? "" };
    if (f.placeholder) prop.examples = [f.placeholder];
    if (f.validationHint) prop.description = f.validationHint;
    properties[f.name] = prop;
    if (f.required) required.push(f.name);
  });
  return JSON.stringify({
    $schema: "http://json-schema.org/draft-07/schema#",
    title: story.title,
    description: `As a ${story.role}, I want to ${story.action}, so that ${story.benefit}.`,
    type: "object",
    properties,
    ...(required.length ? { required } : {}),
    "x-formsync-metadata": { source: "srs-import", featureArea: story.featureArea, acceptanceCriteria: story.acceptanceCriteria },
  }, null, 2);
}

/* ═══════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
══════════════════════════════════════════════════════════════ */
const DeleteConfirmModal: React.FC<{
  itemName: string;
  itemType: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ itemName, itemType, onConfirm, onCancel }) => (
  <motion.div
    key="delete-backdrop"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70] flex items-center justify-center p-4"
    onClick={(e) => e.target === e.currentTarget && onCancel()}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-neutral-200/80"
    >
      <div className="h-1 w-full bg-gradient-to-r from-red-400 via-rose-400 to-pink-400" />
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-neutral-900 leading-tight">Delete {itemType}?</h3>
            <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
              <span className="font-semibold text-neutral-700">"{itemName}"</span> will be permanently deleted. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-sm shadow-red-200 transition-all hover:-translate-y-0.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════
   PROJECT DETAIL MODAL
══════════════════════════════════════════════════════════════ */
const ProjectDetailModal: React.FC<{
  project: SrsProject;
  onClose: () => void;
  onPreviewSchema: (schemaJson: string, title: string) => void;
  onDeleteStory?: (storyId: string) => void;
}> = ({ project, onClose, onPreviewSchema }) => {
  const [selectedStory, setSelectedStory] = useState<StoredUserStory | null>(null);
  const stories = project.userStories ?? [];
  const generated = stories.filter((s) => s.status === "generated").length;
  const areas = [...new Set(stories.map((s) => s.featureArea).filter(Boolean))];
  const pct = stories.length ? Math.round((generated / stories.length) * 100) : 0;

  const confidenceColor = (c: number) =>
    c >= 0.85 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : c >= 0.6 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-500 bg-red-50 border-red-200";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200/80"
      >
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-neutral-100 flex-shrink-0 bg-gradient-to-br from-neutral-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200/60 flex-shrink-0">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-neutral-900 text-lg leading-tight truncate">{project.name}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(project.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {stories.length} {stories.length === 1 ? "story" : "stories"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="px-6 py-4 border-b border-neutral-100 flex-shrink-0 bg-white">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
              <BarChart3 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div>
                <p className="text-base font-bold text-neutral-900 leading-none">{stories.length}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Total Stories</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-base font-bold text-neutral-900 leading-none">{generated}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Generated</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-amber-50/60 border border-amber-100 rounded-xl">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-base font-bold text-neutral-900 leading-none">{stories.length - generated}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Pending</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
              <span className="font-medium">Generation Progress</span>
              <span className="font-bold text-indigo-600">{pct}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
              />
            </div>
          </div>

          {/* Feature area chips */}
          {areas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {areas.map((a) => (
                <span key={a} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${areaBadge(a)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${AREA_DOT_COLORS[a] ?? "bg-neutral-400"}`} />
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Story list */}
          <div className="w-[45%] border-r border-neutral-100 overflow-y-auto p-3 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-2">User Stories</p>
            {stories.map((story) => {
              const isSelected = selectedStory?.id === story.id;
              return (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(isSelected ? null : story)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all duration-150 ${
                    isSelected
                      ? "border-purple-300 bg-purple-50/60 shadow-sm"
                      : "border-neutral-200/70 hover:border-purple-200 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${AREA_DOT_COLORS[story.featureArea] ?? "bg-neutral-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 leading-snug line-clamp-2">{story.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${
                          story.status === "generated"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-neutral-100 text-neutral-500 border-neutral-200"
                        }`}>
                          {story.status === "generated" ? "Generated" : "Draft"}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${confidenceColor(story.confidence)}`}>
                          {Math.round(story.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 transition-transform ${isSelected ? "text-purple-500 rotate-90" : "text-neutral-300"}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Story detail */}
          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {selectedStory ? (
                <motion.div
                  key={selectedStory.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {/* Title + area */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold ${areaBadge(selectedStory.featureArea)}`}>
                        <Tag className="w-2.5 h-2.5" />
                        {selectedStory.featureArea}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${confidenceColor(selectedStory.confidence)}`}>
                        {Math.round(selectedStory.confidence * 100)}% confidence
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedStory.status === "generated"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {selectedStory.status === "generated" ? "✓ Generated" : "◦ Draft"}
                      </span>
                    </div>
                    <h3 className="font-bold text-neutral-900 text-sm leading-snug">{selectedStory.title}</h3>
                  </div>

                  {/* User story statement */}
                  <div className="px-3.5 py-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1.5">User Story</p>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      As a <span className="font-semibold text-indigo-700">{selectedStory.role}</span>, I want to{" "}
                      <span className="font-semibold text-indigo-700">{selectedStory.action}</span>, so that{" "}
                      <span className="font-semibold text-indigo-700">{selectedStory.benefit}</span>.
                    </p>
                  </div>

                  {/* Suggested fields */}
                  {selectedStory.suggestedFields?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                        Form Fields ({selectedStory.suggestedFields.length})
                      </p>
                      <div className="space-y-1.5">
                        {selectedStory.suggestedFields.map((f: any, i: number) => (
                          <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-neutral-50 border border-neutral-200/70 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-neutral-800 flex-1">{f.label || f.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">{f.type}{f.format ? `/${f.format}` : ""}</span>
                            {f.required && <span className="text-[10px] text-red-500 font-bold">required</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acceptance criteria */}
                  {selectedStory.acceptanceCriteria?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                        Acceptance Criteria ({selectedStory.acceptanceCriteria.length})
                      </p>
                      <ul className="space-y-1.5">
                        {selectedStory.acceptanceCriteria.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-neutral-600 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action button */}
                  <div className="pt-1">
                    {selectedStory.status === "generated" ? (
                      <button
                        onClick={() => {
                          onPreviewSchema(buildStorySchema(selectedStory), selectedStory.title);
                          onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all hover:-translate-y-0.5"
                      >
                        <Eye className="w-4 h-4" />
                        Preview Generated Form
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sessionStorage.setItem("srs_preload_schema", buildStorySchema(selectedStory));
                          sessionStorage.setItem("srs_story_id", selectedStory.id);
                          sessionStorage.setItem("srs_project_id", project.id);
                          window.location.href = "/editor?fromSrs=1";
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all hover:-translate-y-0.5"
                      >
                        <Wand2 className="w-4 h-4" />
                        Generate Form in Editor
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-16"
                >
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-neutral-300" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-700">Select a user story</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-[160px]">Click any story on the left to see its full details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export const ProfilePage: React.FC = () => {
  const { user, token, logout, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [headerName, setHeaderName] = useState<string | null>(null);
  const [headerEmail, setHeaderEmail] = useState<string | null>(null);

  useEffect(() => {
    if (user) { setHeaderName(user.name ?? null); setHeaderEmail(user.email); }
  }, [user?.name, user?.email]);

  const handleUserUpdated = (updated: any) => {
    updateUser(updated);
    setHeaderName(updated.name ?? null);
    setHeaderEmail(updated.email);
  };

  const initialTab = searchParams.get("tab") === "projects" ? "projects" : "schemas";
  const [activeTab, setActiveTab] = useState<"schemas" | "projects">(initialTab);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [projects, setProjects] = useState<SrsProject[]>([]);
  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // SRS import
  const [showSrsUpload, setShowSrsUpload] = useState(false);
  const [srsResult, setSrsResult] = useState<ParseSrsResponse | null>(null);
  const [srsProjName, setSrsProjName] = useState("");

  // Modals
  const [formPreview, setFormPreview] = useState<{ schemaJson: string; title: string } | null>(null);
  const [projectDetail, setProjectDetail] = useState<SrsProject | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: "schema" | "project"; name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoadingSchemas(true);
    fetch(`${SCHEMA_API_URL}/schema?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setSchemas(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load schemas"))
      .finally(() => setLoadingSchemas(false));
  }, [user]);

  useEffect(() => {
    if (!token) return;
    setLoadingProjects(true);
    projectApi.list(token)
      .then((r) => setProjects(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, [token]);

  useEffect(() => {
    if (activeTab !== "projects" || !token) return;
    projectApi.list(token)
      .then((r) => setProjects(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error("Failed to load projects"));
  }, [activeTab, token]);

  /* ── Delete handlers ─────────────────────────────────── */
  const confirmDelete = (id: string, type: "schema" | "project", name: string) => {
    setDeleteConfirm({ id, type, name });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      if (type === "schema") {
        await schemaApi.delete(id);
        setSchemas((p) => p.filter((s) => s.id !== id));
        toast.success("Schema deleted");
      } else {
        await projectApi.delete(token!, id);
        setProjects((p) => p.filter((proj) => proj.id !== id));
        // close detail modal if it's the deleted project
        setProjectDetail((prev) => prev?.id === id ? null : prev);
        toast.success("Project deleted");
      }
    } catch {
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleSrsExtracted = (result: ParseSrsResponse, projectName: string) => {
    setSrsResult(result);
    setSrsProjName(projectName);
    setShowSrsUpload(false);
  };

  const handleProjectSaved = (_projectId: string) => {
    // Refresh projects list and navigate to projects tab
    if (token) {
      projectApi.list(token).then((r) => setProjects(Array.isArray(r.data) ? r.data : []));
    }
    setActiveTab("projects");
    setSrsResult(null);
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse shadow-xl" />
          <p className="text-sm text-neutral-500 animate-pulse">Loading your workspace…</p>
        </motion.div>
      </div>
    );
  if (!user) return null;

  const displayedName = headerName ?? user.name;
  const displayedEmail = headerEmail ?? user.email;
  const initials = (displayedName || displayedEmail).slice(0, 2).toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-32 left-1/2 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* ── Profile Header ─────────────────────────────── */}
      <div className="relative z-10 border-b border-purple-100/80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f6f3ff] via-white to-[#eef4ff]" />
        <motion.div
          className="absolute -inset-16 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(139, 92, 246, 0.35) 1.5px, transparent 1.5px)", backgroundSize: "26px 26px" }}
          animate={{ y: [0, 26], opacity: [0.38, 1, 0.38] }}
          transition={{ y: { duration: 4, ease: "linear", repeat: Infinity }, opacity: { duration: 6, ease: "easeInOut", repeat: Infinity } }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, white 100%)" }} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/80" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.1 }} className="relative flex-shrink-0 self-start sm:self-auto">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center select-none shadow-lg shadow-purple-200/60">
                <span className="text-2xl font-extrabold text-white tracking-tight">{initials}</span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-white" />
            </motion.div>

            {/* Identity */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.38 }} className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{displayedName || "FormSync User"}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3" /> Pro
                </span>
              </div>
              <p className="text-sm text-neutral-500 mb-2">{displayedEmail}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400"><Clock className="w-3.5 h-3.5" /> Member since {memberSince}</span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <FileJson2 className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-medium text-neutral-700">{schemas.length}</span> schemas
                </span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium text-neutral-700">{projects.length}</span> projects
                </span>
              </div>
            </motion.div>

            {/* Sign out */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.38 }} className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 border border-neutral-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Sign out
              </button>
            </motion.div>
          </motion.div>

          {/* Stat strip — 2 columns (no templates) */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.38 }} className="grid grid-cols-2 gap-3 mt-6">
            {[
              { label: "JSON Schemas", value: schemas.length, icon: <FileJson2 className="w-4 h-4 text-purple-500" />, accent: "border-purple-100 bg-purple-50/60", onClick: () => setActiveTab("schemas") },
              { label: "SRS Projects", value: projects.length, icon: <FolderOpen className="w-4 h-4 text-emerald-500" />, accent: "border-emerald-100 bg-emerald-50/60", onClick: () => setActiveTab("projects") },
            ].map((s, i) => (
              <motion.button
                key={s.label}
                onClick={s.onClick}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36 + i * 0.06, duration: 0.32 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.accent} hover:shadow-sm transition-all text-left`}
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-white flex items-center justify-center flex-shrink-0">{s.icon}</div>
                <div>
                  <p className="text-lg font-bold text-neutral-900 leading-none">{s.value}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[370px_1fr] gap-6 pb-8">
          {/* LEFT: Account Settings */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <AccountSettings user={user} token={token} onUserUpdated={handleUserUpdated} />
          </motion.div>

          {/* RIGHT: Library */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
              {/* Tabs header */}
              <div className="px-5 pt-5 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-neutral-900">My Library</h2>
                  {activeTab === "projects" && (
                    <button
                      onClick={() => setShowSrsUpload(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold hover:shadow-md hover:shadow-purple-200 transition-all hover:-translate-y-0.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Import SRS
                    </button>
                  )}
                </div>
                <div className="flex gap-1 bg-neutral-100/80 p-1 rounded-xl w-fit mb-0">
                  {(["schemas", "projects"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === tab
                          ? "bg-purple-100 text-purple-800 shadow-sm border border-purple-200/60"
                          : "text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      {tab === "schemas" ? (
                        <><FileJson2 className="w-3.5 h-3.5" />JSON Schemas <TabBadge count={schemas.length} active={activeTab === tab} /></>
                      ) : (
                        <><FolderOpen className="w-3.5 h-3.5" />Projects <TabBadge count={projects.length} active={activeTab === tab} /></>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="p-5 pt-4 min-h-[320px]">
                <AnimatePresence mode="wait">
                  {activeTab === "projects" ? (
                    <motion.div key="projects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      {loadingProjects ? <SkeletonGrid /> : projects.length === 0 ? (
                        <EmptyState
                          icon={<FolderOpen className="w-9 h-9 text-neutral-300" />}
                          title="No SRS projects yet"
                          description="Upload an SRS document to automatically extract user stories and generate forms."
                          action={
                            <button onClick={() => setShowSrsUpload(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all hover:-translate-y-0.5">
                              <Upload className="w-4 h-4" />Import SRS Document
                            </button>
                          }
                        />
                      ) : (
                        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
                          {projects.map((proj, i) => (
                            <motion.div key={proj.id} custom={i} variants={fadeUp}>
                              <ProjectCard
                                project={proj}
                                onDelete={() => confirmDelete(proj.id, "project", proj.name)}
                                onClick={() => setProjectDetail(proj)}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="schemas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      {loadingSchemas ? <SkeletonGrid /> : schemas.length === 0 ? (
                        <EmptyState
                          icon={<FileJson2 className="w-9 h-9 text-neutral-300" />}
                          title="No schemas yet"
                          description="Create a schema in the editor, run AI Enhancement and save it."
                          action={
                            <Link to="/editor" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all hover:-translate-y-0.5">
                              <Plus className="w-4 h-4" />New Schema
                            </Link>
                          }
                        />
                      ) : (
                        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
                          {schemas.map((s, i) => (
                            <motion.div key={s.id} custom={i} variants={fadeUp}>
                              <SchemaCard schema={s} onDelete={() => confirmDelete(s.id, "schema", s.name)} />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── All Modals ────────────────────────────────────── */}
      <AnimatePresence>
        {showSrsUpload && (
          <SrsUploadModal onClose={() => setShowSrsUpload(false)} onStoriesExtracted={handleSrsExtracted} />
        )}
        {srsResult && token && (
          <UserStorySelectorModal
            result={srsResult}
            projectName={srsProjName}
            token={token}
            onClose={() => setSrsResult(null)}
            onProjectSaved={handleProjectSaved}
          />
        )}
        {projectDetail && (
          <ProjectDetailModal
            project={projectDetail}
            onClose={() => setProjectDetail(null)}
            onPreviewSchema={(schemaJson, title) => setFormPreview({ schemaJson, title })}
          />
        )}
        {formPreview && (
          <FormPreviewModal schemaJson={formPreview.schemaJson} storyTitle={formPreview.title} onClose={() => setFormPreview(null)} />
        )}
        {deleteConfirm && (
          <DeleteConfirmModal
            itemName={deleteConfirm.name}
            itemType={deleteConfirm.type === "schema" ? "JSON Schema" : "Project"}
            onConfirm={executeDelete}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ACCOUNT SETTINGS SIDEBAR
══════════════════════════════════════════════════════════════ */
const AccountSettings: React.FC<{ user: any; token: string | null; onUserUpdated: (u: any) => void }> = ({ user, token, onUserUpdated }) => {
  const [editingField, setEditingField] = useState<"name" | "email" | null>(null);
  const [shownName, setShownName] = useState<string>(user.name ?? "");
  const [shownEmail, setShownEmail] = useState<string>(user.email ?? "");
  const [nameVal, setNameVal] = useState<string>("");
  const [emailVal, setEmailVal] = useState<string>("");
  const [savingField, setSavingField] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveField = async (field: "name" | "email") => {
    if (!token) return;
    const value = (field === "name" ? nameVal : emailVal).trim();
    if (!value) return toast.error("Value cannot be empty");
    setSavingField(true);
    try {
      const updated = await authService.updateProfile(token, { [field]: value });
      if (field === "name") setShownName(updated.name ?? value);
      else setShownEmail(updated.email ?? value);
      onUserUpdated(updated);
      setEditingField(null);
      toast.success(`${field === "name" ? "Name" : "Email"} updated`);
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setSavingField(false);
    }
  };

  const savePassword = async () => {
    if (!token) return;
    setSavingPw(true);
    try {
      await authService.changePassword(token, currentPw, newPw);
      toast.success("Password changed successfully");
      setPwOpen(false); setCurrentPw(""); setNewPw("");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center"><User className="w-4 h-4 text-indigo-500" /></div>
          <h3 className="font-bold text-sm text-neutral-900">Personal Info</h3>
        </div>
        <ProfileField icon={<User className="w-3.5 h-3.5 text-neutral-400" />} label="Display Name" value={shownName || "Not set"} isEditing={editingField === "name"} isSaving={savingField} onEdit={() => { setNameVal(shownName); setEditingField("name"); }} onCancel={() => setEditingField(null)} onSave={() => saveField("name")}>
          <input autoFocus value={nameVal} onChange={(e) => setNameVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveField("name")} className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-300 bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-neutral-900" placeholder="Your display name" />
        </ProfileField>
        <div className="h-px bg-neutral-100 my-3" />
        <ProfileField icon={<Mail className="w-3.5 h-3.5 text-neutral-400" />} label="Email Address" value={shownEmail} isEditing={editingField === "email"} isSaving={savingField} onEdit={() => { setEmailVal(shownEmail); setEditingField("email"); }} onCancel={() => setEditingField(null)} onSave={() => saveField("email")}>
          <input autoFocus type="email" value={emailVal} onChange={(e) => setEmailVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveField("email")} className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-300 bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-neutral-900" placeholder="your@email.com" />
        </ProfileField>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6">
        <button onClick={() => setPwOpen((o) => !o)} className="w-full flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-purple-500" /></div>
            <h3 className="font-bold text-sm text-neutral-900">Security</h3>
          </div>
          <motion.div animate={{ rotate: pwOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </motion.div>
        </button>
        <AnimatePresence>
          {pwOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1"><KeyRound className="w-3.5 h-3.5" />Change your account password</div>
                <PasswordInput label="Current password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
                <PasswordInput label="New password" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew((v) => !v)} />
                <button onClick={savePassword} disabled={savingPw || !currentPw || !newPw} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {savingPw ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin inline-block" /> : <ShieldCheck className="w-4 h-4" />}
                  {savingPw ? "Saving…" : "Update Password"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProfileField: React.FC<{ icon: React.ReactNode; label: string; value: string; isEditing: boolean; isSaving: boolean; onEdit: () => void; onCancel: () => void; onSave: () => void; children: React.ReactNode }> = ({ icon, label, value, isEditing, isSaving, onEdit, onCancel, onSave, children }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="text-xs text-neutral-400 flex items-center gap-1">{icon}{label}</label>
      {!isEditing && <button onClick={onEdit} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors"><Pencil className="w-3 h-3" />Edit</button>}
    </div>
    <AnimatePresence mode="wait">
      {isEditing ? (
        <motion.div key="edit" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
          {children}
          <div className="flex gap-2 mt-2">
            <button onClick={onSave} disabled={isSaving} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {isSaving ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> : <Check className="w-3 h-3" />}Save
            </button>
            <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors"><X className="w-3 h-3" />Cancel</button>
          </div>
        </motion.div>
      ) : (
        <motion.p key="value" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-neutral-900 truncate py-0.5">{value}</motion.p>
      )}
    </AnimatePresence>
  </div>
);

const PasswordInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }> = ({ label, value, onChange, show, onToggle }) => (
  <div>
    <label className="text-xs text-neutral-500 mb-1 block">{label}</label>
    <div className="relative mx-0.5">
      <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 pr-9 text-sm rounded-lg border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors" placeholder="••••••••" />
      <button type="button" onClick={onToggle} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   LIBRARY CARDS
══════════════════════════════════════════════════════════════ */
const statusConfig: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  published: { label: "Published", icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-emerald-100 text-emerald-700" },
  validated:  { label: "Validated",  icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-blue-100 text-blue-700" },
  enhanced:   { label: "Enhanced",   icon: <Sparkles className="w-3 h-3" />,     cls: "bg-purple-100 text-purple-700" },
  draft:      { label: "Draft",      icon: <Clock className="w-3 h-3" />,         cls: "bg-neutral-100 text-neutral-600" },
};

const SchemaCard: React.FC<{ schema: any; onDelete: () => void }> = ({ schema, onDelete }) => {
  const status = statusConfig[schema.status] ?? statusConfig.draft;
  const fieldCount = schema.content?.properties ? Object.keys(schema.content.properties).length : null;
  return (
    <div className="group bg-neutral-50/70 rounded-2xl border border-neutral-200/70 p-4 hover:border-purple-300 hover:bg-white hover:shadow-md hover:shadow-purple-100/60 transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center"><FileJson2 className="w-4 h-4 text-indigo-500" /></div>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${status.cls}`}>{status.icon}{status.label}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Delete schema"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="font-semibold text-sm text-neutral-900 truncate mb-0.5">{schema.name}</p>
      {schema.description && <p className="text-xs text-neutral-400 line-clamp-1 flex-1">{schema.description}</p>}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-200/60">
        <span className="text-xs text-neutral-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />{new Date(schema.updatedAt).toLocaleDateString()}
          {fieldCount !== null && <span className="ml-1 px-1.5 py-0.5 bg-neutral-200/60 rounded-md text-neutral-500">{fieldCount}f</span>}
        </span>
        <Link to={`/editor?schemaId=${schema.id}`} className="flex items-center gap-0.5 text-xs text-purple-600 font-bold hover:gap-1.5 transition-all group/l">
          Open <ArrowRight className="w-3 h-3 group-hover/l:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

/* ─── Project Card — click body to open detail, trash to delete ── */
const ProjectCard: React.FC<{ project: SrsProject; onDelete: () => void; onClick: () => void }> = ({ project, onDelete, onClick }) => {
  const stories = project.userStories ?? [];
  const generated = stories.filter((s) => s.status === "generated").length;
  const areas = [...new Set(stories.map((s) => s.featureArea).filter(Boolean))];
  const pct = stories.length ? Math.round((generated / stories.length) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="group bg-neutral-50/70 rounded-2xl border border-neutral-200/70 p-4 hover:border-purple-300 hover:bg-white hover:shadow-md hover:shadow-purple-100/60 transition-all duration-200 hover:-translate-y-0.5 flex flex-col cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center"><FolderOpen className="w-4 h-4 text-emerald-600" /></div>
          <div>
            <p className="font-semibold text-sm text-neutral-900 truncate max-w-[140px]">{project.name}</p>
            <p className="text-xs text-neutral-400">{stories.length} {stories.length === 1 ? "story" : "stories"}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Delete project"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {areas.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {areas.slice(0, 4).map((a) => (
            <span key={a} className="flex items-center gap-1 text-[10px] text-neutral-500 px-1.5 py-0.5 bg-white border border-neutral-200/70 rounded-full">
              <span className={`w-1.5 h-1.5 rounded-full ${AREA_DOT_COLORS[a] ?? "bg-neutral-400"}`} />{a}
            </span>
          ))}
          {areas.length > 4 && <span className="text-[10px] text-neutral-400 px-1.5 py-0.5">+{areas.length - 4} more</span>}
        </div>
      )}

      {stories.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>{generated}/{stories.length} forms generated</span>
            <span className="font-semibold text-indigo-500">{pct}%</span>
          </div>
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-200/60">
        <span className="text-xs text-neutral-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(project.createdAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-1 text-xs text-purple-600 font-semibold group-hover:gap-1.5 transition-all">
          View details <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

/* ── Helpers ─────────────────────────────────────────────── */
const TabBadge: React.FC<{ count: number; active: boolean }> = ({ count, active }) => (
  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-purple-200 text-purple-700" : "bg-neutral-200 text-neutral-500"}`}>{count}</span>
);

const SkeletonGrid: React.FC = () => (
  <div className="grid gap-3 sm:grid-cols-2">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-neutral-100 rounded-2xl p-4 animate-pulse">
        <div className="flex gap-2 mb-3"><div className="w-8 h-8 rounded-xl bg-neutral-200" /><div className="h-5 w-20 rounded-full bg-neutral-200 self-center" /></div>
        <div className="h-4 w-3/4 rounded bg-neutral-200 mb-2" />
        <div className="h-3 w-full rounded bg-neutral-200 mb-4" />
        <div className="flex justify-between pt-2 border-t border-neutral-200/60"><div className="h-3 w-16 rounded bg-neutral-200" /><div className="h-3 w-10 rounded bg-neutral-200" /></div>
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">{icon}</div>
    <h3 className="text-base font-bold text-neutral-800 mb-1">{title}</h3>
    <p className="text-sm text-neutral-400 max-w-xs mb-5">{description}</p>
    {action}
  </div>
);
