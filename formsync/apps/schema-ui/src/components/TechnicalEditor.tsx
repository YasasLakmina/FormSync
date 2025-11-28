/**
 * Technical Editor Component - Simplified Working Version
 * 
 * Clean layout with visible convert button and both editors
 */

import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useSchemaStore } from '../stores/schemaStore';
import { FormatSelector, type FormatType } from './FormatSelector';
import { TemplateLibrary } from './TemplateLibrary';
import { SchemaTreeView } from './SchemaTreeView';
import { EnhancementsPanel } from './EnhancementsPanel';
import { ValidationDialog } from './ValidationDialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Zap,
  CheckCircle, 
  Sparkles,
  Upload,
  X,
  TreePine,
  Loader2,
  Library,
  Undo2,
  Redo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// History entry for undo/redo
interface HistoryEntry {
  schema: any;
  timestamp: number;
  action: string;
}

export const TechnicalEditor: React.FC = () => {
  // State
  const [format, setFormat] = useState<FormatType>('json');
  const [editorValue, setEditorValue] = useState('');
  const [showTreeView, setShowTreeView] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Store
  const {
    currentSchema,
    convertedSchema,
    enhancedSchema,
    enhancements,
    validationResults,
    loading,
    convertSchema,
    enhanceSchema,
    validateSchema,
    setCurrentSchema,
    clearError,
  } = useSchemaStore();

  // Computed - prioritize currentSchema so applied suggestions show immediately
  const displaySchema = currentSchema || convertedSchema;

  // Handlers
  const handleConvert = useCallback(async () => {
    if (!editorValue.trim()) {
      toast.error('Please enter some code to convert');
      return;
    }

    try {
      clearError();
      // Correct API call - just pass the string and format
      await convertSchema(editorValue, format);
      toast.success('Schema converted successfully!');
    } catch (err) {
      console.error('Conversion error:', err);
      toast.error('Conversion failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [editorValue, format, convertSchema, clearError]);

  const handleValidate = useCallback(async () => {
    if (!displaySchema) {
      toast.error('No schema to validate', {
        description: 'Please convert a schema first',
      });
      return;
    }

    try {
      clearError();
      await validateSchema(displaySchema);
      // Show validation dialog instead of just toast
      setShowValidationDialog(true);
    } catch (err) {
      console.error('Validation error:', err);
      toast.error('Validation error');
    }
  }, [displaySchema, clearError, validateSchema]);

  const handleEnhance = useCallback(async () => {
    if (!displaySchema) {
      toast.error('No schema to enhance', {
        description: 'Please convert a schema first',
      });
      return;
    }

    try {
      clearError();
      await enhanceSchema(displaySchema);
      // Just show suggestions panel - DON'T auto-apply to schema
      setShowSuggestions(true);
      setAppliedSuggestions(new Set()); // Reset applied suggestions
      toast.success('AI suggestions ready!', {
        description: 'Review and apply suggestions below',
      });
    } catch (err) {
      console.error('Enhancement error:', err);
      toast.error('Enhancement failed', {
        description: 'AI service may be unavailable',
      });
    }
  }, [displaySchema, clearError, enhanceSchema]);

  // Add to history when schema changes
  const addToHistory = useCallback((schema: any, action: string) => {
    const newEntry: HistoryEntry = {
      schema: JSON.parse(JSON.stringify(schema)),
      timestamp: Date.now(),
      action,
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newEntry);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousIndex = historyIndex - 1;
      const previousEntry = history[previousIndex];
      setCurrentSchema(previousEntry.schema);
      setHistoryIndex(previousIndex);
      toast.success('Undone');
    } else {
      toast.info('Nothing to undo');
    }
  }, [history, historyIndex, setCurrentSchema]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextEntry = history[nextIndex];
      setCurrentSchema(nextEntry.schema);
      setHistoryIndex(nextIndex);
      toast.success('Redone');
    } else {
      toast.info('Nothing to redo');
    }
  }, [history, historyIndex, setCurrentSchema]);

  // Undo individual suggestion
  const handleUndoSuggestion = useCallback((index: number) => {
    if (!appliedSuggestions.has(index) || !enhancements || !displaySchema) return;

    // Get the base schema (before any suggestions)
    // We need to go back to the schema before AI enhancement
    const baseSchema = convertedSchema || currentSchema;
    if (!baseSchema) return;

    // Rebuild schema by applying ALL suggestions EXCEPT this one
    let rebuiltSchema = JSON.parse(JSON.stringify(baseSchema));
    
    enhancements.forEach((enhancement, idx) => {
      // Apply all applied suggestions except the one we're undoing
      if (appliedSuggestions.has(idx) && idx !== index) {
        const pathParts = enhancement.path.split('.');
        let current = rebuiltSchema;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          }
          current = current[pathParts[i]];
        }

        const lastKey = pathParts[pathParts.length - 1];
        
        if (enhancement.changeType === 'added' || enhancement.changeType === 'modified') {
          current[lastKey] = enhancement.newValue;
        } else if (enhancement.changeType === 'removed') {
          delete current[lastKey];
        }
      }
    });

    // Update schema
    setCurrentSchema(rebuiltSchema);
    
    // Remove from applied set
    setAppliedSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    
    // Add to history
    addToHistory(displaySchema, `Undid suggestion at ${enhancements[index].path}`);
    
    toast.success('Suggestion undone');
  }, [appliedSuggestions, enhancements, displaySchema, convertedSchema, currentSchema, setCurrentSchema, addToHistory]);

  // Apply individual suggestion
  const handleApplySuggestion = useCallback((index: number) => {
    if (!enhancements || !displaySchema) return;

    const enhancement = enhancements[index];
    const updatedSchema = JSON.parse(JSON.stringify(displaySchema));

    // Apply the enhancement based on path
    const pathParts = enhancement.path.split('.');
    let current = updatedSchema;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }

    const lastKey = pathParts[pathParts.length - 1];
    
    if (enhancement.changeType === 'added' || enhancement.changeType === 'modified') {
      current[lastKey] = enhancement.newValue;
    } else if (enhancement.changeType === 'removed') {
      delete current[lastKey];
    }

    // Add to history before making changes
    addToHistory(displaySchema, `Applied: ${enhancement.reason}`);
    
    // Update schema
    setCurrentSchema(updatedSchema);
    
    // Mark as applied
    setAppliedSuggestions(prev => new Set(prev).add(index));
    
    toast.success('Suggestion applied!');
  }, [enhancements, displaySchema, setCurrentSchema, addToHistory]);

  // Apply all suggestions
  const handleApplyAll = useCallback(() => {
    if (!enhancements || enhancements.length === 0 || !displaySchema) return;

    // Start with current schema
    let updatedSchema = JSON.parse(JSON.stringify(displaySchema));

    // Apply each unapplied suggestion sequentially
    const unappliedIndices: number[] = [];
    enhancements.forEach((enhancement, index) => {
      if (!appliedSuggestions.has(index)) {
        unappliedIndices.push(index);
        
        // Apply the enhancement
        const pathParts = enhancement.path.split('.');
        let current = updatedSchema;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          }
          current = current[pathParts[i]];
        }

        const lastKey = pathParts[pathParts.length - 1];
        
        if (enhancement.changeType === 'added' || enhancement.changeType === 'modified') {
          current[lastKey] = enhancement.newValue;
        } else if (enhancement.changeType === 'removed') {
          delete current[lastKey];
        }
      }
    });

    if (unappliedIndices.length > 0) {
      // Add to history
      addToHistory(displaySchema, `Applied ${unappliedIndices.length} suggestions`);
      
      // Update schema
      setCurrentSchema(updatedSchema);
      
      // Mark all as applied
      setAppliedSuggestions(new Set(enhancements.map((_, idx) => idx)));
      
      toast.success(`Applied ${unappliedIndices.length} suggestions!`);
    } else {
      toast.info('All suggestions already applied');
    }
  }, [enhancements, appliedSuggestions, displaySchema, setCurrentSchema, addToHistory]);

  // Undo all applied suggestions
  const handleUndoAll = useCallback(() => {
    const appliedCount = appliedSuggestions.size;
    
    if (appliedCount === 0) {
      toast.info('No suggestions to undo');
      return;
    }

    // Call undo for each applied suggestion
    let successfulUndos = 0;
    for (let i = 0; i < appliedCount; i++) {
      if (historyIndex > 0) {
        const previousIndex = historyIndex - 1 - i; // Account for already undone steps
        if (previousIndex >= 0 && history[previousIndex]) {
          setCurrentSchema(history[previousIndex].schema);
          successfulUndos++;
        }
      }
    }

    if (successfulUndos > 0) {
      setHistoryIndex(historyIndex - successfulUndos);
      setAppliedSuggestions(new Set());
      toast.success(`Undone ${successfulUndos} suggestion${successfulUndos > 1 ? 's' : ''}!`);
    } else {
      toast.error('Cannot undo - please use individual undo buttons');
    }
  }, [appliedSuggestions, historyIndex, history, setCurrentSchema]);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.yaml,.yml,.xml';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setEditorValue(content);
        
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'yaml' || ext === 'yml') setFormat('yaml');
        else if (ext === 'xml') setFormat('xml');
        else setFormat('json');
        
        toast.success('File uploaded');
      };
      reader.readAsText(file);
    };
    
    input.click();
  }, []);

  const handleTemplateSelect = useCallback((template: any) => {
    setCurrentSchema(template.schema);
    setShowTemplates(false);
    toast.success('Template applied');
  }, [setCurrentSchema]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleConvert();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleConvert]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Format Selector */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">Input Format</h3>
          <FormatSelector selected={format} onChange={setFormat} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Actions</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleConvert}
              size="lg"
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Convert
                </>
              )}
            </Button>

            <Button
              onClick={handleValidate}
              size="lg"
              disabled={loading || !displaySchema}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 border-0 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Validate
                </>
              )}
            </Button>

            <Button
              onClick={handleEnhance}
              size="lg"
              disabled={loading || !displaySchema}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  AI Enhance
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Quick Actions</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFileUpload}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(true)}
              className="gap-2"
            >
              <Library className="h-4 w-4" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTreeView(!showTreeView)}
              className="gap-2"
            >
              <TreePine className="h-4 w-4" />
              Tree
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="gap-2"
            >
              <Undo2 className="h-4 w-4" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="gap-2"
            >
              <Redo2 className="h-4 w-4" />
              Redo
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Editors */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-[600px]">
        {/* Left Panel - Input */}
        <Card className="flex flex-col glass border-2 border-neutral-200 dark:border-neutral-700">
          <CardHeader className="border-b border-neutral-200 dark:border-neutral-700 py-3">
            <CardTitle className="text-base">Input ({format.toUpperCase()})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Editor
              height="100%"
              language={format === 'xml' ? 'xml' : format === 'yaml' ? 'yaml' : 'json'}
              value={editorValue}
              onChange={(value) => setEditorValue(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
            />
          </CardContent>
        </Card>

        {/* Right Panel - Output */}
        <Card className="flex flex-col glass border-2 border-neutral-200 dark:border-neutral-700">
          <CardHeader className="border-b border-neutral-200 dark:border-neutral-700 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">JSON Schema (Output)</CardTitle>
              {displaySchema && (
                <Badge variant="success" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Valid
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {displaySchema ? (
              <Editor
                height="100%"
                language="json"
                value={JSON.stringify(displaySchema, null, 2)}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500">
                <div className="text-center">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="font-semibold">No schema yet</p>
                  <p className="text-sm mt-1">Converted schema will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Enhancement Suggestions */}
      {showSuggestions && enhancements && enhancements.length > 0 && (
        <EnhancementsPanel
          enhancements={enhancements}
          onApplySuggestion={handleApplySuggestion}
          onUndoSuggestion={handleUndoSuggestion}
          appliedSuggestions={appliedSuggestions}
          onApplyAll={handleApplyAll}
          onUndoAll={handleUndoAll}
          onClose={() => setShowSuggestions(false)}
        />
      )}

      {/* Tree View Slide-in */}
      <AnimatePresence>
        {showTreeView && displaySchema && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-neutral-900 shadow-2xl z-50 overflow-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Schema Navigator</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowTreeView(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SchemaTreeView schema={displaySchema} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Library Modal */}
      {showTemplates && (
        <TemplateLibrary
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={handleTemplateSelect}
        />
      )}

      {/* Validation Results Dialog */}
      {showValidationDialog && validationResults && (
        <ValidationDialog
          results={Array.isArray(validationResults) ? validationResults : validationResults.issues || []}
          onClose={() => setShowValidationDialog(false)}
        />
      )}
    </div>
  );
};
