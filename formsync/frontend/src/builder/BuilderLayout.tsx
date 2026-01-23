import React, { useState } from "react";
import { LeftPanel } from "./LeftPanel";
import { Canvas } from "./Canvas";
import { RightPanel } from "./RightPanel";
import { WizardControls } from "./WizardControls";
import { useBuilder } from "../context/BuilderContext";
import { exportReactApp } from "./export-handler";
import { FlowDiagram, GenerationStage } from "./FlowDiagram";
import { Sparkles, Undo2 } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/button";

export const BuilderLayout: React.FC = () => {
  const { state, dispatch, canUndo } = useBuilder();
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [stages, setStages] = useState<GenerationStage[]>([
    { name: "Enter Schema", status: "complete", progress: 100 },
    { name: "Input Validation", status: "complete", progress: 100 },
    { name: "Schema Conversion", status: "complete", progress: 100 },
    { name: "AI Enhancement", status: "complete", progress: 100 },
    { name: "Frontend Generation", status: "pending", progress: 0 },
    { name: "Backend Generation", status: "pending", progress: 0 },
    { name: "DTO Generation", status: "pending", progress: 0 },
    { name: "Test Generation", status: "pending", progress: 0 },
  ]);

  const isFrontendComplete =
    stages.find((s) => s.name === "Frontend Generation")?.status === "complete";

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportReactApp(state.form);
      setStages((prev) =>
        prev.map((s) =>
          s.name === "Frontend Generation"
            ? { ...s, status: "complete", progress: 100 }
            : s,
        ),
      );
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setStages((prev) =>
        prev.map((s) =>
          s.name === "Frontend Generation" ? { ...s, status: "error" } : s,
        ),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      for (let i = 5; i <= 6; i++) {
        setStages((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "loading", progress: 0 } : s,
          ),
        );
        for (let p = 0; p <= 100; p += 25) {
          await new Promise((r) => setTimeout(r, 200));
          setStages((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, progress: p } : s)),
          );
        }
        setStages((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "complete", progress: 100 } : s,
          ),
        );
      }
      const dest = state.schemaId
        ? `/generated?schemaId=${state.schemaId}`
        : "/generated";
      window.location.href = dest;
    } catch {
      alert("Generation failed. Please try again.");
      setStages((prev) =>
        prev.map((s, idx) => (idx >= 5 ? { ...s, status: "error" } : s)),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="builder-root">
      {/* ── Shared Navbar (identical to editor page) ── */}
      <Navbar />

      {/* ── Progress stepper sub-bar ── */}
      <div className="builder-stepper-bar">
        {/* Left gutter — matches the left panel width (240px) */}
        <div className="builder-stepper-gutter" />

        {/* Stepper centered within the canvas column */}
        <div className="builder-stepper-content">
          {/* Right-side action pills */}
          <div className="builder-stepper-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "UNDO" })}
              disabled={!canUndo}
              className="gap-1.5 text-neutral-500 h-8 px-3 text-xs"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </Button>

            {!isFrontendComplete ? (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="btn-primary"
                style={{ fontSize: "0.78rem", padding: "0.35rem 0.9rem" }}
              >
                <Sparkles size={14} />
                {isExporting ? "Exporting…" : "Export React App"}
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary"
                style={{ fontSize: "0.78rem", padding: "0.35rem 0.9rem" }}
              >
                <Sparkles size={14} />
                {isGenerating ? "Generating…" : "Generate Code"}
              </button>
            )}
          </div>

          {/* Step flow — occupies remaining width, centered */}
          <div className="builder-stepper-flow">
            <FlowDiagram stages={stages} />
          </div>
        </div>

        {/* Right gutter — matches the right panel width (288px) */}
        <div className="builder-stepper-gutter builder-stepper-gutter--right" />
      </div>

      {/* ── 3-col body ── */}
      <div className="builder-body">
        <aside className="builder-sidebar builder-sidebar--left">
          <LeftPanel />
        </aside>

        <main className="builder-canvas-col">
          <div className="wizard-bar">
            <WizardControls />
          </div>
          <div className="canvas-wrapper">
            <Canvas />
          </div>
        </main>

        <aside className="builder-sidebar builder-sidebar--right">
          <RightPanel />
        </aside>
      </div>
    </div>
  );
};
