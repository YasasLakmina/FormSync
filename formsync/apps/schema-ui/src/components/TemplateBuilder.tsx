/**
 * Template Builder Component - Sprint 4 Version
 * 
 * Simple visual schema builder for creating templates
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Save, FileJson, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SchemaField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export const TemplateBuilder: React.FC = () => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('string');

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
    };

    setFields([...fields, newField]);
    setNewFieldName('');
    toast.success('Field added');
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
      {/* Left Panel - Field Library */}
      <Card className="w-80 glass border-2 border-neutral-200 dark:border-neutral-700">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-700">
          <CardTitle className="text-lg flex items-center gap-2">
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
              className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block text-neutral-700 dark:text-neutral-300">
              Field Type *
            </label>
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>

          <Button
            onClick={addField}
            variant="gradient"
            size="lg"
            className="w-full gap-2 py-6 text-base font-semibold hover:scale-105 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Field to Schema
          </Button>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
              Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded">Enter</kbd> to quickly add
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Center Panel - Canvas */}
      <Card className="flex-1 glass border-2 border-neutral-200 dark:border-neutral-700">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Schema Fields ({fields.length})
            </CardTitle>
            <Button
              onClick={handleSave}
              variant="gradient"
              size="sm"
              className="gap-2"
              disabled={fields.length === 0}
            >
              <Save className="h-4 w-4" />
              Download Schema
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {fields.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-primary mb-6">
                <FileJson className="h-12 w-12 text-white" />
              </div>
              <p className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">No Fields Yet</p>
              <p className="text-sm text-neutral-500">Add fields from the left panel to build your schema</p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-950/30 rounded-lg">
                <span className="text-sm text-primary-700 dark:text-primary-300">← Start by adding your first field</span>
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
                  className="glass p-5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {field.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-base text-neutral-800 dark:text-neutral-100">{field.name}</div>
                        <div className="text-sm text-neutral-500">
                          Type: <span className="text-primary-600 dark:text-primary-400 font-semibold">{field.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant={field.required ? 'gradient' : 'outline'}
                        onClick={() => toggleRequired(field.id)}
                        className="min-w-[100px]"
                      >
                        {field.required ? '✓ Required' : 'Optional'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeField(field.id)}
                        className="hover:bg-red-100 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Preview */}
      <Card className="w-96 glass">
        <CardHeader>
          <CardTitle className="text-lg">Schema Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-neutral-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[600px]">
            {JSON.stringify(generateSchema(), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
