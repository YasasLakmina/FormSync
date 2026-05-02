import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeftPanel } from "./LeftPanel";
import { Canvas } from "./Canvas";
import { RightPanel } from "./RightPanel";
import { WizardControls } from "./WizardControls";
import { useBuilder } from "../context/BuilderContext";
import { generationService } from "../services/generationService";
import {
  formModelToJsonSchema,
  validateBuilderJsonSchema,
} from "../types";
import { FlowDiagram } from "../components/shared/FlowDiagram";
import { Undo2 } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/button";

export const BuilderLayout: React.FC = () => {
  const { state, dispatch, canUndo } = useBuilder();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  type Stage = {
    name: string;
    status: "pending" | "loading" | "complete" | "error";
  };

  const [stages, setStages] = useState<Stage[]>([
    { name: "Enter Schema", status: "complete" },
    { name: "Input Validation", status: "complete" },
    { name: "Schema Conversion", status: "complete" },
    { name: "AI Enhancement", status: "complete" },
    { name: "Frontend Generation", status: "pending" },
    { name: "Backend Generation", status: "pending" },
    { name: "DTO Generation", status: "pending" },
    { name: "Test Generation", status: "pending" },
  ]);

  const markStage = (name: string, status: Stage["status"]) =>
    setStages((prev) =>
      prev.map((s) => (s.name === name ? { ...s, status } : s)),
    );

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Form builder preview is the frontend — show this step complete as soon as generation starts
      markStage("Frontend Generation", "complete");

      for (const name of ["Backend Generation", "DTO Generation"]) {
        markStage(name, "loading");
        await new Promise((r) => setTimeout(r, 600));
        markStage(name, "complete");
      }

      if (state.schemaId) {
        navigate(`/generated?schemaId=${state.schemaId}`, {
          state: { schema: synced },
        });
        return;
      }

      const result = generationService.generateFromSchema(synced);
      if (result.success && result.data) {
        navigate("/generated", {
          state: { generatedCode: result.data, schema: synced },
        });
        return;
      }

      navigate("/generated", { state: { schema: synced } });
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error
          ? e.message
          : "Generation failed. Please try again.",
      );
      setStages((prev) =>
        prev.map((s, i) => (i >= 4 ? { ...s, status: "error" } : s)),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="builder-root">
      {/* ── Shared navbar ── */}
      <Navbar />

      {/* ── Main 3-col body — panels flush to navbar ── */}
      <div className="builder-body">
        {/* ── Left: field palette ── */}
        <aside className="builder-sidebar builder-sidebar--left">
          <LeftPanel />
        </aside>

        {/* ── Center: stepper → wizard bar → canvas ── */}
        <main className="builder-canvas-col">
          {/* Progress stepper — contained in canvas column */}
          <div className="canvas-stepper">
            <FlowDiagram stages={stages} />
          </div>

          {/* Wizard controls + Undo on the same bar */}
          <div className="canvas-toolbar">
            <WizardControls />
            <div className="canvas-toolbar-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "UNDO" })}
                disabled={!canUndo}
                className="gap-1.5 text-neutral-500 h-7 px-2.5 text-xs"
                title="Undo"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo
              </Button>
            </div>
          </div>

          {/* Scrollable form canvas */}
          <div className="canvas-wrapper">
            <Canvas />
          </div>
        </main>

        {/* ── Right: theme / field settings ── */}
        <aside className="builder-sidebar builder-sidebar--right">
          <RightPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
        </aside>
      </div>
    </div>
  );
};
