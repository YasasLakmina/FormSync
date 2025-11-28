/**
 * Template Builder Component
 * 
 * Drag-and-drop form builder for non-technical users
 * Features:
 * - Stepper UI for guided form creation
 * - Field type selection and configuration
 * - Validation options
 * - Accessibility settings
 * - Generate JSON Schema button
 */

import React, { useState } from 'react';
import { useSchemaStore } from '../stores/schemaStore';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Plus, Trash2, FileJson } from 'lucide-react';

interface FieldDefinition {
  id: string;
  name: string;
  type: string;
  title: string;
  description: string;
  required: boolean;
  validation?: Record<string, any>;
  accessibility?: Record<string, string>;
}

export const TemplateBuilder: React.FC = () => {
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [currentField, setCurrentField] = useState<Partial<FieldDefinition>>({
    type: 'string',
    required: false,
  });
  
  const { setCurrentSchema } = useSchemaStore();

  const fieldTypes = [
    { value: 'string', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'integer', label: 'Integer' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'array', label: 'Array' },
    { value: 'object', label: 'Object' },
  ];

  const addField = () => {
    if (!currentField.name) {
      alert('Please enter a field name');
      return;
    }

    const newField: FieldDefinition = {
      id: Date.now().toString(),
      name: currentField.name,
      type: currentField.type || 'string',
      title: currentField.title || currentField.name,
      description: currentField.description || '',
      required: currentField.required || false,
      validation: currentField.validation,
      accessibility: currentField.accessibility,
    };

    setFields([...fields, newField]);
    setCurrentField({ type: 'string', required: false });
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const generateSchema = () => {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    fields.forEach((field) => {
      const property: any = {
        type: field.type,
        title: field.title,
      };

      if (field.description) {
        property.description = field.description;
      }

      if (field.validation) {
        Object.assign(property, field.validation);
      }

      if (field.accessibility) {
        property['x-accessibility'] = field.accessibility;
      }

      properties[field.name] = property;

      if (field.required) {
        required.push(field.name);
      }
    });

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties,
      required,
    };

    setCurrentSchema(schema);
    alert('Schema generated! Switch to Technical Editor to view and enhance.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Field Builder */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Field</CardTitle>
            <CardDescription>Configure form fields without writing code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Field Name */}
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name *</Label>
              <input
                id="fieldName"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., email, firstName, age"
                value={currentField.name || ''}
                onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
              />
            </div>

            {/* Field Type */}
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <select
                id="fieldType"
                className="w-full px-3 py-2 border rounded-md"
                value={currentField.type}
                onChange={(e) => setCurrentField({ ...currentField, type: e.target.value })}
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Field Title */}
            <div className="space-y-2">
              <Label htmlFor="fieldTitle">Display Title</Label>
              <input
                id="fieldTitle"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Label shown to users"
                value={currentField.title || ''}
                onChange={(e) => setCurrentField({ ...currentField, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="fieldDesc">Description</Label>
              <textarea
                id="fieldDesc"
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
                placeholder="Help text for this field"
                value={currentField.description || ''}
                onChange={(e) => setCurrentField({ ...currentField, description: e.target.value })}
              />
            </div>

            {/* Required Checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="fieldRequired"
                type="checkbox"
                checked={currentField.required || false}
                onChange={(e) => setCurrentField({ ...currentField, required: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="fieldRequired" className="cursor-pointer">
                Required field
              </Label>
            </div>

            {/* Validation (Simplified) */}
            {currentField.type === 'string' && (
              <div className="space-y-2">
                <Label>Validation (Optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min length"
                    className="px-3 py-2 border rounded-md"
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        validation: {
                          ...currentField.validation,
                          minLength: parseInt(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max length"
                    className="px-3 py-2 border rounded-md"
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        validation: {
                          ...currentField.validation,
                          maxLength: parseInt(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Accessibility */}
            <div className="space-y-2">
              <Label htmlFor="ariaLabel">ARIA Label (Accessibility)</Label>
              <input
                id="ariaLabel"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Screen reader label"
                onChange={(e) =>
                  setCurrentField({
                    ...currentField,
                    accessibility: {
                      ...currentField.accessibility,
                      'aria-label': e.target.value,
                    },
                  })
                }
              />
            </div>

            <Button onClick={addField} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Fields List & Schema Generation */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Form Fields ({fields.length})</span>
              <Button onClick={generateSchema} disabled={fields.length === 0} size="sm">
                <FileJson className="mr-2 h-4 w-4" />
                Generate Schema
              </Button>
            </CardTitle>
            <CardDescription>Your form structure</CardDescription>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No fields added yet. Start by adding a field on the left.
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 flex justify-between items-start hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {field.title || field.name}
                        {field.required && (
                          <span className="text-xs bg-primary/20 px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-mono bg-muted px-1 rounded">{field.name}</span>
                        <span className="mx-2">•</span>
                        <span>{field.type}</span>
                      </div>
                      {field.description && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {field.description}
                        </div>
                      )}
                      {Object.keys(field.validation || {}).length > 0 && (
                        <div className="text-xs mt-2 flex gap-1 flex-wrap">
                          {Object.entries(field.validation || {}).map(([key, value]) => (
                            <span key={key} className="bg-blue-500/10 px-2 py-0.5 rounded">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeField(field.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm">💡 How to use</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>1. Add fields using the form on the left</p>
            <p>2. Configure validation and accessibility options</p>
            <p>3. Click "Generate Schema" to create a JSON Schema</p>
            <p>4. Switch to Technical Editor to view, validate, or enhance with AI</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
