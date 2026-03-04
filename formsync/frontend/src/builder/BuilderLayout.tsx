import React, { useState } from "react";
import { LeftPanel } from "./LeftPanel";
import { Canvas } from "./Canvas";
import { RightPanel } from "./RightPanel";
import { useBuilder } from "../context/BuilderContext";
import { exportReactApp } from "./export-handler";
import { FlowDiagram, GenerationStage } from "./FlowDiagram";
import { Sparkles } from "lucide-react";

export const BuilderLayout: React.FC = () => {
  const { state } = useBuilder();
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
      alert(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
      const generationStages = stages.slice(5, 7);
      for (let i = 0; i < generationStages.length; i++) {
        const stageIndex = i + 5;
        setStages((prev) =>
          prev.map((s, idx) =>
            idx === stageIndex ? { ...s, status: "loading", progress: 0 } : s,
          ),
        );
        for (let progress = 0; progress <= 100; progress += 25) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          setStages((prev) =>
            prev.map((s, idx) => (idx === stageIndex ? { ...s, progress } : s)),
          );
        }
        setStages((prev) =>
          prev.map((s, idx) =>
            idx === stageIndex
              ? { ...s, status: "complete", progress: 100 }
              : s,
          ),
        );
      }
      // Navigate within the same app (same port)
      const dest = state.schemaId
        ? `/generated?schemaId=${state.schemaId}`
        : "/generated";
      window.location.href = dest;
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Generation failed. Please try again.");
      setStages((prev) =>
        prev.map((s, idx) => (idx >= 5 ? { ...s, status: "error" } : s)),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="builder-layout">
      <LeftPanel />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "0 1rem" }}>
          <FlowDiagram stages={stages} />
        </div>
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Canvas />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          flex: 1,
        }}
      >
        {/* Persistent Export Toolbar */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.75rem",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #e5e7eb",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            alignItems: "center",
            minHeight: "60px",
          }}
        >
          {!isFrontendComplete ? (
            <button
              onClick={handleExport}
              disabled={isExporting}
              style={{
                background: "linear-gradient(to right, #4f46e5, #9333ea)",
                color: "white",
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                border: "none",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: isExporting ? "not-allowed" : "pointer",
                opacity: isExporting ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease-in-out",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <Sparkles size={20} />
              {isExporting ? "Exporting..." : "Export React App"}
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                background: "linear-gradient(to right, #4f46e5, #9333ea)",
                color: "white",
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                border: "none",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease-in-out",
                whiteSpace: "nowrap",
              }}
            >
              <Sparkles size={20} />
              {isGenerating ? "Generating..." : "Generate Code"}
            </button>
          )}
        </div>

        <RightPanel />
      </div>
    </div>
  );
};
