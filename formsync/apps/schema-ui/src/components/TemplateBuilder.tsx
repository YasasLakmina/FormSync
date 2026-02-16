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
import { Plus, FileJson, Trash2, ArrowRight, Check, GripVertical, Mail, Phone, Link, Calendar, Lock, AlignLeft, Hash, ToggleLeft, Wand2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from './ui/alert-dialog';
import { schemaApi } from '../api/schemaApi';

interface SchemaField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  // Validation options
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  // Default values
  default?: any;
  placeholder?: string;
  example?: any;
}

interface TemplateBuilderProps {
  onUseSchema?: (schemaJson: string) => void; // Callback to send schema to Technical Editor
}

// Pre-built field templates for quick adding
interface FieldTemplate {
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    name: 'email',
    type: 'string',
    description: 'Email address with validation',
    icon: <Mail className="h-4 w-4" />,
    color: 'blue'
  },
  {
    name: 'phone',
    type: 'string',
    description: 'Phone number',
    icon: <Phone className="h-4 w-4" />,
    color: 'green'
  },
  {
    name: 'website',
    type: 'string',
    description: 'URL/Website address',
    icon: <Link className="h-4 w-4" />,
    color: 'purple'
  },
  {
    name: 'date',
    type: 'string',
    description: 'Date picker',
    icon: <Calendar className="h-4 w-4" />,
    color: 'orange'
  },
  {
    name: 'password',
    type: 'string',
    description: 'Password field',
    icon: <Lock className="h-4 w-4" />,
    color: 'red'
  },
  {
    name: 'description',
    type: 'string',
    description: 'Long text area',
    icon: <AlignLeft className="h-4 w-4" />,
    color: 'gray'
  },
  {
    name: 'age',
    type: 'number',
    description: 'Numeric value',
    icon: <Hash className="h-4 w-4" />,
    color: 'indigo'
  },
  {
    name: 'accept_terms',
    type: 'boolean',
    description: 'Checkbox/Toggle',
    icon: <ToggleLeft className="h-4 w-4" />,
    color: 'teal'
  }
];

// Pre-built schema templates
interface SchemaTemplate {
  name: string;
  description: string;
  fields: Omit<SchemaField, 'id'>[];
}

const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    name: 'Contact Form',
    description: 'Basic contact information',
    fields: [
      { name: 'name', type: 'string', required: true, description: 'Full name', minLength: 2, maxLength: 100 },
      { name: 'email', type: 'string', required: true, description: 'Email address', format: 'email' },
      { name: 'phone', type: 'string', required: false, description: 'Phone number' },
      { name: 'message', type: 'string', required: true, description: 'Message content', minLength: 10, maxLength: 1000 }
    ]
  },
  {
    name: 'Newsletter Signup',
    description: 'Email subscription',
    fields: [
      { name: 'email', type: 'string', required: true, description: 'Email address', format: 'email' },
      { name: 'first_name', type: 'string', required: true, description: 'First name' },
      { name: 'last_name', type: 'string', required: false, description: 'Last name' },
      { name: 'consent', type: 'boolean', required: true, description: 'Marketing consent' }
    ]
  },
  {
    name: 'Login Form',
    description: 'User authentication',
    fields: [
      { name: 'email', type: 'string', required: true, description: 'Email address', format: 'email' },
      { name: 'password', type: 'string', required: true, description: 'Password', minLength: 8 },
      { name: 'remember_me', type: 'boolean', required: false, description: 'Remember me' }
    ]
  },
  {
    name: 'Registration Form',
    description: 'New user signup',
    fields: [
      { name: 'username', type: 'string', required: true, description: 'Unique username', minLength: 3, maxLength: 20 },
      { name: 'email', type: 'string', required: true, description: 'Email address', format: 'email' },
      { name: 'password', type: 'string', required: true, description: 'Password', minLength: 8 },
      { name: 'confirm_password', type: 'string', required: true, description: 'Confirm password', minLength: 8 },
      { name: 'terms_accepted', type: 'boolean', required: true, description: 'Accept terms and conditions' }
    ]
  },
  {
    name: 'Feedback Form',
    description: 'Customer feedback',
    fields: [
      { name: 'name', type: 'string', required: true, description: 'Your name' },
      { name: 'email', type: 'string', required: true, description: 'Email address', format: 'email' },
      { name: 'rating', type: 'number', required: true, description: 'Rating (1-5)', minimum: 1, maximum: 5 },
      { name: 'comments', type: 'string', required: false, description: 'Additional comments', maxLength: 500 },
      { name: 'would_recommend', type: 'boolean', required: true, description: 'Would you recommend us?' }
    ]
  },
  {
    name: 'Booking Form',
    description: 'Appointment booking',
    fields: [
      { name: 'name', type: 'string', required: true, description: 'Full name' },
      { name: 'email', type: 'string', required: true, description: 'Email address', format: 'email' },
      { name: 'phone', type: 'string', required: true, description: 'Phone number' },
      { name: 'date', type: 'string', required: true, description: 'Booking date', format: 'date' },
      { name: 'time', type: 'string', required: true, description: 'Preferred time' },
      { name: 'service', type: 'string', required: true, description: 'Service type' }
    ]
  },
  {
    name: 'Job Application',
    description: 'Employment application',
    fields: [
      { name: 'full_name', type: 'string', required: true, description: 'Full name' },
      { name: 'email', type: 'string', required: true, description: 'Email address', format: 'email' },
      { name: 'phone', type: 'string', required: true, description: 'Phone number' },
      { name: 'resume', type: 'string', required: true, description: 'Resume/CV' },
      { name: 'cover_letter', type: 'string', required: false, description: 'Cover letter' },
      { name: 'position', type: 'string', required: true, description: 'Position applied for' }
    ]
  },
  {
    name: 'Support Ticket',
    description: 'Help desk request',
    fields: [
      { name: 'name', type: 'string', required: true, description: 'Your name' },
      { name: 'email', type: 'string', required: true, description: 'Email address', format: 'email' },
      { name: 'subject', type: 'string', required: true, description: 'Issue subject' },
      { name: 'priority', type: 'string', required: true, description: 'Priority level' },
      { name: 'description', type: 'string', required: true, description: 'Issue description', minLength: 20 },
      { name: 'attachments', type: 'string', required: false, description: 'File attachments' }
    ]
  },
  {
    name: 'Order Form',
    description: 'Purchase order',
    fields: [
      { name: 'customer_name', type: 'string', required: true, description: 'Customer name' },
      { name: 'email', type: 'string', required: true, description: 'Email address', format: 'email' },
      { name: 'product', type: 'string', required: true, description: 'Product name' },
      { name: 'quantity', type: 'number', required: true, description: 'Quantity', minimum: 1 },
      { name: 'shipping_address', type: 'string', required: true, description: 'Shipping address' },
      { name: 'payment_method', type: 'string', required: true, description: 'Payment method' }
    ]
  }
];

// Sortable Field Item Component
interface SortableFieldItemProps {
  field: SchemaField;
  index: number;
  onToggleRequired: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({ 
  field, 
  index, 
  onToggleRequired, 
  onRemove,
  onEdit
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all bg-white dark:bg-neutral-800"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="h-5 w-5 text-neutral-400" />
          </div>

          <div className="w-12 h-12 rounded-xl border border-transparent bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-border flex items-center justify-center shadow-lg relative">
            <div className="absolute inset-[1px] bg-white dark:bg-neutral-800 rounded-lg"></div>
            <span className="relative z-10 bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold text-lg">
              {field.name[0].toUpperCase()}
            </span>
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

      <div className="flex items-center gap-2 mt-3">
        {/* Required/Optional Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleRequired(field.id)}
            className="min-w-[100px] border-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
          >
            {field.required ? (
              <>
                <Check className="h-4 w-4 text-indigo-600 mr-1" />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Required
                </span>
              </>
            ) : (
              <span className="text-neutral-600 dark:text-neutral-400">Optional</span>
            )}
          </Button>
        {/* Edit Field Button - Opens Modal */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(field.id)}
          className="hover:bg-blue-100 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400"
          title="Edit field"
        >
          <span className="text-xs">✏️ Edit</span>
        </Button>

          

          {/* Delete Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(field.id)}
            className="hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
            title="Delete field"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ onUseSchema }) => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('string');
  const [newFieldDescription, setNewFieldDescription] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  
  // Schema name state
  const [schemaName, setSchemaName] = useState('');
  const [nameSuggestionLoading, setNameSuggestionLoading] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Add field from template
  const addFieldTemplate = (template: FieldTemplate) => {
    const newField: SchemaField = {
      id: `field-${Date.now()}`,
      name: template.name,
      type: template.type,
      required: template.name === 'email' || template.name === 'password', // Email and password required by default
      description: template.description
    };
    setFields([...fields, newField]);
    toast.success(`${template.name} field added!`);
  };

  // Update field properties (for validation editing)
  const updateField = (id: string, updates: Partial<SchemaField>) => {
    setFields(fields.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  // Handle drag end for reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Load schema template
  const loadSchemaTemplate = (templateName: string) => {
    const template = SCHEMA_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      const newFields = template.fields.map(field => ({
        ...field,
        id: `field-${Date.now()}-${Math.random()}`
      }));
      setFields(newFields);
      // Auto-fill schema name from template
      setSchemaName(template.name);
      toast.success(`Loaded ${template.name} template!`);
    }
  };

  const generateSchema = (schemaTitle?: string) => {
    const properties: any = {};
    const required: string[] = [];

    fields.forEach(field => {
      const fieldSchema: any = {
        type: field.type,
        ...(field.description && { description: field.description }),
        // Add validation properties
        ...(field.minLength && { minLength: field.minLength }),
        ...(field.maxLength && { maxLength: field.maxLength }),
        ...(field.pattern && { pattern: field.pattern }),
        ...(field.format && { format: field.format }),
        ...(field.minimum !== undefined && { minimum: field.minimum }),
        ...(field.maximum !== undefined && { maximum: field.maximum }),
        ...(field.multipleOf && { multipleOf: field.multipleOf }),
        // Add default values
        ...(field.default !== undefined && { default: field.default }),
        ...(field.placeholder && { 'x-placeholder': field.placeholder }),
        ...(field.example !== undefined && { examples: [field.example] }),
      };
      properties[field.name] = fieldSchema;
      if (field.required) {
        required.push(field.name);
      }
    });

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      ...(schemaTitle && { title: schemaTitle }),
      properties,
      ...(required.length > 0 && { required }),
    };

    return schema;
  };

  // AI Suggest Name Handler
  const handleSuggestName = async () => {
    if (fields.length === 0) {
      toast.error('Please add at least one field first');
      return;
    }

    setNameSuggestionLoading(true);
    try {
      const fieldNames = fields.map(f => f.name);
      const response = await schemaApi.suggestName({ fields: fieldNames });
      const suggestedName = response.data.suggestedName;
      setSchemaName(suggestedName);
      toast.success('AI suggested a schema name!', {
        description: `"${suggestedName}"`,
      });
    } catch (error: any) {
      toast.error('Failed to suggest name', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setNameSuggestionLoading(false);
    }
  };

  const handleUseSchema = async () => {
    if (fields.length === 0) {
      toast.error('Please add at least one field before using the schema');
      return;
    }

    // Ensure schema has a name (use AI if not provided)
    let finalName = schemaName.trim();
    if (!finalName) {
      try {
        const fieldNames = fields.map(f => f.name);
        const response = await schemaApi.suggestName({ fields: fieldNames });
        finalName = response.data.suggestedName;
        setSchemaName(finalName);
      } catch (error) {
        // Fallback to generic name
        finalName = `Schema ${new Date().getTime()}`;
        setSchemaName(finalName);
      }
    }

    const schema = generateSchema(finalName);
    const schemaJson = JSON.stringify(schema, null, 2);
    
    // Send to Technical Editor via callback
    if (onUseSchema) {
      onUseSchema(schemaJson);
    }
    
    toast.success('Schema transferred to Technical Editor! Switch to Technical Editor tab to continue.');
  };

  return (
    <div className="h-full flex gap-4">
      {/* Left Panel - Field Creation */}
      <Card className="w-80 border-2 border-indigo-200 dark:border-indigo-700 bg-white dark:bg-neutral-900 shadow-lg">
        <CardHeader className="border-b border-indigo-200 dark:border-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Plus className="h-5 w-5" />
            Create Your Schema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {/* Schema Name Input */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-neutral-700 dark:text-neutral-300">
              Schema Name *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Contact Form, User Registration"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4" />

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
            size="lg"
            variant="outline"
            className="w-full gap-2 py-6 text-base font-semibold border-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
          >
            <Plus className="h-5 w-5 text-indigo-600" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              Add Field to Schema
            </span>
          </Button>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-300 text-center">
              ⚡ Quick Add Common Fields
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TEMPLATES.map((template) => (
                <Button
                  key={template.name}
                  onClick={() => addFieldTemplate(template)}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  title={template.description}
                >
                  {template.icon}
                  <span className="text-xs capitalize">{template.name}</span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-4">
              Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300">Enter</kbd> to quickly add
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Center Panel - Field List */}
      <Card className="flex-1 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
              <FileJson className="h-5 w-5" />
              Schema Fields ({fields.length})
            </CardTitle>
            <Button
              onClick={handleUseSchema}
              disabled={fields.length === 0}
              size="lg"
              variant="outline"
              className="gap-2 border-2 hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-5 w-5 text-green-600" />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold">
                Use Schema in Editor
              </span>
              <ArrowRight className="h-5 w-5 text-green-600" />
            </Button>
          </div>
          {/* Template Button - Opens Modal */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-2">
            <Button
              onClick={() => setShowTemplateModal(true)}
              variant="outline"
              size="lg"
              className="w-full gap-2 border-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
            >
              <FileJson className="h-5 w-5 text-indigo-600" />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                Quick Start Templates
              </span>
            </Button>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      index={index}
                      onToggleRequired={toggleRequired}
                      onRemove={removeField}
                      onEdit={() => setExpandedFieldId(field.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
            {JSON.stringify(generateSchema(schemaName || undefined), null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Template Selection Modal */}
      <AlertDialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Quick Start Templates</AlertDialogTitle>
            <AlertDialogDescription>
              Choose a pre-built template to get started quickly
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="grid grid-cols-3 gap-3 my-4 max-h-[500px] overflow-y-auto pr-2">
            {SCHEMA_TEMPLATES.map((template) => (
              <button
                key={template.name}
                onClick={() => {
                  loadSchemaTemplate(template.name);
                  setShowTemplateModal(false);
                }}
                className="text-left p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all group"
              >
                <div className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {template.name}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                  {template.description}
                </div>
                <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 font-mono">
                  {template.fields.length} fields
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Field Edit Modal */}
      {expandedFieldId && (() => {
        const editField = fields.find(f => f.id === expandedFieldId);
        if (!editField) return null;
        
        return (
          <AlertDialog open={true} onOpenChange={() => setExpandedFieldId(null)}>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Field: {editField.name}</AlertDialogTitle>
                <AlertDialogDescription>
                  Modify field properties and validation rules
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-4 my-4">
                {/* Basic Info Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">Field Name</label>
                      <input
                        type="text"
                        value={editField.name}
                        onChange={(e) => updateField(editField.id, { name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">Type</label>
                      <select
                        value={editField.type}
                        onChange={(e) => updateField(editField.id, { type: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="integer">Integer</option>
                        <option value="boolean">Boolean</option>
                        <option value="array">Array</option>
                        <option value="object">Object</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">Description</label>
                      <input
                        type="text"
                        value={editField.description || ''}
                        onChange={(e) => updateField(editField.id, { description: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800"
                        placeholder="Optional description"
                      />
                    </div>
                  </div>
                </div>

                {/* Validation Rules Section */}
                {editField.type === 'string' && (
                  <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                    <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Validation Rules</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">Min Length</label>
                        <input
                          type="number"
                          value={editField.minLength || ''}
                          onChange={(e) => updateField(editField.id, { minLength: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800"
                          placeholder="Minimum"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">Max Length</label>
                        <input
                          type="number"
                          value={editField.maxLength || ''}
                          onChange={(e) => updateField(editField.id, { maxLength: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800"
                          placeholder="Maximum"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">Pattern (Regex)</label>
                        <input
                          type="text"
                          value={editField.pattern || ''}
                          onChange={(e) => updateField(editField.id, { pattern: e.target.value || undefined })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 font-mono"
                          placeholder="e.g., ^[A-Z][a-z]+$"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">Format</label>
                        <select
                          value={editField.format || ''}
                          onChange={(e) => updateField(editField.id, { format: e.target.value || undefined })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800"
                        >
                          <option value="">None</option>
                          <option value="email">Email</option>
                          <option value="uri">URL</option>
                          <option value="date">Date</option>
                          <option value="time">Time</option>
                          <option value="date-time">DateTime</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {(editField.type === 'number' || editField.type === 'integer') && (
                  <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                    <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Validation Rules</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">Minimum</label>
                        <input
                          type="number"
                          value={editField.minimum !== undefined ? editField.minimum : ''}
                          onChange={(e) => updateField(editField.id, { minimum: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800"
                          placeholder="Min value"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">Maximum</label>
                        <input
                          type="number"
                          value={editField.maximum !== undefined ? editField.maximum : ''}
                          onChange={(e) => updateField(editField.id, { maximum: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800"
                          placeholder="Max value"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <AlertDialogCancel className="mt-0" onClick={() => setExpandedFieldId(null)}>Done</AlertDialogCancel>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        );
      })()}
    </div>
  );
};
