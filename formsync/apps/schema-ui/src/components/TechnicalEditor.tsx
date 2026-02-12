/**
 * Technical Editor Component
 *
 * Integrated schema editor with generation controls
 */

import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useSchemaStore } from '../stores/schemaStore';
import { schemaApi } from '../api/schemaApi';
import { FormatSelector, type FormatType } from './FormatSelector';
import { SchemaTreeView } from './SchemaTreeView';
import { SuggestionsPanel } from './SuggestionsPanel';
import { ValidationDialog } from './ValidationDialog';
import { QualityMetricsPanel } from './QualityMetricsPanel';
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
  Undo2,
  Redo2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// History entry for undo/redo
interface HistoryEntry {
  schema: any;
  timestamp: number;
  action: string;
}

interface TechnicalEditorProps {
  onGenerate?: () => void;
  isGenerating?: boolean;
  onStageUpdate?: (stageName: string, status: 'loading' | 'complete' | 'error' | 'pending') => void;
  onNextToFormBuilder?: () => void;
  stages?: any[];
  schemaFromBuilder?: string; // Schema transferred from Template Builder
}

export const TechnicalEditor: React.FC<TechnicalEditorProps> = ({
  onGenerate,
  isGenerating = false,
  onStageUpdate,
  onNextToFormBuilder,
  stages = [],
  schemaFromBuilder,
}) => {
  // State
  const [format, setFormat] = useState<FormatType>('json');
  const [editorValue, setEditorValue] = useState('');
  const [showTreeView, setShowTreeView] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showQualityMetrics, setShowQualityMetrics] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Validation state
  const [isInputValid, setIsInputValid] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Individual loading states for each action
  const [convertLoading, setConvertLoading] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);
  const [enhanceLoading, setEnhanceLoading] = useState(false);

  // Store
  const {
    currentSchema,
    convertedSchema,
    suggestions,
    qualityMetrics,
    validationResults,
    convertSchema,
    enhanceSchema,
    applySuggestion,
    setCurrentSchema,
    clearError,
  } = useSchemaStore();

  // Computed - prioritize currentSchema so applied suggestions show immediately
  const displaySchema = currentSchema || convertedSchema;

  // Handle editor value change - Update "Enter Schema" stage
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newValue = value || '';
      setEditorValue(newValue);

      // Update "Enter Schema" stage based on content
      if (newValue.trim()) {
        onStageUpdate?.('Enter Schema', 'complete');
      }
      // Note: We don't set it back to pending when empty since that's not a valid status type
    },
    [onStageUpdate]
  );

  // Populate editor when schema is transferred from Template Builder
  useEffect(() => {
    if (schemaFromBuilder && schemaFromBuilder.trim() && schemaFromBuilder !== editorValue) {
      setEditorValue(schemaFromBuilder);
      setFormat('json'); // Template Builder always generates JSON
      toast.success('Schema loaded from Template Builder!');
      onStageUpdate?.('Enter Schema', 'complete');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaFromBuilder]); // Only run when schemaFromBuilder changes

  // Helper function to validate input format
  // Handlers - NEW ORDER: Validate → Convert → Enhance

  // 1. Validate raw input first (ONLY validates, does NOT convert)
  const handleValidate = useCallback(async () => {
    if (!editorValue.trim()) {
      toast.error('Please enter some code to validate');
      return;
    }

    clearError();
    setValidateLoading(true);
    onStageUpdate?.('Input Validation', 'loading');

    try {
      // Call backend syntax validation API (validation only, no conversion)
      await schemaApi.validateSyntax({ input: editorValue, format });

      // Validation passed
      setIsInputValid(true);
      setValidationError('');
      onStageUpdate?.('Input Validation', 'complete');

      toast.success(`Valid ${format.toUpperCase()} format!`, {
        description: 'You can now convert to JSON Schema',
      });

      // Special case: If format is already JSON, also trigger semantic validation
      if (format === 'json') {
        try {
          const schema = JSON.parse(editorValue);
          // Only validate if it looks like a schema (has type or properties)
          // or just simple validation
          if (typeof schema === 'object' && schema !== null) {
            await useSchemaStore.getState().validateSchema(schema);
            // Also update current schema in store if it's JSON
            setCurrentSchema(schema);
          }
        } catch (e) {
          // Ignore parse errors here as syntax check passed
        }
      }

      // Show success dialog
      setShowValidationDialog(true);
    } catch (error: any) {
      setIsInputValid(false);

      // Check if this is a syntax validation error from backend
      if (error.response?.data?.syntaxErrors || error.response?.data?.formatMismatch) {
        const backendError = error.response.data;

        // Format detailed error message
        let errorMessage = '';

        if (backendError.formatMismatch) {
          errorMessage = backendError.formatMismatch.message;
        } else if (backendError.syntaxErrors && backendError.syntaxErrors.length > 0) {
          const firstError = backendError.syntaxErrors[0];
          errorMessage = firstError.message;

          // Add location info if available
          if (firstError.line) {
            errorMessage += ` (Line ${firstError.line}`;
            if (firstError.column) {
              errorMessage += `, Column ${firstError.column}`;
            }
            errorMessage += ')';
          }
        }

        setValidationError(errorMessage || 'Syntax validation failed');
      } else {
        // Other errors
        setValidationError(error.response?.data?.message || error.message || 'Validation failed');
      }

      onStageUpdate?.('Input Validation', 'error');

      toast.error('Validation Failed', {
        description: 'Click to see details',
        duration: 3000,
      });

      // Show validation dialog with error
      setShowValidationDialog(true);
    } finally {
      setValidateLoading(false);
    }
  }, [editorValue, format, clearError, onStageUpdate, setCurrentSchema]);

  // 2. Convert to JSON Schema
  const handleConvert = useCallback(async () => {
    if (!editorValue.trim()) {
      toast.error('Please enter and validate your schema first');
      return;
    }

    clearError();
    setConvertLoading(true);
    onStageUpdate?.('Schema Conversion', 'loading');
    try {
      // Convert and get the schema back (updated store action returns it)
      const schema = await convertSchema(editorValue, format);

      toast.success('Schema converted to JSON Schema successfully!');
      onStageUpdate?.('Schema Conversion', 'complete');

      // Trigger semantic validation on the converted schema
      if (schema) {
        // onStageUpdate?.('Input Validation', 'loading'); // REMOVED: Keep it green since it was already validated 
        // Actually Input Validation stage is technically done, but we need semantic validity for generation
        await useSchemaStore.getState().validateSchema(schema);
        // We don't necessarily need to show a toast here as convert success is shown
      }

    } catch (error) {
      toast.error('Failed to convert schema');
      onStageUpdate?.('Schema Conversion', 'error');
    } finally {
      setConvertLoading(false);
    }
  }, [editorValue, format, convertSchema, clearError, onStageUpdate]);

  // Quick Fix - Apply syntax corrections
  const handleAIFix = useCallback(async () => {
    if (!editorValue) {
      toast.error('No code to fix');
      return;
    }

    toast.loading('Applying quick fix...');

    try {
      // Call backend quick fix API
      const response = await schemaApi.quickFixSyntax({ input: editorValue, format });

      if (response.data.fixedInput) {
        // Update editor with fixed code
        setEditorValue(response.data.fixedInput);

        toast.dismiss();

        // Show different message based on confidence
        const confidenceMessage = response.data.confidence === 'deterministic'
          ? 'Fixed automatically'
          : 'Fixed using Quick Fix';

        toast.success('Syntax errors fixed!', {
          description: confidenceMessage,
        });

        // Close validation dialog
        setShowValidationDialog(false);
        setValidationError('');
        setIsInputValid(true);
      } else {
        toast.dismiss();
        toast.error('Could not automatically fix syntax', {
          description: 'Please fix manually',
        });
      }
    } catch (error: any) {
      toast.dismiss();

      // Check if this is a "cannot fix" error
      const errorMessage = error.response?.data?.message || '';

      if (errorMessage.includes('Could not automatically fix')) {
        toast.error('Cannot auto-fix this format', {
          description: format === 'xml'
            ? 'XML syntax is too complex to auto-fix. Please correct manually.'
            : 'This syntax error is too complex to fix automatically.',
        });
      } else {
        toast.error('Quick fix failed', {
          description: error.response?.data?.message || 'Unable to apply fixes',
        });
      }
    }
  }, [editorValue, format]);

  // 3. AI Enhance
  const handleEnhance = useCallback(async () => {
    if (!displaySchema) {
      toast.error('No schema to enhance');
      return;
    }

    clearError();
    setEnhanceLoading(true);
    onStageUpdate?.('AI Enhancement', 'loading');
    try {
      await enhanceSchema(displaySchema);
      toast.success('Schema enhanced with AI suggestions!');
      setShowSuggestions(true); // Auto-show suggestions panel
      onStageUpdate?.('AI Enhancement', 'complete');
    } catch (error) {
      toast.error('Failed to enhance schema');
      onStageUpdate?.('AI Enhancement', 'error');
    } finally {
      setEnhanceLoading(false);
    }
  }, [displaySchema, enhanceSchema, clearError, onStageUpdate]);

  // Handle suggestion apply/undo
  const handleSuggestionAction = useCallback(
    async (suggestion: any, action: 'apply' | 'undo'): Promise<number | undefined> => {
      try {
        const scoreDelta = await applySuggestion(suggestion, action);
        return scoreDelta;
      } catch (error) {
        throw error;
      }
    },
    [applySuggestion]
  );

  // Add to history when schema changes
  const addToHistory = useCallback(
    (schema: any, action: string) => {
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
    },
    [history, historyIndex]
  );

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
      {/* Header Row: Format Selector (Left) + Next: Form Builder Button (Right) */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        {/* Left: Format Selector */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
            Input Format
          </h3>
          <FormatSelector selected={format} onChange={setFormat} />
        </div>

        {/* Right: Next: Form Builder Button - Shows after Convert OR AI Enhancement is complete */}
        {onNextToFormBuilder && stages.length > 0 && (stages[2]?.status === 'complete' || stages[3]?.status === 'complete') && (
          <div className="flex items-end">
            <Button
              onClick={onNextToFormBuilder}
              size="lg"
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl text-white px-8 py-3 text-base font-semibold rounded-xl transition-all hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              Next: Form Builder
            </Button>
          </div>
        )}
      </div>

      {/* Action Buttons Row - Below Format Selector */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
          Actions
        </h3>
        <div className="flex gap-2 flex-wrap">
          {/* 1. Validate Input Format */}
          <Button
            onClick={handleValidate}
            size="lg"
            disabled={validateLoading}
            variant="outline"
            className="gap-2 border-2 hover:bg-green-50 dark:hover:bg-green-950/20"
          >
            {validateLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold">
                  Validating...
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold">
                  Validate
                </span>
              </>
            )}
          </Button>

          {/* 2. Convert to JSON Schema */}
          <Button
            onClick={handleConvert}
            size="lg"
            disabled={convertLoading || !isInputValid}
            variant="outline"
            className="gap-2 border-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            {convertLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Converting...
                </span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Convert
                </span>
              </>
            )}
          </Button>

          {/* 3. AI Enhance */}
          <Button
            onClick={handleEnhance}
            size="lg"
            disabled={enhanceLoading || !displaySchema}
            variant="outline"
            className="gap-2 border-2 hover:bg-purple-50 dark:hover:bg-purple-950/20"
          >
            {enhanceLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                  Enhancing...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                  AI Enhance
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content - Sidebar + Editors */}
      <div className="flex-1 flex gap-4 min-h-[800px] relative">
        {/* Left Sidebar - Quick Actions (positioned to not affect layout) */}
        <Card
          className={`flex flex-col gap-2 border-2 border-neutral-200 dark:border-neutral-700 p-3 transition-all duration-300 flex-shrink-0 ${sidebarExpanded ? 'w-48' : 'w-16'}`}
        >
          {/* Expand/Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full justify-start gap-2 mb-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            {sidebarExpanded ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-semibold">Collapse</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <div className="border-t border-neutral-300 dark:border-neutral-700 mb-2" />

          {/* Upload */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFileUpload}
            className={`w-full justify-start gap-3 h-10 ${!sidebarExpanded && 'px-2'}`}
            title={!sidebarExpanded ? 'Upload File' : undefined}
          >
            <Upload className="h-4 w-4 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Upload</span>}
          </Button>

          {/* Schema Navigator */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTreeView(!showTreeView)}
            className={`w-full justify-start gap-3 h-10 ${!sidebarExpanded && 'px-2'}`}
            title={!sidebarExpanded ? 'Schema Navigator' : undefined}
          >
            <TreePine className="h-4 w-4 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Navigator</span>}
          </Button>

          {/* AI Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestions(true)}
              className={`w-full justify-start gap-3 h-10 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 relative ${!sidebarExpanded && 'px-2'}`}
              title={!sidebarExpanded ? 'View AI Suggestions' : undefined}
            >
              <Sparkles className="h-4 w-4 flex-shrink-0 text-purple-600" />
              {sidebarExpanded && <span className="text-sm">AI Suggestions</span>}
              <Badge className="absolute -top-1 -right-1 bg-purple-600 text-white px-1.5 py-0.5 text-xs">
                {suggestions.length}
              </Badge>
            </Button>
          )}

          {/* Quality Score */}
          {qualityMetrics && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQualityMetrics(true)}
              className={`w-full justify-start gap-3 h-10 border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 relative ${!sidebarExpanded && 'px-2'}`}
              title={!sidebarExpanded ? `Quality Score: ${qualityMetrics.qualityScore}` : undefined}
            >
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
              {sidebarExpanded && <span className="text-sm">Quality Score</span>}
              <Badge className="absolute -top-1 -right-1 bg-green-600 text-white px-1.5 py-0.5 text-xs font-bold">
                {qualityMetrics.qualityScore}
              </Badge>
            </Button>
          )}

          <div className="border-t border-neutral-300 dark:border-neutral-700 my-2" />

          {/* Undo */}
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`w-full justify-start gap-3 h-10 ${!sidebarExpanded && 'px-2'}`}
            title={!sidebarExpanded ? 'Undo' : undefined}
          >
            <Undo2 className="h-4 w-4 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Undo</span>}
          </Button>

          {/* Redo */}
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`w-full justify-start gap-3 h-10 ${!sidebarExpanded && 'px-2'}`}
            title={!sidebarExpanded ? 'Redo' : undefined}
          >
            <Redo2 className="h-4 w-4 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Redo</span>}
          </Button>
        </Card>

        {/* Editors Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Left Panel - Input */}
          <Card className="flex flex-col glass border-2 border-neutral-200 dark:border-neutral-700">
            <CardHeader className="border-b border-neutral-200 dark:border-neutral-700 py-3">
              <CardTitle className="text-base">Input ({format.toUpperCase()})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Editor
                key={editorValue ? `editor-loaded-${editorValue.length}` : 'editor-empty'}
                height="100%"
                language={format === 'xml' ? 'xml' : format === 'yaml' ? 'yaml' : 'json'}
                value={editorValue}
                onChange={handleEditorChange}
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
      </div>

      {/* AI Suggestions Dialog */}
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
          >
            <SuggestionsPanel
              suggestions={suggestions}
              onApplySuggestion={handleSuggestionAction}
              onClose={() => setShowSuggestions(false)}
            />
          </motion.div>
        </div>
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

      {/* Quality Metrics Panel */}
      {showQualityMetrics && qualityMetrics && (
        <QualityMetricsPanel
          metrics={qualityMetrics}
          onClose={() => setShowQualityMetrics(false)}
        />
      )}

      {/* Validation Results Dialog */}
      {showValidationDialog && (
        <ValidationDialog
          results={validationResults?.issues || []}
          onClose={() => setShowValidationDialog(false)}
          formatError={validationError}
          isSuccess={isInputValid}
          onAIFix={handleAIFix}
        />
      )}
    </div>
  );
};
