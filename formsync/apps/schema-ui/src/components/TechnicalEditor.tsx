/**
 * Technical Editor Component - Enhanced Version with Sprint 1 Features
 * 
 * New Features:
 * - Export/Download (JSON, YAML, TypeScript, Clipboard)
 * - Keyboard shortcuts
 * - Suggestion filtering and sorting
 * - Full undo/redo history
 */

import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useSchemaStore } from '../stores/schemaStore';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Loader2, CheckCircle, AlertCircle, Sparkles, Check, Plus, Download, Copy, Filter, Undo2, Redo2, Library, Upload, Link2 } from 'lucide-react';
import { TemplateLibrary } from './TemplateLibrary';
import * as yaml from 'js-yaml';

// History entry for undo/redo
interface HistoryEntry {
  schema: any;
  timestamp: number;
  action: string;
}

export const TechnicalEditor: React.FC = () => {
  const [format, setFormat] = useState<'json' | 'yaml' | 'xml'>('json');
  const [editorValue, setEditorValue] = useState('');
  const [originalInput, setOriginalInput] = useState('');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  
  // New state for Sprint 1 features
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [filterType, setFilterType] = useState<'all' | 'added' | 'modified' | 'removed'>('all');
  const [filterArea, setFilterArea] = useState<'all' | 'naming' | 'validation' | 'accessibility' | 'descriptions'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  
  const {
    currentSchema,
    convertedSchema,
    enhancedSchema,
    validationResults,
    enhancements,
    loading,
    error,
    convertSchema,
    enhanceSchema,
    validateSchema,
    setCurrentSchema,
    clearError,
  } = useSchemaStore();

  // Add to history when schema changes
  const addToHistory = useCallback((schema: any, action: string) => {
    const newEntry: HistoryEntry = {
      schema: JSON.parse(JSON.stringify(schema)),
      timestamp: Date.now(),
      action,
    };
    
    // Remove any history after current index
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newEntry);
    
    // Limit history to 50 entries
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
    }
  }, [history, historyIndex, setCurrentSchema]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextEntry = history[nextIndex];
      setCurrentSchema(nextEntry.schema);
      setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex, setCurrentSchema]);

  // Export functions
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(currentSchema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadYAML = () => {
    const yamlStr = yaml.dump(currentSchema);
    const blob = new Blob([yamlStr], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTypeScript = () => {
    const tsInterface = generateTypeScriptInterface(currentSchema);
    const blob = new Blob([tsInterface], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(JSON.stringify(currentSchema, null, 2));
    // You could add a toast notification here
  };

  // Import from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      let detectedFormat: 'json' | 'yaml' | 'xml' = 'json';
      if (extension === 'yaml' || extension === 'yml') detectedFormat = 'yaml';
      else if (extension === 'xml') detectedFormat = 'xml';
      
      setFormat(detectedFormat);
      setEditorValue(content);
      setOriginalInput(content);
      await convertSchema(content, detectedFormat);
    };
    reader.readAsText(file);
  };

  // Import from URL
  const handleImportFromURL = async () => {
    if (!importUrl) return;
    
    try {
      const response = await fetch(`http://localhost:3000/schema/import-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });
      
      const data = await response.json();
      if (data.schema) {
        setCurrentSchema(data.schema);
        addToHistory(data.schema, 'Imported from URL');
        setShowImportDialog(false);
        setImportUrl('');
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  // Apply template from library
  const handleSelectTemplate = (schema: any) => {
    setCurrentSchema(schema);
    addToHistory(schema, 'Applied template');
  };

  // Generate TypeScript interface from JSON Schema
  const generateTypeScriptInterface = (schema: any, interfaceName = 'Schema'): string => {
    const lines: string[] = [];
    lines.push(`export interface ${interfaceName} {`);
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        const required = schema.required?.includes(key);
        const optional = required ? '' : '?';
        const tsType = jsonSchemaTypeToTS(prop);
        const description = prop.description ? `  /** ${prop.description} */\n` : '';
        lines.push(`${description}  ${key}${optional}: ${tsType};`);
      });
    }
    
    lines.push('}');
    return lines.join('\n');
  };

  const jsonSchemaTypeToTS = (prop: any): string => {
    if (prop.type === 'string') return 'string';
    if (prop.type === 'number' || prop.type === 'integer') return 'number';
    if (prop.type === 'boolean') return 'boolean';
    if (prop.type === 'array') {
      const itemType = prop.items ? jsonSchemaTypeToTS(prop.items) : 'any';
      return `${itemType}[]`;
    }
    if (prop.type === 'object') {
      if (prop.properties) {
        const nested: string[] = [];
        Object.entries(prop.properties).forEach(([key, value]: [string, any]) => {
          nested.push(`${key}: ${jsonSchemaTypeToTS(value)}`);
        });
        return `{ ${nested.join('; ')} }`;
      }
      return 'Record<string, any>';
    }
    return 'any';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S - Download
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        downloadJSON();
      }
      // Ctrl+C - Copy (when not in editor)
      if (e.ctrlKey && e.key === 'c' && document.activeElement?.tagName !== 'TEXTAREA') {
        copyToClipboard();
      }
      // Ctrl+Z - Undo
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z - Redo
      if (e.ctrlKey && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
      // Ctrl+Enter - Convert
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleConvert();
      }
      // Ctrl+K - Ask AI
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        handleEnhance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSchema, undo, redo]);

  const handleConvert = async () => {
    setOriginalInput(editorValue);
    await convertSchema(editorValue, format);
  };

  const handleEnhance = async () => {
    const schema = currentSchema || JSON.parse(editorValue);
    setAppliedSuggestions(new Set());
    await enhanceSchema(schema, {
      focusAreas: ['naming', 'validation', 'accessibility', 'descriptions'],
    });
  };

  const handleValidate = async () => {
    const schema = currentSchema || JSON.parse(editorValue);
    await validateSchema(schema);
  };

  const toggleSuggestion = (index: number, enhancement: any) => {
    if (!currentSchema) return;

    const isCurrentlyApplied = appliedSuggestions.has(index);
    const updatedSchema = JSON.parse(JSON.stringify(currentSchema));
    const pathParts = enhancement.path.split('.');
    
    let target = updatedSchema;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!target[pathParts[i]]) {
        target[pathParts[i]] = {};
      }
      target = target[pathParts[i]];
    }
    
    const lastKey = pathParts[pathParts.length - 1];
    
    if (isCurrentlyApplied) {
      if (enhancement.changeType === 'added') {
        delete target[lastKey];
      } else if (enhancement.changeType === 'modified') {
        target[lastKey] = enhancement.originalValue;
      } else if (enhancement.changeType === 'removed') {
        target[lastKey] = enhancement.originalValue;
      }
      
      const newApplied = new Set(appliedSuggestions);
      newApplied.delete(index);
      setAppliedSuggestions(newApplied);
      addToHistory(updatedSchema, `Reverted: ${enhancement.path}`);
    } else {
      if (enhancement.changeType === 'added') {
        target[lastKey] = enhancement.newValue;
      } else if (enhancement.changeType === 'modified') {
        target[lastKey] = enhancement.newValue;
      } else if (enhancement.changeType === 'removed') {
        delete target[lastKey];
      }
      
      setAppliedSuggestions(new Set([...appliedSuggestions, index]));
      addToHistory(updatedSchema, `Applied: ${enhancement.path}`);
    }
    
    setCurrentSchema(updatedSchema);
  };

  const applyAllSuggestions = () => {
    if (enhancedSchema) {
      setCurrentSchema(enhancedSchema);
      setAppliedSuggestions(new Set(enhancements.map((_, i) => i)));
      addToHistory(enhancedSchema, 'Applied all suggestions');
    }
  };

  useEffect(() => {
    if (currentSchema) {
      setEditorValue(JSON.stringify(currentSchema, null, 2));
    }
  }, [currentSchema]);

  // Filter suggestions
  const filteredEnhancements = enhancements.filter((change) => {
    if (filterType !== 'all' && change.changeType !== filterType) return false;
    if (searchTerm && !change.path.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const showComparison = originalInput && convertedSchema;

  return (
    <div className="grid grid-cols-1 gap-6 h-full">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Schema Editor</CardTitle>
          <CardDescription>Edit your schema in JSON, YAML, or XML format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Selector */}
          <div className="flex gap-2 items-center flex-wrap">
            <Label className="self-center">Format:</Label>
            <div className="flex gap-1">
              {(['json', 'yaml', 'xml'] as const).map((fmt) => (
                <Button
                  key={fmt}
                  size="sm"
                  variant={format === fmt ? 'default' : 'outline'}
                  onClick={() => setFormat(fmt)}
                >
                  {fmt.toUpperCase()}
                </Button>
              ))}
            </div>

            {/* Import & Template Buttons */}
            <div className="flex gap-1 ml-2">
              <Button
                onClick={() => setShowTemplateLibrary(true)}
                variant="outline"
                size="sm"
                title="Choose from templates"
              >
                <Library className="mr-2 h-4 w-4" />
                Templates
              </Button>
              
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  title="Upload file"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".json,.yaml,.yml,.xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button
                onClick={() => setShowImportDialog(true)}
                variant="outline"
                size="sm"
                title="Import from URL"
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 ml-auto flex-wrap">
              <Button onClick={handleConvert} disabled={loading || !editorValue} size="sm">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Convert <span className="hidden md:inline ml-1">to JSON Schema</span>
              </Button>
              <Button 
                onClick={handleEnhance} 
                disabled={loading || !currentSchema}
                variant="secondary"
                size="sm"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Ask AI
              </Button>
              <Button 
                onClick={handleValidate} 
                disabled={loading || !currentSchema}
                variant="outline"
                size="sm"
              >
                Validate
              </Button>
            </div>
          </div>

          {/* Export/Download Bar */}
          {currentSchema && (
            <div className="flex gap-2 items-center border-t pt-4">
              <Label className="text-sm font-semibold">Export:</Label>
              <Button onClick={downloadJSON} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <Button onClick={downloadYAML} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                YAML
              </Button>
              <Button onClick={downloadTypeScript} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                TypeScript
              </Button>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>

              {/* Undo/Redo */}
              <div className="flex gap-1 ml-auto">
                <Button 
                  onClick={undo} 
                  disabled={historyIndex <= 0}
                  variant="ghost"
                  size="sm"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={redo} 
                  disabled={historyIndex >= history.length - 1}
                  variant="ghost"
                  size="sm"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md flex justify-between items-start">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span>{error}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={clearError}>
                ×
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Split View: Original vs Converted */}
      {showComparison ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Original {format.toUpperCase()} Input</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Editor
                  height="500px"
                  language={format === 'yaml' ? 'yaml' : format === 'xml' ? 'xml' : 'json'}
                  value={originalInput}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Converted JSON Schema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Editor
                  height="500px"
                  language="json"
                  value={editorValue}
                  onChange={(value) => setEditorValue(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Input Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <Editor
                height="500px"
                language={format === 'yaml' ? 'yaml' : format === 'xml' ? 'xml' : 'json'}
                value={editorValue}
                onChange={(value) => setEditorValue(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResults.valid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Validation Results
            </CardTitle>
            <CardDescription>
              {validationResults.summary.errors} errors, {validationResults.summary.warnings} warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {validationResults.results.map((result: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="font-semibold text-sm">{result.validatorName}</div>
                  {result.issues.map((issue: any, issueIdx: number) => (
                    <div
                      key={issueIdx}
                      className={`text-sm p-2 rounded ${
                        issue.severity === 'error'
                          ? 'bg-destructive/10 text-destructive'
                          : issue.severity === 'warning'
                          ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      <div className="font-medium">
                        [{issue.severity.toUpperCase()}] {issue.path}
                      </div>
                      <div>{issue.message}</div>
                      {issue.suggestion && (
                        <div className="text-xs mt-1 opacity-75">💡 {issue.suggestion}</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive AI Enhancement Suggestions */}
      {enhancements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Enhancement Suggestions ({filteredEnhancements.length})
              </span>
              <Button size="sm" onClick={applyAllSuggestions} variant="secondary">
                <Check className="mr-2 h-4 w-4" />
                Apply All
              </Button>
            </CardTitle>
            <CardDescription>
              Click individual suggestions to apply them one-by-one
            </CardDescription>

            {/* Filtering Controls */}
            <div className="flex gap-2 items-center flex-wrap pt-4 border-t">
              <Filter className="h-4 w-4" />
              <Label className="text-xs">Filter:</Label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                <option value="added">Added</option>
                <option value="modified">Modified</option>
                <option value="removed">Removed</option>
              </select>

              <input
                type="text"
                placeholder="Search path..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs border rounded px-2 py-1 flex-1 min-w-[200px]"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEnhancements.map((change, idx) => {
                const originalIndex = enhancements.indexOf(change);
                const isApplied = appliedSuggestions.has(originalIndex);
                return (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 transition-all ${
                      isApplied
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-500 cursor-pointer'
                        : 'bg-card hover:bg-accent/50 cursor-pointer'
                    }`}
                    onClick={() => toggleSuggestion(originalIndex, change)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {change.path}
                          {isApplied && (
                            <span className="flex items-center gap-1 text-green-600 text-xs">
                              <Check className="h-4 w-4" />
                              Applied
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {change.changeType.toUpperCase()}
                        </div>
                        <div className="text-sm mt-2">{change.reason}</div>
                        {change.changeType === 'modified' && (
                          <div className="mt-2 text-xs space-y-1 font-mono">
                            <div className="text-red-600 dark:text-red-400">
                              - {JSON.stringify(change.originalValue)}
                            </div>
                            <div className="text-green-600 dark:text-green-400">
                              + {JSON.stringify(change.newValue)}
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={isApplied ? 'outline' : 'default'}
                        className="ml-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSuggestion(originalIndex, change);
                        }}
                      >
                        {isApplied ? (
                          <>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Undo
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Apply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibrary
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}

      {/* Import from URL Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Import from URL</CardTitle>
              <CardDescription>Enter the URL of a schema to import</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="import-url">Schema URL</Label>
                <input
                  id="import-url"
                  type="url"
                  placeholder="https://example.com/schema.json"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImportDialog(false);
                    setImportUrl('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportFromURL}
                  disabled={!importUrl}
                >
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
