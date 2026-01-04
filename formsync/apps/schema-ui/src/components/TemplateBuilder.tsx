/**
 * Template Builder Component - Enhanced Non-Technical Version
 * 
 * Visual schema builder for non-technical users with:
 * - Field-by-field schema creation
 * - "Use Schema" button to transfer to Technical Editor
 * - Improved UX and button styling
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, Save, FileJson, Trash2, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SchemaField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface TemplateBuilderProps {
  onUseSchema?: (schemaJson: string) => void; // Callback to send schema to Technical Editor
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ onUseSchema }) => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('string');
  const [newFieldDescription, setNewFieldDescription] = useState('');

  const addField = () => {
    if (!newFieldName.trim()) {
      toast.error('Please enter a field name');
      return;
    }

    const newField: SchemaField = {
      id: Date.now().toString(),
      name: newFieldName,
      type: newFieldType,
      required: false,
      description: newFieldDescription || undefined,
    };

    setFields([...fields, newField]);
    setNewFieldName('');
    setNewFieldDescription('');
    toast.success('Field added successfully');
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    toast.success('Field removed');
  };

  const toggleRequired = (id: string) => {
    setFields(fields.map(f => 
      f.id === id ? { ...f, required: !f.required } : f
    ));
  };

  const generateSchema = () => {
    const properties: any = {};
    const required: string[] = [];

    fields.forEach(field => {
      properties[field.name] = {
        type: field.type,
        ...(field.description && { description: field.description }),
      };
      if (field.required) {
        required.push(field.name);
      }
    });

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties,
      ...(required.length > 0 && { required }),
    };

    return schema;
  };

  const handleUseSchema = () => {
    if (fields.length === 0) {
      toast.error('Please add at least one field before using the schema');
      return;
    }

    const schema = generateSchema();
    const schemaJson = JSON.stringify(schema, null, 2);
    
    // Send to Technical Editor via callback
    if (onUseSchema) {
      onUseSchema(schemaJson);
    }
    
    toast.success('Schema transferred to Technical Editor! Switch to Technical Editor tab to continue.');
  };

  const handleSave = () => {
    const schema = generateSchema();
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    toast.success('Schema downloaded');
  };

  return (
    <div className="h-full flex gap-4">
      {/* Left Panel - Field Creation */}
      <Card className="w-80 border-2 border-indigo-200 dark:border-indigo-700 bg-white dark:bg-neutral-900 shadow-lg">
        <CardHeader className="border-b border-indigo-200 dark:border-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Plus className="h-5 w-5" />
            Add New Field
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="text-sm font-semibold mb-2 block text-neutral-700 dark:text-neutral-300">
              Field Name *
            </label>
            <input
              type="text"
              placeholder="e.g., email, username"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addField()}
              className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block text-neutral-700 dark:text-neutral-300">
              Field Type *
            </label>
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block text-neutral-700 dark:text-neutral-300">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., User's email address"
              value={newFieldDescription}
              onChange={(e) => setNewFieldDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addField()}
              className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <Button
            onClick={addField}
            className="w-full gap-2 py-6 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:scale-105 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add Field to Schema
          </Button>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
              Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300">Enter</kbd> to quickly add
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Center Panel - Field List */}
      <Card className="flex-1 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
              <FileJson className="h-5 w-5" />
              Schema Fields ({fields.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleUseSchema}
                disabled={fields.length === 0}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4" />
                Use Schema in Editor
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSave}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={fields.length === 0}
              >
                <Save className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {fields.length === 0 ? (
            <div className="text-center py-20">
             
              <p className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">No Fields Yet</p>
              <p className="text-sm text-neutral-500 mb-4">Add fields from the left panel to build your schema</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                <span className="text-sm text-indigo-700 dark:text-indigo-300">← Start by adding your first field</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all bg-white dark:bg-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {field.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base text-neutral-800 dark:text-neutral-100">{field.name}</div>
                        <div className="text-sm text-neutral-500">
                          Type: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{field.type}</span>
                          {field.description && (
                            <span className="ml-2 text-neutral-400">• {field.description}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => toggleRequired(field.id)}
                        className={`min-w-[100px] ${
                          field.required
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                            : 'border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {field.required ? '✓ Required' : 'Optional'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeField(field.id)}
                        className="hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Live Preview */}
      <Card className="w-96 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-700">
          <CardTitle className="text-lg text-neutral-800 dark:text-neutral-100">Schema Preview</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <pre className="text-xs bg-neutral-900 dark:bg-neutral-950 text-green-400 p-4 rounded-lg overflow-auto max-h-[600px] font-mono">
            {JSON.stringify(generateSchema(), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
