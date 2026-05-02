/**
 * Unified Editor Page
 *
 * Schema editing with integrated generation controls
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "../components/layout/PageTransition";
import { TechnicalEditor } from "../components/TechnicalEditor";
import { TemplateBuilder } from "../components/TemplateBuilder";
import { FlowDiagram } from "../components/shared/FlowDiagram";
import { useSchemaStore } from "../stores/schemaStore";
import { Tabs, TabsContent } from "../components/ui/tabs";
import {
  Code2,
  Wand2,
  Save,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  generationService,
  type BackendLanguage,
} from "../services/generationService";
import { useAuth } from "../context/AuthContext";
import { projectApi } from "../api/projectApi";
import { BackendLanguageSelector } from "../components/BackendLanguageSelector";

export interface GenerationStage {
  name: string;
  status: "pending" | "loading" | "complete" | "error";
  progress: number;
}

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();
  const { currentSchema, validationResults, loadSchema } = useSchemaStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [schemaFromBuilder, setSchemaFromBuilder] = useState<string>(""); // Schema transferred from Template Builder
  const [activeTab, setActiveTab] = useState("technical"); // Control which tab is active
  const [backendLanguage, setBackendLanguage] =
    useState<BackendLanguage>("springBoot");

  // Tracks whether the schema was opened from a saved template (already enhanced)
  const [isLoadedFromTemplate, setIsLoadedFromTemplate] = useState(false);

  // SRS story tracking — set when schema was loaded from a user story in Projects
  const [srsStoryId, setSrsStoryId] = useState<string | null>(null);
  const [srsProjectId, setSrsProjectId] = useState<string | null>(null);

  // Save-as-template dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nameConflictError, setNameConflictError] = useState<string | null>(
    null,
  );
  const [stages, setStages] = useState<GenerationStage[]>([
    { name: "Enter Schema", status: "pending", progress: 0 },
    { name: "Input Validation", status: "pending", progress: 0 },
    { name: "Schema Conversion", status: "pending", progress: 0 },
    { name: "AI Enhancement", status: "pending", progress: 0 },
    { name: "Frontend Generation", status: "pending", progress: 0 },
    { name: "Backend Generation", status: "pending", progress: 0 },
    { name: "DTO Generation", status: "pending", progress: 0 },
    { name: "Test Generation", status: "pending", progress: 0 },
  ]);

  // Pre-load schema from SRS import (sessionStorage bridge)
  useEffect(() => {
    const fromSrs = searchParams.get("fromSrs");
    if (fromSrs) {
      const preload = sessionStorage.getItem("srs_preload_schema");
      if (preload) {
        setSchemaFromBuilder(preload);
        setIsLoadedFromTemplate(true);
        setActiveTab("technical");
        sessionStorage.removeItem("srs_preload_schema");
        // Capture story/project IDs if they were set (came from Projects page)
        const storyId = sessionStorage.getItem("srs_story_id");
        const projectId = sessionStorage.getItem("srs_project_id");
        if (storyId) { setSrsStoryId(storyId); sessionStorage.removeItem("srs_story_id"); }
        if (projectId) { setSrsProjectId(projectId); sessionStorage.removeItem("srs_project_id"); }
      }
    }
  }, [searchParams]);

  // Load schema if a schemaId is provided in URL
  useEffect(() => {
    const schemaId = searchParams.get("schemaId");
    if (schemaId) {
      toast.loading("Loading schema...");
      loadSchema(schemaId)
        .then(() => {
          toast.dismiss();

          // Need to stringify the schema before passing it into TechnicalEditor
          // because it expects a raw JSON string to put into the Monaco editor
          const currentSchemaData = useSchemaStore.getState().currentSchema;
          if (currentSchemaData) {
            setSchemaFromBuilder(JSON.stringify(currentSchemaData, null, 2));
            setIsLoadedFromTemplate(true);
            toast.success("Schema loaded successfully");
            setActiveTab("technical");
          }
        })
        .catch(() => {
          toast.dismiss();
          toast.error("Failed to load schema");
        });
    }
  }, [searchParams, loadSchema]);

  // Handler to update stages from TechnicalEditor
  const handleStageUpdate = (
    stageName: string,
    status: "loading" | "complete" | "error" | "pending",
  ) => {
    setStages((prev) =>
      prev.map((s) =>
        s.name === stageName
          ? {
              ...s,
              status,
              progress:
                status === "complete" ? 100 : status === "loading" ? 50 : 0,
            }
          : s,
      ),
    );
  };

  // Handler to receive schema from Template Builder
  const handleUseSchemaFromBuilder = (schemaJson: string) => {
    setSchemaFromBuilder(schemaJson);
  };

  // Auto-switch to Technical Editor tab AFTER schemaFromBuilder state is set
  React.useEffect(() => {
    if (schemaFromBuilder && schemaFromBuilder.trim()) {
      setActiveTab("technical");
      toast.success("Schema transferred! Now in Technical Editor.");
    }
  }, [schemaFromBuilder]);

  const handleGenerate = async () => {
    // Validation check - show error if not valid
    if (!currentSchema) {
      toast.error("Please enter a schema first");
      return;
    }

    if (!validationResults) {
      toast.error(
        "Validation results missing. Please click Validate then try again.",
      );
      return;
    }

    if (!validationResults.valid) {
      toast.error(
        "Schema validation failed. Please fix the errors shown in the editor.",
      );
      return;
    }

    setIsGenerating(true);
    toast.info("Starting code generation...");

    try {
      // Start from Frontend Generation (index 4)
      const generationStages = stages.slice(4);

      for (let i = 0; i < generationStages.length; i++) {
        const stageIndex = i + 4; // Offset for actual index
        setStages((prev) =>
          prev.map((s, idx) =>
            idx === stageIndex ? { ...s, status: "loading", progress: 0 } : s,
          ),
        );

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 25) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          setStages((prev) =>
            prev.map((s, idx) => (idx === stageIndex ? { ...s, progress } : s)),
          );
        }

        // Mark complete
        setStages((prev) =>
          prev.map((s, idx) =>
            idx === stageIndex
              ? { ...s, status: "complete", progress: 100 }
              : s,
          ),
        );
      }

      // Call backend API
      const USE_MOCK = true;
      const result = USE_MOCK
        ? await generationService.generateMock()
        : await generationService.generateAll(currentSchema);

      if (result.success && result.data) {
        toast.success("Code generation complete!");
        sessionStorage.setItem("formsync_backend_language", backendLanguage);
        navigate(`/generated?backendLanguage=${backendLanguage}`, {
          state: {
            generatedCode: result.data,
            schema: currentSchema,
            backendLanguage,
          },
        });
      } else {
        throw new Error(result.error || "Generation failed");
      }
    } catch (error) {
      toast.error("Generation failed. Please try again.");
      setStages((prev) =>
        prev.map((s, idx) => (idx >= 4 ? { ...s, status: "error" } : s)),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Open the save-as-template dialog instead of auto-saving
  const handleNextToFormBuilder = () => {
    if (!currentSchema) {
      toast.error("Please complete validation and conversion first");
      return;
    }
    setNameConflictError(null);
    setShowSaveDialog(true);
  };

  // Navigate to the form builder (with or without a saved schema ID)
  const goToBuilder = (schemaId?: string) => {
    const url = schemaId ? `/builder?schemaId=${schemaId}` : "/builder";
    window.location.href = url;
  };

  // User chose to save as template then go to builder
  const handleSaveAndNavigate = async () => {
    if (!currentSchema) return;

    // If not logged in, fall back to skip-save navigation
    if (!user?.id) {
      toast.info("Sign in to save templates to your library.", {
        description: "Proceeding to Form Builder without saving.",
        duration: 3500,
      });
      handleSkipAndNavigate();
      return;
    }

    setIsSaving(true);
    setNameConflictError(null);
    try {
      const response = await fetch("/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentSchema.title || "Untitled Schema",
          description: currentSchema.description || "Schema from Schema UI",
          content: currentSchema,
          sourceFormat: "json",
          status: "validated",
          userId: user.id,
        }),
      });

      if (response.status === 409) {
        // Duplicate name — show inline error inside the dialog
        const errorData = await response.json().catch(() => ({}));
        setNameConflictError(
          errorData?.message ||
            `A JSON template named "${currentSchema.title || "Untitled Schema"}" already exists in your library.`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const savedSchema = await response.json();
      toast.success("Template saved successfully!");
      setShowSaveDialog(false);
      // Clear any pending session schema since we now have a real saved ID
      sessionStorage.removeItem("formsync_pending_schema");

      // If this schema came from an SRS user story, mark that story as generated
      if (srsStoryId && srsProjectId && token) {
        projectApi
          .updateStoryStatus(token, srsProjectId, srsStoryId, "generated", savedSchema.id)
          .catch(() => {}); // non-blocking — don't fail the save if this errors
      }

      goToBuilder(savedSchema.id);
    } catch (error) {
      toast.error("Failed to save template.", {
        description: "Proceeding to Form Builder without saving.",
        duration: 3500,
        action: {
          label: "Go anyway",
          onClick: () => handleSkipAndNavigate(),
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  // User chose to skip saving and go straight to builder
  const handleSkipAndNavigate = () => {
    setShowSaveDialog(false);
    // Persist the current schema so BuilderPage can pick it up without a saved ID
    if (currentSchema) {
      sessionStorage.setItem(
        "formsync_pending_schema",
        JSON.stringify(currentSchema),
      );
    }
    goToBuilder();
  };

  const TAB_ITEMS = [
    { value: "technical", label: "Technical Editor", icon: Code2 },
    { value: "builder", label: "Template Builder", icon: Wand2 },
  ] as const;

  return (
    <>
      <PageTransition>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-50 via-white to-purple-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
          <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mb-7"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Schema Editor
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-1.5">
                Build your schema
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
                Define your data structure, validate and enhance it with AI,
                then generate complete application code in one click.
              </p>
              <div className="mt-6 max-w-3xl">
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-500 mb-2">
                  Backend Language
                </label>
                <BackendLanguageSelector
                  selected={backendLanguage}
                  onChange={(selected) => {
                    setBackendLanguage(selected);
                    sessionStorage.setItem(
                      "formsync_backend_language",
                      selected,
                    );
                  }}
                />
              </div>
            </motion.div>

            {/* Pipeline Progress */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
              className="mb-7"
            >
              <FlowDiagram stages={stages} />
            </motion.div>

            {/* Editor Area */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.14, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              {/* Custom animated segmented control */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                  {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setActiveTab(value)}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                        activeTab === value
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                    >
                      {activeTab === value && (
                        <motion.span
                          layoutId="tab-pill"
                          className="absolute inset-0 rounded-lg bg-white dark:bg-neutral-700 shadow-sm"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content — using Tabs component for accessibility/logic but hiding its native elements */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="technical" className="mt-0">
                  <TechnicalEditor
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    onStageUpdate={handleStageUpdate}
                    onNextToFormBuilder={handleNextToFormBuilder}
                    stages={stages}
                    schemaFromBuilder={schemaFromBuilder}
                    isLoadedFromTemplate={isLoadedFromTemplate}
                    isLoadedFromSrs={!!srsStoryId}
                  />
                </TabsContent>

                <TabsContent value="builder" className="mt-0">
                  <TemplateBuilder onUseSchema={handleUseSchemaFromBuilder} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </main>
        </div>
      </PageTransition>

      {/* ── Save-as-Template Dialog ─────────────────────────────────────── */}
      <AnimatePresence>
        {showSaveDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => !isSaving && setShowSaveDialog(false)}
            />

            {/* Dialog panel — wrapper handles centering via flex, motion.div handles animation only */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
              <motion.div
                key="dialog"
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-full max-w-md pointer-events-auto"
              >
                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50">
                        <Save className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Save as Template?
                      </h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Would you like to save{" "}
                      <span className="font-medium text-neutral-700 dark:text-neutral-200">
                        "{currentSchema?.title || "Untitled Schema"}"
                      </span>{" "}
                      to your JSON schema library before going to the Form
                      Builder?
                    </p>
                  </div>

                  {/* Duplicate name error */}
                  <AnimatePresence>
                    {nameConflictError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-6 mb-4"
                      >
                        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{nameConflictError}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                    {/* Save button */}
                    <button
                      onClick={handleSaveAndNavigate}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save &amp; Continue
                        </>
                      )}
                    </button>

                    {/* Skip button */}
                    <button
                      onClick={handleSkipAndNavigate}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Skip &amp; Continue
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
