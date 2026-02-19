/**
 * AI Suggestions Panel Component
 *
 * Displays AI-generated suggestions with apply / undo functionality
 * Integrates with the suggestion-driven enhancement model
 */

import React, { useState } from 'react';
import {
  Check,
  X,
  Sparkles,
  Undo,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Shield,
  Accessibility,
  Target,
  Layers,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

/* -------------------- Types -------------------- */

export interface SchemaSuggestion {
  id: string;
  path: string;
  category: 'validation' | 'accessibility' | 'structure' | 'metadata';
  rule: Record<string, any>;
  description: string;
  applied: boolean;
  impactedDimensions?: string[];
  estimatedImpact?: number;
}

interface SuggestionsPanelProps {
  suggestions: SchemaSuggestion[];
  onApplySuggestion: (
    suggestion: SchemaSuggestion,
    action: 'apply' | 'undo'
  ) => Promise<number | undefined>;
  onClose?: () => void;
  loading?: boolean;
}

/* -------------------- Helpers -------------------- */

const CATEGORY_CONFIG: Record<string, { bg: string; text: string; border: string; bar: string; iconBg: string; appliedBg: string; appliedBorder: string }> = {
  validation:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    bar: 'bg-blue-500',    iconBg: 'bg-blue-100',    appliedBg: 'bg-blue-50/70',    appliedBorder: 'border-blue-200' },
  accessibility: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', iconBg: 'bg-emerald-100', appliedBg: 'bg-emerald-50/70', appliedBorder: 'border-emerald-200' },
  structure:     { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  bar: 'bg-indigo-500',  iconBg: 'bg-indigo-100',  appliedBg: 'bg-indigo-50/70',  appliedBorder: 'border-indigo-200' },
  metadata:      { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  bar: 'bg-orange-500',  iconBg: 'bg-orange-100',  appliedBg: 'bg-orange-50/70',  appliedBorder: 'border-orange-200' },
};

const getCategoryConfig = (category: string) =>
  CATEGORY_CONFIG[category] ?? { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200', bar: 'bg-neutral-400', iconBg: 'bg-neutral-200', appliedBg: 'bg-neutral-50', appliedBorder: 'border-neutral-200' };

const getCategoryIcon = (category: string) => {
  const cls = 'h-3.5 w-3.5';
  switch (category) {
    case 'validation':    return <Shield className={cls} />;
    case 'accessibility': return <Accessibility className={cls} />;
    case 'structure':     return <Target className={cls} />;
    default:              return <Layers className={cls} />;
  }
};

const formatRule = (rule: Record<string, any>) =>
  Object.entries(rule)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');

/* -------------------- Component -------------------- */

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
  onApplySuggestion,
  onClose,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  if (!suggestions.length) return null;

  const applied = suggestions.filter((s) => s.applied);
  const pending = suggestions.filter((s) => !s.applied);

  const grouped = suggestions.reduce<Record<string, SchemaSuggestion[]>>((acc, s) => {
    acc[s.category] ||= [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleApplyUndo = async (s: SchemaSuggestion) => {
    const action = s.applied ? 'undo' : 'apply';
    setProcessingId(s.id);

    try {
      const delta = await onApplySuggestion(s, action);
      if (delta !== undefined) {
        toast.success(
          `${action === 'apply' ? 'Applied' : 'Undone'} • Score ${delta > 0 ? '+' : ''}${delta}`
        );
      }
    } catch {
      toast.error(`Failed to ${action} suggestion`);
    } finally {
      setProcessingId(null);
    }
  };

  const applyAll = async () => {
    if (!pending.length) return toast.info('No pending suggestions');
    setBulkProcessing(true);

    let total = 0;
    for (const s of pending) {
      try {
        const delta = await onApplySuggestion(s, 'apply');
        if (delta) total += delta;
      } catch (error) {
        console.error('Failed to apply suggestion:', s.id, error);
      }
    }

    toast.success(`Applied ${pending.length} suggestions (+${total.toFixed(1)})`);
    setBulkProcessing(false);
  };

  const undoAll = async () => {
    if (!applied.length) return toast.info('No applied suggestions');
    setBulkProcessing(true);

    let total = 0;
    for (const s of applied) {
      try {
        const delta = await onApplySuggestion(s, 'undo');
        if (delta) total += delta;
      } catch (error) {
        console.error('Failed to undo suggestion:', s.id, error);
      }
    }

    toast.success(`Undone ${applied.length} suggestions (${total.toFixed(1)})`);
    setBulkProcessing(false);
  };

  const appliedPct = suggestions.length > 0 ? Math.round((applied.length / suggestions.length) * 100) : 0;

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col" style={{ maxHeight: '88vh' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">AI Suggestions</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {applied.length} of {suggestions.length} applied
            </p>
          </div>
        </div>

        {/* Progress + Actions */}
        <div className="flex items-center gap-3">
          {/* Mini progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${appliedPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-semibold text-neutral-500">{appliedPct}%</span>
          </div>

          {pending.length > 0 && (
            <button
              onClick={applyAll}
              disabled={bulkProcessing || loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              {bulkProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Apply All
            </button>
          )}
          {applied.length > 0 && (
            <button
              onClick={undoAll}
              disabled={bulkProcessing || loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              <Undo className="h-3.5 w-3.5" />
              Undo All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category Sections ──────────────────────────────────── */}
      <div className="overflow-y-auto flex-1 p-6 space-y-6">
        {Object.entries(grouped).map(([category, list]) => {
          const cfg = getCategoryConfig(category);
          const catApplied = list.filter((s) => s.applied).length;

          return (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-md ${cfg.iconBg} ${cfg.text} flex items-center justify-center`}>
                    {getCategoryIcon(category)}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 capitalize">{category}</h3>
                </div>
                <span className="text-xs text-neutral-400">{catApplied}/{list.length} applied</span>
              </div>

              <AnimatePresence initial={false}>
                {list.map((s) => {
                  const open = expanded.has(s.id);
                  const busy = processingId === s.id;
                  const scfg = getCategoryConfig(s.category);

                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mb-2.5 rounded-xl border overflow-hidden transition-colors ${
                        s.applied
                          ? `${scfg.appliedBorder} ${scfg.appliedBg}`
                          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850'
                      }`}
                    >
                      {/* Left accent bar */}
                      <div className="flex">
                        <div className={`w-1 flex-shrink-0 ${scfg.bar} rounded-l-xl`} />

                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-3">
                            {/* Left: info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${scfg.bg} ${scfg.text} ${scfg.border}`}>
                                  {getCategoryIcon(s.category)}
                                  {s.category}
                                </span>
                                {s.applied && (
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${scfg.iconBg} ${scfg.text} ${scfg.border}`}>
                                    <Check className="h-3 w-3" /> Applied
                                  </span>
                                )}
                                {s.estimatedImpact !== undefined && s.estimatedImpact > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                    <TrendingUp className="h-3 w-3" />+{s.estimatedImpact} pts
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-snug">{s.description}</p>
                              <p className="text-[11px] font-mono text-neutral-400 mt-1 truncate">{s.path}</p>
                            </div>

                            {/* Right: actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => handleApplyUndo(s)}
                                disabled={busy || loading}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                                  s.applied
                                    ? 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                                }`}
                              >
                                {busy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : s.applied ? (
                                  <Undo className="h-3.5 w-3.5" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                {s.applied ? 'Undo' : 'Apply'}
                              </button>

                              <button
                                onClick={() => toggleExpand(s.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              >
                                {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Expand: rule detail */}
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">Rule Details</p>
                                  <pre className="text-[11px] font-mono bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-words">
                                    {formatRule(s.rule)}
                                  </pre>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between flex-shrink-0 bg-neutral-50 dark:bg-neutral-900/50">
        <p className="text-xs text-neutral-400">
          {pending.length > 0 ? `${pending.length} suggestion${pending.length > 1 ? 's' : ''} pending` : 'All suggestions applied'}
        </p>
        <p className="text-xs text-neutral-400">JSON Schema Draft-07</p>
      </div>
    </div>
  );
};
