/**
 * Validation Results Dialog Component
 * 
 * Displays validation errors and warnings in a modal popup
 */

import React from 'react';
import { Card, CardContent } from './ui/card';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ValidationIssue {
  id: string;
  path: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface ValidationDialogProps {
  results: ValidationIssue[];
  onClose: () => void;
  formatError?: string;  // For input format validation errors
  isSuccess?: boolean;   // For successful validations
  onAIFix?: () => void;  // Callback for AI fix functionality
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'error':   return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info':    return <Info className="h-4 w-4 text-blue-500" />;
    default:        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  }
};

export const ValidationDialog: React.FC<ValidationDialogProps> = ({ results, onClose, formatError, isSuccess, onAIFix }) => {
  /* ── Format Error Dialog ─────────────────────────────────────── */
  if (formatError) {
    const lineMatch = formatError.match(/line (\d+)/i);
    const colMatch  = formatError.match(/column (\d+)/i);
    const posMatch  = formatError.match(/position (\d+)/i);

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="w-full max-w-lg"
        >
          <Card className="border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Validation Issue Detected</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">We found a format issue in your input</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Error message */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2">Error Details</p>
                <div className="rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 p-4">
                  <code className="text-[12px] font-mono text-red-700 dark:text-red-300 break-words leading-relaxed">
                    {formatError}
                  </code>
                </div>
              </div>

              {/* Location pills */}
              {(lineMatch || colMatch || posMatch) && (
                <div className="flex flex-wrap gap-2">
                  {lineMatch && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400">
                      Line <span className="font-bold text-red-800 dark:text-red-200">{lineMatch[1]}</span>
                    </span>
                  )}
                  {colMatch && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400">
                      Column <span className="font-bold text-orange-800 dark:text-orange-200">{colMatch[1]}</span>
                    </span>
                  )}
                  {posMatch && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400">
                      Position <span className="font-bold text-amber-800 dark:text-amber-200">{posMatch[1]}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Suggestions */}
              <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2.5">How to Fix</p>
                <ul className="space-y-2">
                  {[
                    'Verify you selected the correct input format (JSON / XML / YAML)',
                    'Check for missing or extra brackets, quotes, or commas',
                    'Use Quick Fix to let AI automatically correct syntax issues',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 mt-1.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { onAIFix?.(); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-purple-500 text-purple-600 dark:text-purple-400 text-sm font-semibold bg-white dark:bg-neutral-900 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Quick Fix
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Fix Manually
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ── Success Dialog ──────────────────────────────────────────── */
  if (isSuccess && results.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <Card className="border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-8 border-b border-neutral-100 dark:border-neutral-800 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="inline-flex p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/30 mb-4"
              >
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </motion.div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Looks Good!</h2>
              <p className="text-sm text-neutral-500">Your input is valid and ready to convert</p>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20">
                <span className="w-8 h-8 rounded-lg bg-emerald-200 dark:bg-emerald-900/60 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">No Issues Found</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Your schema passed all validation checks</p>
                </div>
              </div>

              {/* What's next */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">What's Next</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Click <span className="font-semibold text-neutral-800 dark:text-neutral-200">Convert</span> to transform your input into JSON Schema format, then optionally use{' '}
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">AI Enhance</span> to add intelligent suggestions.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
              >
                Continue
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ── General Validation Results ─────────────────────────────── */
  const errors   = results.filter((r) => r.severity === 'error');
  const warnings = results.filter((r) => r.severity === 'warning');
  const infos    = results.filter((r) => r.severity === 'info');
  const hasIssues = results.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="w-full max-w-2xl"
      >
        <Card className="border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                hasIssues
                  ? errors.length > 0 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-yellow-50 dark:bg-yellow-950/30'
                  : 'bg-emerald-50 dark:bg-emerald-950/30'
              }`}>
                {hasIssues
                  ? errors.length > 0
                    ? <AlertCircle className="h-5 w-5 text-red-500" />
                    : <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  : <CheckCircle className="h-5 w-5 text-emerald-500" />
                }
              </span>
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {hasIssues ? 'Validation Results' : 'Validation Passed'}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {errors.length > 0 && `${errors.length} error${errors.length > 1 ? 's' : ''}`}
                  {errors.length > 0 && warnings.length > 0 && ' · '}
                  {warnings.length > 0 && `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`}
                  {!hasIssues && 'No issues found in your schema'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <CardContent className="p-6 max-h-[480px] overflow-y-auto space-y-5">
            {!hasIssues ? (
              <div className="text-center py-10">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">All Good!</p>
                <p className="text-xs text-neutral-500 mt-1">Your schema is valid and ready to use</p>
              </div>
            ) : (
              <>
                {errors.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      Errors <span className="font-normal text-neutral-400">({errors.length})</span>
                    </div>
                    <div className="space-y-2">
                      {errors.map((issue) => (
                        <div key={issue.id} className="p-4 rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10">
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1 min-w-0">
                              {issue.path && (
                                <code className="text-[11px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-400 block mb-1 truncate">
                                  {issue.path}
                                </code>
                              )}
                              <p className="text-sm text-neutral-800 dark:text-neutral-200">{issue.message}</p>
                              {issue.suggestion && (
                                <p className="text-xs text-neutral-500 mt-1.5">Suggestion: {issue.suggestion}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {warnings.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="h-4 w-4" />
                      Warnings <span className="font-normal text-neutral-400">({warnings.length})</span>
                    </div>
                    <div className="space-y-2">
                      {warnings.map((issue) => (
                        <div key={issue.id} className="p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/40 bg-yellow-50/50 dark:bg-yellow-950/10">
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-neutral-800 dark:text-neutral-200">{issue.message}</p>
                              {issue.suggestion && (
                                <p className="text-xs text-neutral-500 mt-1.5">Suggestion: {issue.suggestion}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {infos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      <Info className="h-4 w-4" />
                      Info <span className="font-normal text-neutral-400">({infos.length})</span>
                    </div>
                    <div className="space-y-2">
                      {infos.map((issue) => (
                        <div key={issue.id} className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/10">
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <p className="text-sm text-neutral-800 dark:text-neutral-200">{issue.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
