/**
 * Template Builder Component - Sprint 4 Version
 * 
 * Simple visual schema builder for creating templates
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, Save, FileJson, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SchemaField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  label?: string;
  placeholder?: string;
  helpText?: string;
  description?: string;
}

export const TemplateBuilder: React.FC = () => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
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
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
    toast.success('Field removed');
  };

  const toggleRequired = (id: string) => {
    setFields(fields.map(f => 
      f.id === id ? { ...f, required: !f.required } : f
    ));
  };

  const updateFieldProperty = (id: string, property: keyof SchemaField, value: string | boolean) => {
    setFields(fields.map(f => 
      f.id === id ? { ...f, [property]: value } : f
    ));
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const getFieldCardClassName = (isSelected: boolean) => {
    return `glass p-5 rounded-xl border-2 hover:shadow-lg transition-all cursor-pointer ${
      isSelected
        ? 'border-primary-500 dark:border-primary-500 bg-primary-50/50 dark:bg-primary-950/30'
        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600'
    }`;
  };

  const generateSchema = () => {
    const properties: any = {};
    const required: string[] = [];

    fields.forEach(field => {
      properties[field.name] = {
        type: field.type,
        ...(field.label && { title: field.label }),
        ...(field.description && { description: field.description }),
        ...(field.helpText && { 'x-helpText': field.helpText }),
        ...(field.placeholder && { 'x-placeholder': field.placeholder }),
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
                  onClick={() => setSelectedFieldId(field.id)}
                  className={getFieldCardClassName(selectedFieldId === field.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {field.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-base text-neutral-800 dark:text-neutral-100">
                          {field.label || field.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          Type: <span className="text-primary-600 dark:text-primary-400 font-semibold">{field.type}</span>
                          {field.placeholder && (
                            <span className="ml-2 text-neutral-400">• {field.placeholder}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant={field.required ? 'gradient' : 'outline'}
                        onClick={(e) => handleButtonClick(e, () => toggleRequired(field.id))}
                        className="min-w-[100px]"
                      >
                        {field.required ? '✓ Required' : 'Optional'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleButtonClick(e, () => removeField(field.id))}
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

      {/* Right Panel - Property Editor or Preview */}
      <Card className="w-96 glass border-2 border-neutral-200 dark:border-neutral-700">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-700">
          <CardTitle className="text-lg">
            {selectedField ? 'Edit Properties' : 'Schema Preview'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {selectedField ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block text-neutral-700 dark:text-neutral-300">
                  Label
                </label>
                <input
                  type="text"
                  placeholder="Display label for the field"
                  value={selectedField.label || ''}
                  onChange={(e) => updateFieldProperty(selectedField.id, 'label', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-neutral-700 dark:text-neutral-300">
                  Placeholder
                </label>
                <input
                  type="text"
                  placeholder="Hint text for the input"
                  value={selectedField.placeholder || ''}
                  onChange={(e) => updateFieldProperty(selectedField.id, 'placeholder', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-neutral-700 dark:text-neutral-300">
                  Help Text
                </label>
                <textarea
                  placeholder="Additional help or instructions"
                  value={selectedField.helpText || ''}
                  onChange={(e) => updateFieldProperty(selectedField.id, 'helpText', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-neutral-700 dark:text-neutral-300">
                  Required
                </label>
                <Button
                  size="sm"
                  variant={selectedField.required ? 'gradient' : 'outline'}
                  onClick={() => toggleRequired(selectedField.id)}
                  className="w-full"
                >
                  {selectedField.required ? '✓ Required Field' : 'Optional Field'}
                </Button>
              </div>

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <h4 className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">Preview</h4>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {selectedField.label || selectedField.name}
                    {selectedField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder={selectedField.placeholder || ''}
                    disabled
                    aria-label={`Preview of ${selectedField.label || selectedField.name} field`}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900 text-sm"
                  />
                  {selectedField.helpText && (
                    <p className="text-xs text-neutral-500 mt-1">{selectedField.helpText}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <pre className="text-xs bg-neutral-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[600px]">
              {JSON.stringify(generateSchema(), null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
