/**
 * AI Suggestions Panel Component
 *
 * Displays AI-generated suggestions with apply / undo functionality
 * Integrates with the suggestion-driven enhancement model
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'validation':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'accessibility':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'structure':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'metadata':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
};

const getCategoryIcon = (category: string) => {
  const cls = 'h-4 w-4';
  switch (category) {
    case 'validation':
      return <Shield className={cls} />;
    case 'accessibility':
      return <Accessibility className={cls} />;
    case 'structure':
      return <Target className={cls} />;
    default:
      return <Sparkles className={cls} />;
  }
};

const formatRule = (rule: Record<string, any>) =>
  Object.entries(rule)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ');

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

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          <CardTitle>AI Suggestions</CardTitle>
          <span className="text-sm text-neutral-500">
            {applied.length}/{suggestions.length} applied
          </span>
        </div>

        <div className="flex gap-2">
          {pending.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={applyAll}
              disabled={bulkProcessing || loading}
              className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 dark:hover:bg-green-950/20 dark:hover:text-green-400 dark:hover:border-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Apply All
            </Button>
          )}
          {applied.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={undoAll}
              disabled={bulkProcessing || loading}
              className="border-neutral-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-neutral-300 dark:hover:bg-neutral-950/20 dark:hover:text-neutral-400 dark:hover:border-neutral-700"
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo All
            </Button>
          )}
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
        {Object.entries(grouped).map(([category, list]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded ${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
              </div>
              <h3 className="font-semibold capitalize">{category}</h3>
            </div>

            <AnimatePresence>
              {list.map((s) => {
                const open = expanded.has(s.id);
                const busy = processingId === s.id;

                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`border rounded-lg mb-3 ${s.applied ? 'bg-emerald-50' : 'bg-white'}`}
                  >
                    <div className="p-4 flex justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getCategoryColor(s.category)}>{s.category}</Badge>
                          {s.applied && <Badge variant="outline">Applied</Badge>}
                          {s.estimatedImpact && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />+{s.estimatedImpact}
                            </span>
                          )}
                        </div>
                        <p className="font-medium">{s.description}</p>
                        <p className="text-xs text-neutral-500 font-mono">{s.path}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApplyUndo(s)}
                          disabled={busy || loading}
                          variant="outline"
                          className={
                            s.applied
                              ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-300 dark:hover:bg-neutral-950/20 dark:hover:text-neutral-400 dark:hover:border-neutral-700'
                              : 'border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 dark:hover:bg-green-950/20 dark:hover:text-green-400 dark:hover:border-green-700'
                          }
                        >
                          {busy ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : s.applied ? (
                            <Undo className="h-4 w-4 " />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="ml-1">{s.applied ? 'Undo' : 'Apply'}</span>
                        </Button>

                        <Button size="icon" variant="ghost" onClick={() => toggleExpand(s.id)}>
                          {open ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {open && (
                      <div className="border-t p-4 bg-neutral-50">
                        <pre className="text-xs bg-white p-3 rounded border">
                          {formatRule(s.rule)}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
