/**
 * Technical Editor Component
 *
 * Integrated schema editor with generation controls
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useSchemaStore } from "../stores/schemaStore";
import { schemaApi } from "../api/schemaApi";
import { FormatSelector, type FormatType } from "./FormatSelector";
import { SchemaTreeView } from "./SchemaTreeView";
import { SuggestionsPanel } from "./SuggestionsPanel";
import { ValidationDialog } from "./ValidationDialog";
import { QualityMetricsPanel } from "./QualityMetricsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Zap,
  CheckCircle,
  Sparkles,
  Upload,
  X,
  TreePine,
  Loader2,
  Undo2,
  Redo2,
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
  FileJson,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// History entry for undo/redo
interface HistoryEntry {
  content: string; // Editor text content
  timestamp: number;
  action: string;
}

interface TechnicalEditorProps {
  onGenerate?: () => void;
  isGenerating?: boolean;
  onStageUpdate?: (
    stageName: string,
    status: "loading" | "complete" | "error" | "pending",
  ) => void;
  onNextToFormBuilder?: () => void;
  stages?: any[];
  schemaFromBuilder?: string; // Schema transferred from Template Builder
  isLoadedFromTemplate?: boolean; // True when schema was opened from a saved template (already enhanced)
}

export const TechnicalEditor: React.FC<TechnicalEditorProps> = ({
  onGenerate: _onGenerate,
  isGenerating: _isGenerating = false,
  onStageUpdate,
  onNextToFormBuilder,
  stages = [],
  schemaFromBuilder,
  isLoadedFromTemplate = false,
}) => {
  // State
  const [format, setFormat] = useState<FormatType>("json");
  const [editorValue, setEditorValue] = useState("");
  const [showTreeView, setShowTreeView] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showQualityMetrics, setShowQualityMetrics] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Refs for undo/redo management
  const isUndoRedoAction = useRef(false);
  const historyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Schema name state
  const [schemaName, setSchemaName] = useState("");

  // Validation state
  const [isInputValid, setIsInputValid] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  // Individual loading states for each action
  const [convertLoading, setConvertLoading] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);
  const [enhanceLoading, setEnhanceLoading] = useState(false);

  // Workflow mode: 'manual' or 'automated'
  const [workflowMode, setWorkflowMode] = useState<"manual" | "automated">(
    "manual",
  );
  const [autoWorkflowRunning, setAutoWorkflowRunning] = useState(false);

  // Store
  const {
    currentSchema,
    convertedSchema,
    baseSchema,
    suggestions,
    qualityMetrics,
    validationResults,
    convertSchema,
    enhanceSchema,
    applySuggestion,
    setCurrentSchema,
    clearError,
  } = useSchemaStore();

  // Computed - prioritize currentSchema so applied suggestions show immediately
  const displaySchema = currentSchema || convertedSchema;

  // Stable ref for onStageUpdate to prevent editor re-renders
  const onStageUpdateRef = useRef(onStageUpdate);
  useEffect(() => {
    onStageUpdateRef.current = onStageUpdate;
  }, [onStageUpdate]);

  // Handle editor value change - Update "Enter Schema" stage
  // Using empty deps array to prevent Monaco onChange from being recreated
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newValue = value || "";
      setEditorValue(newValue);

      // Update "Enter Schema" stage based on content
      if (newValue.trim()) {
        onStageUpdateRef.current?.("Enter Schema", "complete");
      }

      // Track changes in history with debouncing (only if not undo/redo action)
      if (!isUndoRedoAction.current && newValue.trim()) {
        // Clear existing timer
        if (historyTimerRef.current) {
          clearTimeout(historyTimerRef.current);
        }

        // Set new timer
        historyTimerRef.current = setTimeout(() => {
          setHistory((prevHistory) => {
            const newEntry: HistoryEntry = {
              content: newValue,
              timestamp: Date.now(),
              action: "edit",
            };

            // Skip if content hasn't changed
            const lastEntry = prevHistory[prevHistory.length - 1];
            if (lastEntry && lastEntry.content === newValue) {
              return prevHistory;
            }

            // Keep last 50 entries
            const newHistory = [...prevHistory.slice(-49), newEntry];
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
          });
        }, 500); // 500ms debounce
      }
    },
    [], // Empty deps - handler is stable
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }
    };
  }, []);

  // Initialize history with first entry when editor has content
  useEffect(() => {
    if (editorValue.trim() && history.length === 0) {
      setHistory([
        {
          content: editorValue,
          timestamp: Date.now(),
          action: "init",
        },
      ]);
      setHistoryIndex(0);
    }
  }, [editorValue, history.length]);

  // Initialize history with first entry when editor has content
  useEffect(() => {
    if (editorValue.trim() && history.length === 0) {
      setHistory([
        {
          content: editorValue,
          timestamp: Date.now(),
          action: "init",
        },
      ]);
      setHistoryIndex(0);
    }
  }, [editorValue, history.length]);

  // Populate editor when schema is transferred from Template Builder
  useEffect(() => {
    if (
      schemaFromBuilder &&
      schemaFromBuilder.trim() &&
      schemaFromBuilder !== editorValue
    ) {
      setEditorValue(schemaFromBuilder);
      setFormat("json"); // Template Builder always generates JSON

      // Extract schema name from title if present
      try {
        const schema = JSON.parse(schemaFromBuilder);
        if (schema.title) {
          setSchemaName(schema.title);
        }
      } catch (e) {
        // Ignore parse errors
      }

      toast.success("Schema loaded from Template Builder!");
      onStageUpdate?.("Enter Schema", "complete");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaFromBuilder]); // Only run when schemaFromBuilder changes

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }
    };
  }, []);

  // Initialize history with first non-empty content
  useEffect(() => {
    if (editorValue.trim() && history.length === 0) {
      setHistory([
        {
          content: editorValue,
          timestamp: Date.now(),
          action: "initial",
        },
      ]);
      setHistoryIndex(0);
    }
  }, [editorValue, history.length]);

  // Helper function to validate input format
  // Handlers - NEW ORDER: Validate → Convert → Enhance

  // 1. Validate raw input first (ONLY validates, does NOT convert)
  const handleValidate = useCallback(async () => {
    if (!editorValue.trim()) {
      toast.error("Please enter some code to validate");
      return;
    }

    // Check if schema name is provided
    if (!schemaName || !schemaName.trim()) {
      toast.error("Please enter a schema name before validation");
      setValidationError("Schema name is required");
      return;
    }

    clearError();
    setValidateLoading(true);
    onStageUpdate?.("Input Validation", "loading");

    try {
      // Call backend syntax validation API (validation only, no conversion)
      await schemaApi.validateSyntax({ input: editorValue, format });

      // Validation passed
      setIsInputValid(true);
      setValidationError("");
      onStageUpdate?.("Input Validation", "complete");

      toast.success(`Valid ${format.toUpperCase()} format!`, {
        description: "You can now convert to JSON Schema",
      });

      // Special case: If format is already JSON, also trigger semantic validation
      // but DO NOT populate the output - user must click "Convert" for that
      if (format === "json") {
        try {
          const schema = JSON.parse(editorValue);
          // Only validate if it looks like a schema (has type or properties)
          if (typeof schema === "object" && schema !== null) {
            await useSchemaStore.getState().validateSchema(schema);
            // DO NOT set current schema here - validation should not populate output
          }
        } catch (e) {
          // Ignore parse errors here as syntax check passed
        }
      }

      // Show success dialog
      setShowValidationDialog(true);
    } catch (error: any) {
      setIsInputValid(false);

      // Check if this is an already enhanced schema
      if (error.response?.data?.isEnhancedSchema) {
        const backendError = error.response.data;
        const metadata = backendError.metadata || {};

        setValidationError(
          backendError.details || "This is already an enhanced schema",
        );

        onStageUpdate?.("Input Validation", "error");

        toast.error("Already Enhanced Schema Detected", {
          description: `Enhanced ${metadata.enhancementCount || 1} time(s) using ${metadata.model || "AI"}. Please use the original raw schema instead.`,
          duration: 6000,
        });

        setShowValidationDialog(true);
        throw error;
      }

      // Check if this is a syntax validation error from backend
      if (
        error.response?.data?.syntaxErrors ||
        error.response?.data?.formatMismatch
      ) {
        const backendError = error.response.data;

        // Format detailed error message
        let errorMessage = "";

        if (backendError.formatMismatch) {
          errorMessage = backendError.formatMismatch.message;
        } else if (
          backendError.syntaxErrors &&
          backendError.syntaxErrors.length > 0
        ) {
          const firstError = backendError.syntaxErrors[0];
          errorMessage = firstError.message;

          // Add location info if available
          if (firstError.line) {
            errorMessage += ` (Line ${firstError.line}`;
            if (firstError.column) {
              errorMessage += `, Column ${firstError.column}`;
            }
            errorMessage += ")";
          }
        }

        setValidationError(errorMessage || "Syntax validation failed");
      } else {
        // Other errors
        setValidationError(
          error.response?.data?.message || error.message || "Validation failed",
        );
      }

      onStageUpdate?.("Input Validation", "error");

      toast.error("Validation Failed", {
        description: "Click to see details",
        duration: 3000,
      });

      // Show validation dialog with error
      setShowValidationDialog(true);

      // Re-throw so automated workflow can catch it
      throw error;
    } finally {
      setValidateLoading(false);
    }
  }, [editorValue, format, schemaName, clearError, onStageUpdate]);

  // 2. Convert to JSON Schema
  const handleConvert = useCallback(async () => {
    if (!editorValue.trim()) {
      const error = new Error("Please enter and validate your schema first");
      toast.error("Please enter and validate your schema first");
      throw error;
    }

    // Check if schema name is provided
    if (!schemaName || !schemaName.trim()) {
      const error = new Error("Please enter a schema name before conversion");
      toast.error("Please enter a schema name before conversion");
      throw error;
    }

    clearError();
    setConvertLoading(true);
    onStageUpdate?.("Schema Conversion", "loading");
    try {
      // Convert and get the schema back
      const schema = await convertSchema(editorValue, format);

      // Use manually entered schema name
      if (schema) {
        schema.title = schemaName.trim();
        setCurrentSchema(schema);
      }

      toast.success("Schema converted to JSON Schema successfully!");
      onStageUpdate?.("Schema Conversion", "complete");

      // Trigger semantic validation on the converted schema
      if (schema) {
        await useSchemaStore.getState().validateSchema(schema);
      }
    } catch (error: any) {
      // Check if this is an already enhanced schema
      if (error.response?.data?.isEnhancedSchema) {
        const backendError = error.response.data;
        const metadata = backendError.metadata || {};

        toast.error("Already Enhanced Schema Detected", {
          description: `Enhanced ${metadata.enhancementCount || 1} time(s) using ${metadata.model || "AI"}. Please use the original raw schema instead.`,
          duration: 6000,
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to convert schema",
        );
      }
      onStageUpdate?.("Schema Conversion", "error");

      // Re-throw so automated workflow can catch it
      throw error;
    } finally {
      setConvertLoading(false);
    }
  }, [
    editorValue,
    format,
    schemaName,
    convertSchema,
    clearError,
    onStageUpdate,
    setCurrentSchema,
  ]);

  // Quick Fix - Apply syntax corrections
  const handleAIFix = useCallback(async () => {
    if (!editorValue) {
      toast.error("No code to fix");
      return;
    }

    toast.loading("Applying quick fix...");

    try {
      // Call backend quick fix API
      const response = await schemaApi.quickFixSyntax({
        input: editorValue,
        format,
      });

      if (response.data.fixedInput) {
        // Update editor with fixed code
        setEditorValue(response.data.fixedInput);

        toast.dismiss();

        // Show different message based on confidence
        const confidenceMessage =
          response.data.confidence === "deterministic"
            ? "Fixed automatically"
            : "Fixed using Quick Fix";

        toast.success("Syntax errors fixed!", {
          description: confidenceMessage,
        });

        // Close validation dialog
        setShowValidationDialog(false);
        setValidationError("");
        setIsInputValid(true);
      } else {
        toast.dismiss();
        toast.error("Could not automatically fix syntax", {
          description: "Please fix manually",
        });
      }
    } catch (error: any) {
      toast.dismiss();

      // Check if this is a "cannot fix" error
      const errorMessage = error.response?.data?.message || "";

      if (errorMessage.includes("Could not automatically fix")) {
        toast.error("Cannot auto-fix this format", {
          description:
            format === "xml"
              ? "XML syntax is too complex to auto-fix. Please correct manually."
              : "This syntax error is too complex to fix automatically.",
        });
      } else {
        toast.error("Quick fix failed", {
          description: error.response?.data?.message || "Unable to apply fixes",
        });
      }
    }
  }, [editorValue, format]);

  // 3. AI Enhance
  const handleEnhance = useCallback(
    async (providedSchema?: any) => {
      // Use provided schema (from automated workflow) or fall back to displaySchema (manual mode)
      const targetSchema = providedSchema || displaySchema;

      if (!targetSchema) {
        const error = new Error("No schema to enhance");
        toast.error("No schema to enhance");
        throw error;
      }

      // ✅ Check enhancement limit (max 2 times)
      // IMPORTANT: Check the schema that will actually be sent to backend
      const schemaToCheck =
        suggestions && suggestions.length > 0 && baseSchema
          ? baseSchema
          : targetSchema;

      console.log("[DEBUG] Checking enhancement count:", {
        schemaToCheck: schemaToCheck?.["x-formsync-metadata"],
        targetSchema: targetSchema?.["x-formsync-metadata"],
        baseSchema: baseSchema?.["x-formsync-metadata"],
        hasSuggestions: suggestions && suggestions.length > 0,
      });

      const metadata = schemaToCheck["x-formsync-metadata"];
      const enhancementCount = metadata?.enhancementCount || 0;

      console.log("[DEBUG] Enhancement count check:", {
        enhancementCount,
        metadata,
      });

      if (enhancementCount >= 2) {
        const error = new Error(
          "The schema is already enhanced two times and can't enhance to stop over-optimization",
        );
        toast.error("Cannot enhance schema", {
          description:
            "The schema is already enhanced two times and can't be enhanced further to stop over-optimization.",
          duration: 5000,
        });
        throw error;
      }

      // ✅ FIX: If schema already has suggestions, use baseSchema to avoid losing them
      // This prevents suggestions from disappearing when clicking enhance again
      const schemaToEnhance =
        suggestions && suggestions.length > 0 && baseSchema
          ? baseSchema
          : targetSchema;

      // Log for debugging
      if (suggestions && suggestions.length > 0) {
        console.log(
          "[TechnicalEditor] Re-enhancing with baseSchema to preserve existing suggestions",
        );
      }

      clearError();
      setEnhanceLoading(true);
      onStageUpdate?.("AI Enhancement", "loading");
      try {
        await enhanceSchema(schemaToEnhance);

        // Read fresh suggestions count directly from store after update
        const freshSuggestions = useSchemaStore.getState().suggestions || [];
        const pendingCount = freshSuggestions.filter((s) => !s.applied).length;

        if (pendingCount > 0) {
          toast.success(
            `${pendingCount} AI suggestion${pendingCount > 1 ? "s" : ""} ready!`,
            {
              description: "Review and apply them in the suggestions panel.",
            },
          );
          setShowSuggestions(true);
        } else {
          toast.info("Enhancement complete", {
            description:
              "No new suggestions — your schema already looks great!",
          });
        }

        onStageUpdate?.("AI Enhancement", "complete");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to enhance schema";
        toast.error("Enhancement failed", {
          description: errorMessage,
        });
        onStageUpdate?.("AI Enhancement", "error");
        throw error; // Re-throw so automated workflow can catch it
      } finally {
        setEnhanceLoading(false);
      }
    },
    [
      displaySchema,
      baseSchema,
      suggestions,
      enhanceSchema,
      clearError,
      onStageUpdate,
    ],
  );

  // One-click automated workflow - Validate → Convert → Enhance → Apply All Suggestions
  const handleAutomatedWorkflow = useCallback(async () => {
    if (autoWorkflowRunning || !editorValue.trim()) {
      return;
    }

    setAutoWorkflowRunning(true);
    let enhancementSucceeded = false;

    try {
      toast.info("🚀 Starting automated workflow...", {
        description: "Step 1 of 4: Validating...",
        duration: 2000,
      });

      // Step 1: Validate
      try {
        await handleValidate();
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (error) {
        toast.error("Workflow stopped", {
          description: "Validation failed. Please fix errors and try again.",
        });
        return;
      }

      toast.info("⚙️ Processing...", {
        description: "Step 2 of 4: Converting to JSON Schema...",
        duration: 2000,
      });

      // Step 2: Convert
      try {
        await handleConvert();
        // Wait longer for state to update
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Wait for displaySchema to be available in the store (max 3 seconds)
        let waitCount = 0;
        let currentSchema = useSchemaStore.getState().currentSchema;
        while (!currentSchema && waitCount < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          currentSchema = useSchemaStore.getState().currentSchema;
          waitCount++;
        }

        if (!currentSchema) {
          throw new Error(
            "Schema not available after conversion. Please try again.",
          );
        }
      } catch (error) {
        toast.error("Workflow stopped", {
          description:
            error instanceof Error ? error.message : "Conversion failed.",
        });
        return;
      }

      toast.info("🤖 AI Processing...", {
        description: "Step 3 of 4: AI Enhancement...",
        duration: 2000,
      });

      // Step 3: Enhance
      try {
        // Get the schema from the store and pass it directly to handleEnhance
        const schemaToEnhance = useSchemaStore.getState().currentSchema;
        await handleEnhance(schemaToEnhance);
        enhancementSucceeded = true;
        // Wait longer for suggestions to be generated
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Wait for suggestions to be available in the store (max 3 seconds)
        let waitCount = 0;
        let currentSuggestions = useSchemaStore.getState().suggestions || [];
        while (currentSuggestions.length === 0 && waitCount < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          currentSuggestions = useSchemaStore.getState().suggestions || [];
          waitCount++;
        }
      } catch (error: any) {
        console.log("Enhancement failed:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred";

        // Show the actual error reason
        toast.error("Auto enhancement failed", {
          description: `Reason: ${errorMessage}`,
          duration: 4000,
        });

        // Continue to step 4 even if enhancement fails
      }

      toast.info("✨ Finalizing...", {
        description: "Step 4 of 4: Auto-applying all suggestions...",
        duration: 2000,
      });

      // Step 4: Auto-apply ALL suggestions
      const currentSuggestions = useSchemaStore.getState().suggestions || [];
      const unappliedSuggestions = currentSuggestions.filter((s) => !s.applied);

      if (unappliedSuggestions.length > 0) {
        let appliedCount = 0;

        for (const suggestion of unappliedSuggestions) {
          try {
            await applySuggestion(suggestion, "apply");
            appliedCount++;
            await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay between applies
          } catch (error) {
            console.error("Failed to apply suggestion:", suggestion.id, error);
          }
        }

        const enhancedText = enhancementSucceeded ? "enhanced, and" : "and";
        toast.success("Automated workflow complete!", {
          description: `Schema validated, converted, ${enhancedText} ${appliedCount} suggestion${appliedCount !== 1 ? "s" : ""} applied automatically.`,
          duration: 5000,
        });

        // Auto-show quality metrics
        setShowQualityMetrics(true);
      } else {
        const statusText = enhancementSucceeded
          ? "Schema validated, converted, and enhanced. No suggestions to apply."
          : "Schema validated and converted. No suggestions to apply.";

        toast.success("Automated workflow complete!", {
          description: statusText,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Automated workflow error:", error);
      toast.error("Workflow encountered an error");
    } finally {
      setAutoWorkflowRunning(false);
    }
  }, [
    editorValue,
    autoWorkflowRunning,
    handleValidate,
    handleConvert,
    handleEnhance,
    applySuggestion,
  ]);

  // Handle suggestion apply/undo
  const handleSuggestionAction = useCallback(
    async (
      suggestion: any,
      action: "apply" | "undo",
    ): Promise<number | undefined> => {
      try {
        const scoreDelta = await applySuggestion(suggestion, action);
        return scoreDelta;
      } catch (error) {
        throw error;
      }
    },
    [applySuggestion],
  );

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousIndex = historyIndex - 1;
      const previousEntry = history[previousIndex];

      isUndoRedoAction.current = true;
      setEditorValue(previousEntry.content);
      setHistoryIndex(previousIndex);
      isUndoRedoAction.current = false;

      toast.success("Undone");
    } else {
      toast.info("Nothing to undo");
    }
  }, [history, historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextEntry = history[nextIndex];

      isUndoRedoAction.current = true;
      setEditorValue(nextEntry.content);
      setHistoryIndex(nextIndex);
      isUndoRedoAction.current = false;

      toast.success("Redone");
    } else {
      toast.info("Nothing to redo");
    }
  }, [history, historyIndex]);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.yaml,.yml,.xml";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setEditorValue(content);

        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "yaml" || ext === "yml") setFormat("yaml");
        else if (ext === "xml") setFormat("xml");
        else setFormat("json");

        toast.success("File uploaded");
      };
      reader.readAsText(file);
    };

    input.click();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleConvert();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleConvert]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Schema Name — Hero Field */}
      <div className="w-full">
        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-500 mb-2">
          Schema Name
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
            <FileText className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="e.g., User Registration Form, Contact Schema"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all shadow-sm"
          />
        </div>
        <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
          Give your schema a descriptive name — used across all generated code
          files.
        </p>
      </div>

      {/* Header Row: Format Selector (Left) + Next: Form Builder Button (Right) */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        {/* Left: Format Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-500 mb-2">
            Input Format
          </label>
          <FormatSelector selected={format} onChange={setFormat} />
        </div>

        {/* Right: Next: Form Builder Button - Shows after AI Enhancement completes, or immediately if schema was loaded from a saved template */}
        {onNextToFormBuilder &&
          (isLoadedFromTemplate ||
            (stages.length > 0 && stages[3]?.status === "complete")) && (
            <div className="flex items-end">
              <Button
                onClick={onNextToFormBuilder}
                size="lg"
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl text-white px-8 py-3 text-base font-semibold rounded-xl transition-all hover:scale-105"
              >
                <Sparkles className="h-5 w-5" />
                Next: Form Builder
              </Button>
            </div>
          )}
      </div>

      {/* Processing Mode Selector */}
      <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-00 mb-1 tracking-tight">
                Processing Mode
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {workflowMode === "manual"
                  ? "Run each step individually — validate, convert, and enhance at your own pace."
                  : "Let the system handle all stages automatically: validate, convert, enhance, and apply."}
              </p>
            </div>
            {/* Animated toggle pill */}
            <div
              className="relative flex items-center p-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer select-none"
              style={{ minWidth: "168px" }}
            >
              <motion.span
                layout
                layoutId="mode-pill"
                className="absolute top-1 bottom-1 rounded-full bg-white dark:bg-neutral-700 shadow"
                style={{
                  width: "50%",
                  left: workflowMode === "manual" ? "4px" : "calc(50% - 4px)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <button
                onClick={() => setWorkflowMode("manual")}
                className={`relative z-10 flex-1 text-center text-xs font-medium py-1.5 rounded-full transition-colors ${
                  workflowMode === "manual"
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setWorkflowMode("automated")}
                className={`relative z-10 flex-1 text-center text-xs font-medium py-1.5 rounded-full transition-colors ${
                  workflowMode === "automated"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                }`}
              >
                Automated
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Section */}
      <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {workflowMode === "manual" ? "Actions" : "Automated Workflow"}
            </h3>
            <Badge
              variant="outline"
              className="text-xs font-medium px-2.5 py-1 border-neutral-200 dark:border-neutral-700 text-neutral-500"
            >
              {workflowMode === "manual" ? "Manual" : "Automated"}
            </Badge>
          </div>
          {workflowMode === "manual" ? (
            <div className="flex gap-2 flex-wrap">
              {/* 1. Validate Input Format */}
              <Button
                onClick={handleValidate}
                size="lg"
                disabled={validateLoading}
                variant="outline"
                className="gap-2 border-2 hover:bg-green-50 dark:hover:bg-green-950/20"
              >
                {validateLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold">
                      Validating...
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold">
                      Validate
                    </span>
                  </>
                )}
              </Button>

              {/* 2. Convert to JSON Schema */}
              <Button
                onClick={handleConvert}
                size="lg"
                disabled={convertLoading || !isInputValid}
                variant="outline"
                className="gap-2 border-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                {convertLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                      Converting...
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                      Convert
                    </span>
                  </>
                )}
              </Button>

              {/* 3. AI Enhance */}
              <Button
                onClick={() => handleEnhance()}
                size="lg"
                disabled={enhanceLoading || !displaySchema}
                variant="outline"
                className="gap-2 border-2 hover:bg-purple-50 dark:hover:bg-purple-950/20"
              >
                {enhanceLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                      Enhancing...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                      AI Enhance
                    </span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Workflow Pipeline */}
              <div className="relative">
                {/* Connection Line */}
                <div
                  className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700"
                  style={{ zIndex: 0 }}
                />

                <div
                  className="grid grid-cols-4 gap-0 relative"
                  style={{ zIndex: 1 }}
                >
                  {/* Step 1: Validate */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center mb-2 shadow-sm">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        1
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      Validate
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-500 text-center">
                      Syntax check
                    </div>
                  </div>

                  {/* Step 2: Convert */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center mb-2 shadow-sm">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        2
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      Convert
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-500 text-center">
                      JSON Schema
                    </div>
                  </div>

                  {/* Step 3: Enhance */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center mb-2 shadow-sm">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        3
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      Enhance
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-500 text-center">
                      AI optimization
                    </div>
                  </div>

                  {/* Step 4: Apply */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center mb-2 shadow-sm">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        4
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      Apply
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-500 text-center">
                      Auto-apply
                    </div>
                  </div>
                </div>
              </div>

              {/* Execute Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleAutomatedWorkflow}
                  size="lg"
                  disabled={autoWorkflowRunning || !editorValue.trim()}
                  className="gap-2.5 bg-white dark:bg-neutral-900 border border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 font-semibold px-8 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-none"
                >
                  {autoWorkflowRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing Workflow...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Execute Automated Workflow
                    </>
                  )}
                </Button>
              </div>

              {/* Info Notice */}
              <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
                This workflow automatically processes your schema through all
                stages. Monitor progress through status notifications.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content - Sidebar + Editors */}
      <div className="flex-1 flex gap-4 min-h-[800px] relative">
        {/* Left Sidebar - Quick Actions (positioned to not affect layout) */}
        <Card
          className={`flex flex-col gap-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 transition-all duration-300 flex-shrink-0 ${sidebarExpanded ? "w-48" : "w-14"}`}
        >
          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full flex items-center justify-center gap-2 mb-2 h-12 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {sidebarExpanded ? (
              <>
                <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-300 flex-shrink-0" />
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                  Collapse
                </span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4 text-neutral-700 dark:text-neutral-200 flex-shrink-0" />
            )}
          </button>

          <div className="border-t border-neutral-300 dark:border-neutral-700 mb-2" />

          {/* Upload */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFileUpload}
            className={`w-full justify-start gap-3 h-10 ${!sidebarExpanded && "px-2"}`}
            title={!sidebarExpanded ? "Upload File" : undefined}
          >
            <Upload className="h-4 w-4 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Upload</span>}
          </Button>

          {/* Schema Navigator */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTreeView(!showTreeView)}
            className={`w-full justify-start gap-3 h-10 ${!sidebarExpanded && "px-2"}`}
            title={!sidebarExpanded ? "Schema Navigator" : undefined}
          >
            <TreePine className="h-4 w-4 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Navigator</span>}
          </Button>

          {/* AI Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestions(true)}
              className={`w-full justify-start gap-3 h-10 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 relative ${!sidebarExpanded && "px-2"}`}
              title={!sidebarExpanded ? "View AI Suggestions" : undefined}
            >
              <Sparkles className="h-4 w-4 flex-shrink-0 text-purple-600" />
              {sidebarExpanded && (
                <span className="text-sm">AI Suggestions</span>
              )}
              <Badge className="absolute -top-1 -right-1 bg-purple-600 text-white px-1.5 py-0.5 text-xs">
                {suggestions.length}
              </Badge>
            </Button>
          )}

          {/* Quality Score */}
          {qualityMetrics && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQualityMetrics(true)}
              className={`w-full justify-start gap-3 h-10 border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 relative ${!sidebarExpanded && "px-2"}`}
              title={
                !sidebarExpanded
                  ? `Quality Score: ${qualityMetrics.qualityScore}`
                  : undefined
              }
            >
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
              {sidebarExpanded && (
                <span className="text-sm">Quality Score</span>
              )}
              <Badge className="absolute -top-1 -right-1 bg-green-600 text-white px-1.5 py-0.5 text-xs font-bold">
                {qualityMetrics.qualityScore}
              </Badge>
            </Button>
          )}

          <div className="border-t border-neutral-300 dark:border-neutral-700 my-2" />

          {/* Undo */}
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`w-full justify-start gap-3 h-10 ${!sidebarExpanded && "px-2"}`}
            title={!sidebarExpanded ? "Undo" : undefined}
          >
            <Undo2 className="h-4 w-4 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Undo</span>}
          </Button>

          {/* Redo */}
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`w-full justify-start gap-3 h-10 ${!sidebarExpanded && "px-2"}`}
            title={!sidebarExpanded ? "Redo" : undefined}
          >
            <Redo2 className="h-4 w-4 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Redo</span>}
          </Button>
        </Card>

        {/* Editors Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Left Panel - Input */}
          <Card className="flex flex-col border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
            <CardHeader className="border-b border-neutral-200 dark:border-neutral-800 py-3 px-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <CardTitle className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Input{" "}
                  <span className="text-neutral-400 dark:text-neutral-500 font-normal">
                    ({format.toUpperCase()})
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Editor
                height="100%"
                language={
                  format === "xml" ? "xml" : format === "yaml" ? "yaml" : "json"
                }
                value={editorValue}
                onChange={handleEditorChange}
                theme="vs-dark"
                onMount={(editor, monaco) => {
                  // Add keyboard shortcuts
                  editor.addAction({
                    id: "enhance-schema",
                    label: "Enhance Schema with AI",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
                    run: () => {
                      if (!enhanceLoading && displaySchema) {
                        handleEnhance();
                      }
                    },
                  });

                  editor.addAction({
                    id: "format-document",
                    label: "Format Document",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
                    run: () => {
                      editor.getAction("editor.action.formatDocument")?.run();
                    },
                  });

                  editor.addAction({
                    id: "validate-input",
                    label: "Validate Input",
                    keybindings: [
                      monaco.KeyMod.CtrlCmd |
                        monaco.KeyMod.Shift |
                        monaco.KeyCode.KeyV,
                    ],
                    run: () => {
                      if (!validateLoading) {
                        handleValidate();
                      }
                    },
                  });
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </CardContent>
          </Card>

          {/* Right Panel - Output */}
          <Card className="flex flex-col border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
            <CardHeader className="border-b border-neutral-200 dark:border-neutral-800 py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${displaySchema ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
                  />
                  <CardTitle className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    JSON Schema{" "}
                    <span className="text-neutral-400 dark:text-neutral-500 font-normal">
                      (Output)
                    </span>
                  </CardTitle>
                </div>
                {displaySchema && (
                  <Badge variant="success" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {displaySchema ? (
                <Editor
                  height="100%"
                  language="json"
                  value={JSON.stringify(displaySchema, null, 2)}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <FileJson className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      No output yet
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      Converted schema will appear here
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Suggestions Dialog */}
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
          >
            <SuggestionsPanel
              suggestions={suggestions}
              onApplySuggestion={handleSuggestionAction}
              onClose={() => setShowSuggestions(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Tree View Slide-in */}
      <AnimatePresence>
        {showTreeView && displaySchema && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-neutral-900 shadow-2xl z-50 overflow-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Schema Navigator</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTreeView(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SchemaTreeView schema={displaySchema} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quality Metrics Panel */}
      {showQualityMetrics && qualityMetrics && (
        <QualityMetricsPanel
          metrics={qualityMetrics}
          onClose={() => setShowQualityMetrics(false)}
        />
      )}

      {/* Validation Results Dialog */}
      {showValidationDialog && (
        <ValidationDialog
          results={validationResults?.issues || []}
          onClose={() => setShowValidationDialog(false)}
          formatError={validationError}
          isSuccess={isInputValid}
          onAIFix={handleAIFix}
        />
      )}
    </div>
  );
};
