import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ClipboardPaste,
  Loader2,
  Eye,
  FileJson2,
} from "lucide-react";
import { schemaApi, ParseSrsResponse } from "../api/schemaApi";

/* ─── Types ─────────────────────────────────────────────── */
type Step = "upload" | "processing" | "preview" | "done";
type InputMode = "file" | "text";

interface Props {
  onClose: () => void;
  onStoriesExtracted: (result: ParseSrsResponse, projectName: string) => void;
}

/* ─── Progress timeline steps ───────────────────────────── */
const PIPELINE_STEPS = [
  { id: "upload",    label: "Uploading content" },
  { id: "extract",   label: "Extracting text" },
  { id: "ai",        label: "AI analysis" },
  { id: "structure", label: "Structuring stories" },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export const SrsUploadModal: React.FC<Props> = ({ onClose, onStoriesExtracted }) => {
  const [step, setStep] = useState<Step>("upload");
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [projectName, setProjectName] = useState("");
  const [pipelineStage, setPipelineStage] = useState(0);
  const [result, setResult] = useState<ParseSrsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Drag handlers ─────────────────────────────────── */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const handleFile = (f: File) => {
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const allowedExt = [".pdf", ".docx"];
    const extOk = allowedExt.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!allowed.includes(f.type) && !extOk) {
      setError("Only PDF or DOCX files are supported.");
      return;
    }
    setError(null);
    setFile(f);
    setProjectName(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleModeSwitch = (mode: InputMode) => {
    setInputMode(mode);
    setError(null);
  };

  /* ── Upload & parse ─────────────────────────────────── */
  const handleParse = async () => {
    let uploadFile: File | null = null;

    if (inputMode === "file") {
      if (!file) return;
      uploadFile = file;
    } else {
      const trimmed = pasteText.trim();
      if (trimmed.length < 20) {
        setError("Please paste at least some SRS text to analyse.");
        return;
      }
      uploadFile = new File(
        [new Blob([trimmed], { type: "text/plain" })],
        "pasted-srs.txt",
        { type: "text/plain" }
      );
    }

    setStep("processing");
    setError(null);

    let stageIdx = 0;
    const advance = () => {
      stageIdx++;
      if (stageIdx < PIPELINE_STEPS.length) setPipelineStage(stageIdx);
    };

    const timer1 = setTimeout(() => advance(), 600);
    const timer2 = setTimeout(() => advance(), 1600);
    const timer3 = setTimeout(() => advance(), 2800);

    try {
      const res = await schemaApi.parseSrs(uploadFile);
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
      setPipelineStage(3);
      await new Promise((r) => setTimeout(r, 400));
      setResult(res.data);
      setProjectName((prev) => prev || res.data.projectName);
      setStep("preview");
    } catch (e: any) {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
      setError(e?.response?.data?.message ?? e.message ?? "Parsing failed.");
      setStep("upload");
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    onStoriesExtracted(result, projectName || result.projectName);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-200/60 flex-shrink-0">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base leading-tight">
                Import from SRS Document
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Upload a file or paste text — AI will extract user stories automatically
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

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {step === "upload" && (
              <UploadStep
                key="upload"
                inputMode={inputMode}
                dragging={dragging}
                file={file}
                pasteText={pasteText}
                projectName={projectName}
                error={error}
                onModeSwitch={handleModeSwitch}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onBrowse={() => fileInputRef.current?.click()}
                onPasteTextChange={setPasteText}
                onProjectNameChange={setProjectName}
                onParse={handleParse}
                onClose={onClose}
              />
            )}
            {step === "processing" && (
              <ProcessingStep key="processing" stage={pipelineStage} />
            )}
            {step === "preview" && result && (
              <PreviewStep
                key="preview"
                result={result}
                projectName={projectName}
                onProjectNameChange={setProjectName}
                onConfirm={handleConfirm}
                onBack={() => setStep("upload")}
              />
            )}
          </AnimatePresence>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </motion.div>
    </div>
  );
};

/* ─── Step: Upload ───────────────────────────────────────── */
const UploadStep: React.FC<{
  inputMode: InputMode;
  dragging: boolean;
  file: File | null;
  pasteText: string;
  projectName: string;
  error: string | null;
  onModeSwitch: (mode: InputMode) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onBrowse: () => void;
  onPasteTextChange: (v: string) => void;
  onProjectNameChange: (v: string) => void;
  onParse: () => void;
  onClose: () => void;
}> = ({
  inputMode, dragging, file, pasteText, projectName, error,
  onModeSwitch, onDragOver, onDragLeave, onDrop, onBrowse,
  onPasteTextChange, onProjectNameChange, onParse, onClose,
}) => {
  const canSubmit = inputMode === "file" ? !!file : pasteText.trim().length >= 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      {/* Mode switcher */}
      <div className="flex rounded-xl border border-neutral-200 p-1 bg-neutral-50 gap-1">
        <button
          onClick={() => onModeSwitch("file")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            inputMode === "file"
              ? "bg-white text-indigo-700 shadow-sm border border-neutral-200/80"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </button>
        <button
          onClick={() => onModeSwitch("text")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            inputMode === "text"
              ? "bg-white text-indigo-700 shadow-sm border border-neutral-200/80"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          Paste Text
        </button>
      </div>

      <AnimatePresence mode="wait">
        {inputMode === "file" ? (
          <motion.div
            key="file-mode"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {/* Drop zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={onBrowse}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragging
                  ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                  : file
                  ? "border-purple-300 bg-purple-50/50"
                  : "border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/30"
              }`}
            >
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="font-semibold text-sm text-neutral-800 truncate max-w-[220px]">{file.name}</p>
                    <span className="text-xs text-neutral-400">
                      {(file.size / 1024).toFixed(0)} KB · click to change
                    </span>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready to process
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center mb-1">
                      <Upload className="w-5 h-5 text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-700">
                      Drop your SRS document here
                    </p>
                    <p className="text-xs text-neutral-400">PDF or DOCX · up to 20 MB</p>
                    <span className="mt-2 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
                      Browse files
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="text-mode"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            <div className="relative">
              <textarea
                value={pasteText}
                onChange={(e) => onPasteTextChange(e.target.value)}
                placeholder={`Paste your SRS text here…\n\nExample:\nUS-001: As a student, I want to register for an account so that I can access course materials.\n\nAcceptance criteria:\n- Email and password are required\n- Password must be at least 8 characters`}
                rows={10}
                className="w-full px-4 py-3 text-sm rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-neutral-900 font-mono resize-none leading-relaxed"
              />
              {pasteText.trim().length > 0 && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-neutral-400">
                  <span>{pasteText.trim().split(/\s+/).length} words</span>
                  {pasteText.trim().length >= 20 && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-400 flex items-center gap-1.5">
              <ClipboardPaste className="w-3 h-3" />
              Paste user stories, requirements, or any SRS section directly
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700"
          >
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project name — show when file selected or text entered */}
      {(file || pasteText.trim().length >= 20) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <label className="text-xs font-medium text-neutral-600">Project name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="My Project"
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-neutral-900"
          />
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onParse}
          disabled={!canSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Sparkles className="w-4 h-4" />
          Extract Stories
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Step: Processing ───────────────────────────────────── */
const ProcessingStep: React.FC<{ stage: number }> = ({ stage }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    className="py-6"
  >
    <div className="flex flex-col items-center mb-8">
      <div className="relative w-16 h-16 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 animate-pulse" />
      </div>
      <p className="font-bold text-neutral-900 text-base">Analysing your content</p>
      <p className="text-xs text-neutral-400 mt-1">This usually takes 10–30 seconds</p>
    </div>

    {/* Pipeline steps */}
    <div className="space-y-3">
      {PIPELINE_STEPS.map((s, i) => {
        const done = i < stage;
        const active = i === stage;
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              active
                ? "bg-indigo-50 border border-indigo-200"
                : done
                ? "bg-emerald-50/60 border border-emerald-200/60"
                : "bg-neutral-50 border border-neutral-200/60 opacity-40"
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
              done ? "bg-emerald-100" : active ? "bg-indigo-100" : "bg-neutral-200"
            }`}>
              {done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : active ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              )}
            </div>
            <span className={`text-sm font-medium ${
              done ? "text-emerald-700" : active ? "text-indigo-700" : "text-neutral-400"
            }`}>
              {s.label}
            </span>
            {active && (
              <span className="ml-auto text-xs text-indigo-400 animate-pulse">Processing…</span>
            )}
            {done && (
              <span className="ml-auto text-xs text-emerald-500 font-semibold">Done</span>
            )}
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

/* ─── Step: Preview ──────────────────────────────────────── */
const PreviewStep: React.FC<{
  result: ParseSrsResponse;
  projectName: string;
  onProjectNameChange: (v: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}> = ({ result, projectName, onProjectNameChange, onConfirm, onBack }) => {
  const [showPreview, setShowPreview] = useState(false);

  const areaColors: Record<string, string> = {
    Authentication: "bg-blue-100 text-blue-700 border-blue-200",
    Registration:   "bg-indigo-100 text-indigo-700 border-indigo-200",
    Profile:        "bg-purple-100 text-purple-700 border-purple-200",
    Search:         "bg-cyan-100 text-cyan-700 border-cyan-200",
    Checkout:       "bg-amber-100 text-amber-700 border-amber-200",
    Payment:        "bg-emerald-100 text-emerald-700 border-emerald-200",
    Dashboard:      "bg-violet-100 text-violet-700 border-violet-200",
  };
  const areaColor = (area: string) =>
    areaColors[area] ?? "bg-neutral-100 text-neutral-600 border-neutral-200";

  const confidenceColor = (c: number) =>
    c >= 0.85 ? "text-emerald-600" : c >= 0.6 ? "text-amber-600" : "text-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="space-y-4"
    >
      {/* Success banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            {result.totalFound} user {result.totalFound === 1 ? "story" : "stories"} found
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">Review below, then save to your project</p>
        </div>
      </div>

      {/* Project name */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-600">Project name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-neutral-900"
        />
      </div>

      {/* Stories list */}
      <div className="max-h-56 overflow-y-auto space-y-2 pr-0.5">
        {result.userStories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 px-3 py-2.5 bg-neutral-50 border border-neutral-200/70 rounded-xl hover:border-purple-200 hover:bg-white transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileJson2 className="w-3 h-3 text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{story.title}</p>
              <p className="text-xs text-neutral-400 truncate">
                {story.suggestedFields.length} field{story.suggestedFields.length !== 1 ? "s" : ""} · As a {story.role}…
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${areaColor(story.featureArea)}`}>
                {story.featureArea}
              </span>
              <span className={`text-[10px] font-bold ${confidenceColor(story.confidence)}`}>
                {Math.round(story.confidence * 100)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Text preview toggle */}
      {result.rawTextPreview && (
        <button
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? "Hide" : "Show"} extracted text preview
        </button>
      )}
      <AnimatePresence>
        {showPreview && result.rawTextPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2.5 bg-neutral-900 rounded-xl text-xs text-neutral-300 font-mono max-h-24 overflow-y-auto">
              {result.rawTextPreview}…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing notes */}
      {result.processingNotes?.length ? (
        <div className="text-xs text-amber-600 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {result.processingNotes[0]}
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={result.totalFound === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-4 h-4" />
          Save Project &amp; Select Story
        </button>
      </div>
    </motion.div>
  );
};
