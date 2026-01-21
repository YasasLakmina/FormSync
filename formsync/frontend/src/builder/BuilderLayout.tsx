import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LeftPanel } from "./LeftPanel";
import { Canvas } from "./Canvas";
import { RightPanel } from "./RightPanel";
import { WizardControls } from "./WizardControls";
import { useBuilder } from "../context/BuilderContext";
import { exportReactApp } from "./export-handler";
import { FlowDiagram, GenerationStage } from "./FlowDiagram";
import {
  Sparkles, Undo2, Code2, BookOpen, User, LogOut, ChevronDown, Settings, Menu, X, LayoutTemplate,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";

export const BuilderLayout: React.FC = () => {
  const { state, dispatch, canUndo } = useBuilder();
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileDropdownOpen(false);
  };

  const avatarInitial = user ? (user.name || user.email)[0].toUpperCase() : "";
  const displayName = user ? user.name || user.email.split("@")[0] : "";

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportReactApp(state.form);
      setStages((prev) =>
        prev.map((s) =>
          s.name === "Frontend Generation" ? { ...s, status: "complete", progress: 100 } : s,
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
            idx === stageIndex ? { ...s, status: "complete", progress: 100 } : s,
          ),
        );
      }
      const dest = state.schemaId ? `/generated?schemaId=${state.schemaId}` : "/generated";
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

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/editor", label: "Schema Editor", icon: Code2 },
    { path: "/builder", label: "Form Builder", icon: LayoutTemplate },
    { path: "/documentation", label: "Documentation", icon: BookOpen },
  ];

  return (
    <div className="builder-root">
      {/* ── Navbar — identical style to the editor page ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-lg flex-shrink-0">
        <div className="px-4">
          <div className="flex h-16 items-center justify-between gap-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <img
                src="/logo.png"
                alt="FormSync Logo"
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.path} to={link.path}>
                    <Button
                      variant="ghost"
                      className={`gap-2 ${isActive(link.path)
                        ? "bg-purple-50 text-purple-600"
                        : "text-neutral-600 hover:text-purple-600"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Right: undo + export + auth */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Undo */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "UNDO" })}
                disabled={!canUndo}
                title="Undo"
                className="gap-1.5 text-neutral-600"
              >
                <Undo2 className="h-4 w-4" />
                <span className="hidden sm:inline">Undo</span>
              </Button>

              {/* Export / Generate */}
              {!isFrontendComplete ? (
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="btn-primary"
                >
                  <Sparkles size={15} />
                  {isExporting ? "Exporting…" : "Export React App"}
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary"
                >
                  <Sparkles size={15} />
                  {isGenerating ? "Generating…" : "Generate Code"}
                </button>
              )}

              {/* Auth section — mirror of Navbar */}
              <div className="flex items-center pl-3 border-l border-neutral-200">
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen((o) => !o)}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all duration-150 select-none ${profileDropdownOpen
                        ? "bg-purple-50 ring-1 ring-purple-200"
                        : "hover:bg-neutral-100"
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-sm font-semibold text-white shadow-sm flex-shrink-0">
                        {avatarInitial}
                      </div>
                      <div className="hidden sm:flex flex-col items-start leading-none">
                        <span className="text-sm font-medium text-neutral-800 max-w-[100px] truncate">{displayName}</span>
                        {user.name && (
                          <span className="text-[11px] text-neutral-400 max-w-[100px] truncate mt-0.5">{user.email}</span>
                        )}
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/60 overflow-hidden z-50">
                        <div className="px-4 py-3.5 bg-gradient-to-br from-purple-50 to-violet-50 border-b border-neutral-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-base font-bold text-white shadow-sm flex-shrink-0">
                              {avatarInitial}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-neutral-900 truncate">{displayName}</p>
                              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-1.5">
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors group"
                          >
                            <Settings className="h-4 w-4 text-neutral-400 group-hover:text-purple-500 transition-colors" />
                            <span>Account Settings</span>
                          </Link>
                        </div>
                        <div className="border-t border-neutral-100 p-1.5">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                          >
                            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" className="text-neutral-600">Sign in</Button>
                    </Link>
                    <Link to="/register">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 ml-1">
                        <User className="h-4 w-4" />
                        Get started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-2 ${isActive(link.path)
                          ? "bg-purple-50 text-purple-600"
                          : "text-neutral-600"
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Pipeline progress bar — full width, below navbar ── */}
      <div className="w-full bg-white border-b border-neutral-200 shadow-sm flex-shrink-0" style={{ overflowX: 'auto' }}>
        <FlowDiagram stages={stages} />
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
