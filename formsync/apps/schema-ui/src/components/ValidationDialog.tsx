/**
 * Validation Results Dialog Component
 * 
 * Displays validation errors and warnings in a modal popup
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
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

export const ValidationDialog: React.FC<ValidationDialogProps> = ({ results, onClose }) => {
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
        className="w-full max-w-3xl"
      >
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
