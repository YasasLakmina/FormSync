/**
 * Enhancement Suggestions Panel Component
 * 
 * Displays AI suggestions with accept/reject functionality
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Check, X, Plus, Edit, Trash2, Sparkles, Undo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SchemaEnhancement {
  path: string;
  originalValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
  reason: string;
}

interface EnhancementsPanelProps {
  enhancements: SchemaEnhancement[];
  onApplySuggestion: (index: number) => void;
  onUndoSuggestion?: (index: number) => void;
  appliedSuggestions: Set<number>;
  onApplyAll?: () => void;
  onUndoAll?: () => void;
  onClose?: () => void;
}

const getChangeIcon = (changeType: string) => {
  const iconClass = "h-4 w-4";
  switch (changeType) {
    case 'added':
      return <Plus className={iconClass} />;
    case 'modified':
      return <Edit className={iconClass} />;
    case 'removed':
      return <Trash2 className={iconClass} />;
    default:
      return <Sparkles className={iconClass} />;
  }
};

const getChangeBadgeStyle = (changeType: string) => {
  switch (changeType) {
    case 'added':
      return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800';
    case 'modified':
      return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800';
    case 'removed':
      return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
  }
};

export const EnhancementsPanel: React.FC<EnhancementsPanelProps> = ({
  enhancements,
  onApplySuggestion,
  onUndoSuggestion,
  appliedSuggestions,
  onApplyAll,
  onUndoAll,
  onClose,
}) => {
  if (enhancements.length === 0) {
    return null;
  }

  const appliedCount = appliedSuggestions.size;

  return (
    <Card className="border border-neutral-300 dark:border-neutral-700 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-purple-950/20 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Enhancement Suggestions
              </CardTitle>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {enhancements.length} suggestion{enhancements.length > 1 ? 's' : ''}
                {appliedCount > 0 && ` • ${appliedCount} applied`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onApplyAll && (
              <Button
                onClick={onApplyAll}
                size="sm"
                variant="outline"
                className="gap-2 border-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                disabled={appliedCount === enhancements.length}
              >
                <Check className="h-3.5 w-3.5 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold text-sm">Apply All</span>
              </Button>
            )}
            {onUndoAll && appliedCount > 0 && (
              <Button
                onClick={onUndoAll}
                size="sm"
                variant="outline"
                className="gap-2 border-2 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              >
                <Undo className="h-3.5 w-3.5 text-orange-600" />
                <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Undo All</span>
              </Button>
            )}
            {onClose && (
              <Button
                onClick={onClose}
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-[500px] overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
        <AnimatePresence>
          <div className="space-y-3">
            {enhancements.map((enhancement, index) => {
              const isApplied = appliedSuggestions.has(index);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className={`rounded-lg border overflow-hidden transition-all ${
                    isApplied
                      ? 'bg-green-50/50 dark:bg-green-950/10 border-green-300 dark:border-green-800 shadow-sm'
                      : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getChangeBadgeStyle(enhancement.changeType)}`}>
                        {getChangeIcon(enhancement.changeType)}
                        <span className="uppercase">{enhancement.changeType}</span>
                      </span>
                      <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {enhancement.path}
                      </code>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {isApplied ? (
                        <>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-300">Applied</span>
                          </div>
                          {onUndoSuggestion && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onUndoSuggestion(index)}
                              className="gap-1.5 h-7 text-xs hover:bg-orange-50 dark:hover:bg-orange-950/20"
                            >
                              <Undo className="h-3 w-3 text-orange-600" />
                              <span className="text-orange-700 dark:text-orange-300">Undo</span>
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onApplySuggestion(index)}
                          variant="outline"
                          className="gap-1.5 h-7 text-xs border-2 hover:bg-green-50 dark:hover:bg-green-950/20"
                        >
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">Apply</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Reason Section */}
                    <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                      <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">AI Suggestion</p>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {enhancement.reason}
                        </p>
                      </div>
                    </div>

                    {/* Changes Section */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Proposed Changes</p>
                      
                      <div className="space-y-2">
                        {/* Original Value */}
                        {enhancement.originalValue !== undefined && (
                          <div className="flex gap-2 p-3 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30">
                            <div className="flex flex-col items-center gap-1 pt-0.5">
                              <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                              <div className="h-full w-px bg-red-300 dark:bg-red-800"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1.5">Current Value</p>
                              <code className="block text-sm font-mono text-red-700 dark:text-red-300 break-all whitespace-pre-wrap">
                                {JSON.stringify(enhancement.originalValue, null, 2)}
                              </code>
                            </div>
                          </div>
                        )}

                        {/* New Value */}
                        {enhancement.newValue !== undefined && (
                          <div className="flex gap-2 p-3 rounded-lg bg-green-50/50 dark:bg-green-950/10 border border-green-200/50 dark:border-green-900/30">
                            <div className="flex flex-col items-center gap-1 pt-0.5">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <div className="h-full w-px bg-green-300 dark:bg-green-800"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-1.5">Suggested Value</p>
                              <code className="block text-sm font-mono text-green-700 dark:text-green-300 break-all whitespace-pre-wrap">
                                {JSON.stringify(enhancement.newValue, null, 2)}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
