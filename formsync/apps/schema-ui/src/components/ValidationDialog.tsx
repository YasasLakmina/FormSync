/**
 * Validation Results Dialog Component
 * 
 * Displays validation errors and warnings in a modal popup
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'error':
      return 'destructive';
    case 'warning':
      return 'default';
    case 'info':
      return 'secondary';
    default:
      return 'success';
  }
};

export const ValidationDialog: React.FC<ValidationDialogProps> = ({ results, onClose, formatError, isSuccess, onAIFix }) => {
  // If there's a format error, show it prominently with improved UX
  if (formatError) {
    // Extract line and column info if available
    const lineMatch = formatError.match(/line (\d+)/);
    const colMatch = formatError.match(/column (\d+)/);
    const posMatch = formatError.match(/position (\d+)/);
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            {/* Header with professional gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Validation Issue Detected</h2>
                    <p className="text-orange-100 mt-1">
                      We found a format issue in your input
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 -mr-2 -mt-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Error Details Card */}
              <div className="bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500 rounded-r-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                      <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">!</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-200 text-lg mb-2">
                      Error Details
                    </h3>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                      <code className="text-sm text-orange-800 dark:text-orange-300 font-mono break-words">
                        {formatError}
                      </code>
                    </div>
                    
                    {/* Location Info */}
                    {(lineMatch || colMatch || posMatch) && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {lineMatch && (
                          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md border border-orange-200 dark:border-orange-800">
                            <span className="text-xs font-medium text-neutral-500">Line:</span>
                            <span className="text-sm font-bold text-orange-600">{lineMatch[1]}</span>
                          </div>
                        )}
                        {colMatch && (
                          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md border border-orange-200 dark:border-orange-800">
                            <span className="text-xs font-medium text-neutral-500">Column:</span>
                            <span className="text-sm font-bold text-orange-600">{colMatch[1]}</span>
                          </div>
                        )}
                        {posMatch && (
                          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md border border-orange-200 dark:border-orange-800">
                            <span className="text-xs font-medium text-neutral-500">Position:</span>
                            <span className="text-sm font-bold text-orange-600">{posMatch[1]}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Helpful Suggestions */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                      How to Fix This
                    </h3>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800 dark:text-blue-300">
                          Verify you selected the correct input format (JSON/XML/YAML)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800 dark:text-blue-300">
                          Check for missing or extra brackets, quotes, or commas
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800 dark:text-blue-300">
                          Use AI to automatically fix syntax issues
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    onAIFix?.();
                    onClose();
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Quick Fix
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="px-8 border-2"
                  size="lg"
                >
                  Fix Manually
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // If validation succeeded, show success message with improved design
  if (isSuccess && results.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-lg"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            {/* Success Header with gradient */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex p-4 bg-white/20 rounded-full backdrop-blur-sm mb-4"
              >
                <CheckCircle className="h-12 w-12" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Perfect!</h2>
              <p className="text-green-100 text-lg">
                Your input is valid and ready to convert
              </p>
            </div>

             <CardContent className="p-6 space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-5 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-200 text-lg">
                      No Issues Found
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
                      Your schema passed all validation checks
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      What's Next?
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Click the <strong>Convert</strong> button to transform your input into JSON Schema format, then optionally use <strong>AI Enhance</strong> to add intelligent suggestions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                size="lg"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Otherwise show normal validation results
  const errors = results.filter(r => r.severity === 'error');
  const warnings = results.filter(r => r.severity === 'warning');
  const infos = results.filter(r => r.severity === 'info');

  const hasIssues = results.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl">
        <Card className="glass border-2 border-neutral-200 dark:border-neutral-700 shadow-2xl">
          <CardHeader className="border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasIssues ? (
                  errors.length > 0 ? (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  )
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
                <div>
                  <CardTitle className="text-xl">
                    {hasIssues ? 'Validation Results' : 'Validation Passed!'}
                  </CardTitle>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {errors.length > 0 && `${errors.length} error${errors.length > 1 ? 's' : ''}`}
                    {errors.length > 0 && warnings.length > 0 && ', '}
                    {warnings.length > 0 && `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`}
                    {!hasIssues && 'No issues found in your schema'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-red-100 dark:hover:bg-red-950/30"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 max-h-[500px] overflow-y-auto">
            {!hasIssues ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/30 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">All Good!</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  Your schema is valid and ready to use
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Errors */}
                {errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Errors ({errors.length})
                    </h4>
                    <div className="space-y-2">
                      {errors.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-4 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                        >
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={getSeverityBadge(issue.severity) as any}>
                                  {issue.severity.toUpperCase()}
                                </Badge>
                                <code className="text-xs bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">
                                  {issue.path}
                                </code>
                              </div>
                              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                {issue.message}
                              </p>
                              {issue.suggestion && (
                                <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                                  💡 Suggestion: {issue.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {warnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Warnings ({warnings.length})
                    </h4>
                    <div className="space-y-2">
                      {warnings.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20"
                        >
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={getSeverityBadge(issue.severity) as any}>
                                  {issue.severity.toUpperCase()}
                                </Badge>
                                <code className="text-xs bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">
                                  {issue.path}
                                </code>
                              </div>
                              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                {issue.message}
                              </p>
                              {issue.suggestion && (
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                                  💡 Suggestion: {issue.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info */}
                {infos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Info ({infos.length})
                    </h4>
                    <div className="space-y-2">
                      {infos.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20"
                        >
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={getSeverityBadge(issue.severity) as any}>
                                  {issue.severity.toUpperCase()}
                                </Badge>
                                <code className="text-xs bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">
                                  {issue.path}
                                </code>
                              </div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {issue.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
