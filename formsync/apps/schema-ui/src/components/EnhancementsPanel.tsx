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
      return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
    case 'modified':
      return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
    case 'removed':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600';
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
    <Card className="border-2 border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-purple-950/30 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Enhancement Suggestions
              </CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {enhancements.length} suggestion{enhancements.length > 1 ? 's' : ''} generated
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
                <Check className="h-4 w-4 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">Apply All</span>
              </Button>
            )}
            {onUndoAll && appliedCount > 0 && (
              <Button
                onClick={onUndoAll}
                size="sm"
                variant="outline"
                className="gap-2 border-2 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              >
                <Undo className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Undo All</span>
              </Button>
            )}
            {onClose && (
              <Button
                onClick={onClose}
                size="icon"
                variant="ghost"
                className="hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 max-h-[500px] overflow-y-auto bg-neutral-50 dark:bg-neutral-900/50">
        <AnimatePresence>
          <div className="space-y-3">
            {enhancements.map((enhancement, index) => {
              const isApplied = appliedSuggestions.has(index);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-5 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                    isApplied
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-400 dark:border-green-600'
                      : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getChangeBadgeStyle(enhancement.changeType)}`}>
                          {getChangeIcon(enhancement.changeType)}
                          <span className="uppercase tracking-wide">{enhancement.changeType}</span>
                        </span>
                        <code className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-mono border border-blue-200 dark:border-blue-800">
                          {enhancement.path}
                        </code>
                      </div>

                      {/* Reason with Icon */}
                      <div className="flex items-start gap-2 mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                          {enhancement.reason}
                        </p>
                      </div>

                      {/* Value Changes */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {enhancement.originalValue !== undefined && (
                          <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5">
                              <X className="h-3.5 w-3.5" />
                              Original
                            </div>
                            <code className="text-red-600 dark:text-red-300 block font-mono">
                              {JSON.stringify(enhancement.originalValue, null, 2)}
                            </code>
                          </div>
                        )}
                        {enhancement.newValue !== undefined && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5" />
                              New Value
                            </div>
                            <code className="text-green-600 dark:text-green-300 block font-mono">
                              {JSON.stringify(enhancement.newValue, null, 2)}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2">
                      {isApplied ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="gap-2 bg-success-100 dark:bg-success-900/30 border-success-400"
                          >
                            <Check className="h-4 w-4" />
                            Applied
                          </Button>
                          {onUndoSuggestion && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onUndoSuggestion(index)}
                              className="gap-2 hover:bg-orange-100 dark:hover:bg-orange-950/30 text-orange-600 dark:text-orange-400"
                            >
                              <Undo className="h-4 w-4" />
                              Undo
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onApplySuggestion(index)}
                          variant="outline"
                          className="gap-2 border-2 hover:bg-green-50 dark:hover:bg-green-950/20"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold">Apply</span>
                        </Button>
                      )}
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
