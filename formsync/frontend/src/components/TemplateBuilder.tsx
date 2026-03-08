/**
 * Template Builder Component - Enhanced Non-Technical Version
 *
 * Visual schema builder for non-technical users with:
 * - Field-by-field schema creation
 * - "Use Schema" button to transfer to Technical Editor
 * - Improved UX and button styling
 */

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Plus,
  FileJson,
  Trash2,
  ArrowRight,
  Check,
  GripVertical,
  Mail,
  Phone,
  Link,
  Calendar,
  Lock,
  AlignLeft,
  Hash,
  ToggleLeft,
  Pencil,
  Type,
  ToggleRight,
  List,
  Braces,
  Copy,
  FileText,
  ChevronDown,
  MessageSquare,
  UserPlus,
  Star,
  Briefcase,
  LifeBuoy,
  ShoppingCart,
  Layers,
  LayoutTemplate,
  PenLine,
  Wand2,
  X,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitle_,
  AlertDialogDescription as AlertDialogDescription_,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { schemaApi } from "../api/schemaApi";

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
    name: "email",
    type: "string",
    description: "Email address with validation",
    icon: <Mail className="h-4 w-4" />,
    color: "blue",
  },
  {
    name: "phone",
    type: "string",
    description: "Phone number",
    icon: <Phone className="h-4 w-4" />,
    color: "green",
  },
  {
    name: "website",
    type: "string",
    description: "URL/Website address",
    icon: <Link className="h-4 w-4" />,
    color: "purple",
  },
  {
    name: "date",
    type: "string",
    description: "Date picker",
    icon: <Calendar className="h-4 w-4" />,
    color: "orange",
  },
  {
    name: "password",
    type: "string",
    description: "Password field",
    icon: <Lock className="h-4 w-4" />,
    color: "red",
  },
  {
    name: "description",
    type: "string",
    description: "Long text area",
    icon: <AlignLeft className="h-4 w-4" />,
    color: "gray",
  },
  {
    name: "age",
    type: "number",
    description: "Numeric value",
    icon: <Hash className="h-4 w-4" />,
    color: "indigo",
  },
  {
    name: "accept_terms",
    type: "boolean",
    description: "Checkbox/Toggle",
    icon: <ToggleLeft className="h-4 w-4" />,
    color: "teal",
  },
];

// Pre-built schema templates
interface SchemaTemplate {
  name: string;
  description: string;
  fields: Omit<SchemaField, "id">[];
}

const TEMPLATE_CONFIG: Record<string, { icon: React.ReactNode }> = {
  "Contact Form": { icon: <MessageSquare className="h-4 w-4" /> },
  "Newsletter Signup": { icon: <Mail className="h-4 w-4" /> },
  "Login Form": { icon: <Lock className="h-4 w-4" /> },
  "Registration Form": { icon: <UserPlus className="h-4 w-4" /> },
  "Feedback Form": { icon: <Star className="h-4 w-4" /> },
  "Booking Form": { icon: <Calendar className="h-4 w-4" /> },
  "Job Application": { icon: <Briefcase className="h-4 w-4" /> },
  "Support Ticket": { icon: <LifeBuoy className="h-4 w-4" /> },
  "Order Form": { icon: <ShoppingCart className="h-4 w-4" /> },
};

const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    name: "Contact Form",
    description: "Basic contact information",
    fields: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Full name",
        minLength: 2,
        maxLength: 100,
      },
      {
        name: "email",
        type: "string",
        required: true,
        description: "Email address",
        format: "email",
      },
      {
        name: "phone",
        type: "string",
        required: false,
        description: "Phone number",
      },
      {
        name: "message",
        type: "string",
        required: true,
        description: "Message content",
        minLength: 10,
        maxLength: 1000,
      },
    ],
  },
  {
    name: "Newsletter Signup",
    description: "Email subscription",
    fields: [
      {
        name: "email",
        type: "string",
        required: true,
        description: "Email address",
        format: "email",
      },
      {
        name: "first_name",
        type: "string",
        required: true,
        description: "First name",
      },
      {
        name: "last_name",
        type: "string",
        required: false,
        description: "Last name",
      },
      {
        name: "consent",
        type: "boolean",
        required: true,
        description: "Marketing consent",
      },
    ],
  },
  {
    name: "Login Form",
    description: "User authentication",
    fields: [
      {
        name: "email",
        type: "string",
        required: true,
        description: "Email address",
        format: "email",
      },
      {
        name: "password",
        type: "string",
        required: true,
        description: "Password",
        minLength: 8,
      },
      {
        name: "remember_me",
        type: "boolean",
        required: false,
        description: "Remember me",
      },
    ],
  },
  {
    name: "Registration Form",
    description: "New user signup",
    fields: [
      {
        name: "username",
        type: "string",
        required: true,
        description: "Unique username",
        minLength: 3,
        maxLength: 20,
      },
      {
        name: "email",
        type: "string",
        required: true,
        description: "Email address",
        format: "email",
      },
      {
        name: "password",
        type: "string",
        required: true,
        description: "Password",
        minLength: 8,
      },
      {
        name: "confirm_password",
        type: "string",
        required: true,
        description: "Confirm password",
        minLength: 8,
      },
      {
        name: "terms_accepted",
        type: "boolean",
        required: true,
        description: "Accept terms and conditions",
      },
    ],
  },
  {
    name: "Feedback Form",
    description: "Customer feedback",
    fields: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Your name",
      },
      {
        name: "email",
        type: "string",
        required: true,
        description: "Email address",
        format: "email",
      },
      {
        name: "rating",
        type: "number",
        required: true,
        description: "Rating (1-5)",
        minimum: 1,
        maximum: 5,
      },
      {
        name: "comments",
        type: "string",
        required: false,
        description: "Additional comments",
        maxLength: 500,
      },
      {
        name: "would_recommend",
        type: "boolean",
        required: true,
        description: "Would you recommend us?",
      },
    ],
  },
  {
    name: "Booking Form",
    description: "Appointment booking",
    fields: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Full name",
      },
      {
        name: "email",
        type: "string",
        required: true,
        description: "Email address",
        format: "email",
      },
      {
        name: "phone",
        type: "string",
        required: true,
        description: "Phone number",
      },
      {
        name: "date",
        type: "string",
        required: true,
        description: "Booking date",
        format: "date",
      },
      {
        name: "time",
        type: "string",
        required: true,
        description: "Preferred time",
      },
      {
        name: "service",
        type: "string",
        required: true,
        description: "Service type",
      },
    ],
  },
  {
    name: "Job Application",
    description: "Employment application",
    fields: [
      {
        name: "full_name",
        type: "string",
        required: true,
        description: "Full name",
      },
      {
        name: "email",
        type: "string",
        required: true,
        description: "Email address",
        format: "email",
      },
      {
        name: "phone",
        type: "string",
        required: true,
        description: "Phone number",
      },
      {
        name: "resume",
        type: "string",
        required: true,
        description: "Resume/CV",
      },
      {
        name: "cover_letter",
        type: "string",
        required: false,
        description: "Cover letter",
      },
      {
        name: "position",
        type: "string",
        required: true,
        description: "Position applied for",
      },
    ],
  },
  {
    name: "Support Ticket",
    description: "Help desk request",
    fields: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Your name",
      },
      {
        name: "email",
        type: "string",
        required: true,
        description: "Email address",
        format: "email",
      },
      {
        name: "subject",
        type: "string",
        required: true,
        description: "Issue subject",
      },
      {
        name: "priority",
        type: "string",
        required: true,
        description: "Priority level",
      },
      {
        name: "description",
        type: "string",
        required: true,
        description: "Issue description",
        minLength: 20,
      },
      {
        name: "attachments",
        type: "string",
        required: false,
        description: "File attachments",
      },
    ],
  },
  {
    name: "Order Form",
    description: "Purchase order",
    fields: [
      {
        name: "customer_name",
        type: "string",
        required: true,
        description: "Customer name",
      },
      {
        name: "email",
        type: "string",
        required: true,
        description: "Email address",
        format: "email",
      },
      {
        name: "product",
        type: "string",
        required: true,
        description: "Product name",
      },
      {
        name: "quantity",
        type: "number",
        required: true,
        description: "Quantity",
        minimum: 1,
      },
      {
        name: "shipping_address",
        type: "string",
        required: true,
        description: "Shipping address",
      },
      {
        name: "payment_method",
        type: "string",
        required: true,
        description: "Payment method",
      },
    ],
  },
];

// Sortable Field Item Component
interface SortableFieldItemProps {
  field: SchemaField;
  index: number;
  onToggleRequired: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  isDragOverlay?: boolean;
}

const TYPE_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  string: {
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    icon: <Type className="h-3 w-3" />,
  },
  number: {
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: <Hash className="h-3 w-3" />,
  },
  integer: {
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: <Hash className="h-3 w-3" />,
  },
  boolean: {
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: <ToggleRight className="h-3 w-3" />,
  },
  array: {
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    icon: <List className="h-3 w-3" />,
  },
  object: {
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-200 dark:border-pink-800",
    icon: <Braces className="h-3 w-3" />,
  },
};

const getTypeConfig = (type: string) => TYPE_CONFIG[type] || TYPE_CONFIG.string;

const TYPE_LABELS: Record<string, string> = {
  string: "Text",
  number: "Number",
  integer: "Integer",
  boolean: "Yes / No",
  array: "List",
  object: "Group",
};
const getTypeLabel = (type: string) => TYPE_LABELS[type] ?? type;

const FIELD_EXAMPLES: Record<string, string> = {
  "string:email": "e.g. john@example.com",
  "string:uri": "e.g. https://example.com",
  "string:date": "e.g. 2026-03-07",
  "string:date-time": "e.g. 2026-03-07T09:00:00Z",
  "string:time": "e.g. 09:00",
  "string:": "e.g. Hello World",
  "number:": "e.g. 42",
  "integer:": "e.g. 5",
  "boolean:": "true or false (checkbox / toggle)",
  "array:": 'e.g. ["item1", "item2"]',
  "object:": 'e.g. { "key": "value" }',
};
const getFieldExample = (type: string, format?: string) =>
  FIELD_EXAMPLES[`${type}:${format ?? ""}`] ??
  FIELD_EXAMPLES[`${type}:`] ??
  null;

// Smart field auto-detection
interface DetectionHint {
  type: string;
  format?: string;
  pattern?: string;
  label: string;
  icon: React.ReactNode;
}

const DETECTION_RULES: Array<{ patterns: RegExp[]; hint: DetectionHint }> = [
  {
    patterns: [/email/i],
    hint: { type: "string", format: "email", label: "Email field", icon: <Mail className="h-3 w-3" /> },
  },
  {
    patterns: [/phone|mobile|tel|cell/i],
    hint: { type: "string", pattern: "^\\+?[0-9 \\-()]{7,15}$", label: "Phone field", icon: <Phone className="h-3 w-3" /> },
  },
  {
    patterns: [/url|website|link|href|site/i],
    hint: { type: "string", format: "uri", label: "URL field", icon: <Link className="h-3 w-3" /> },
  },
  {
    patterns: [/(^|_)date($|_)|birthday|birth_date|dob/i],
    hint: { type: "string", format: "date", label: "Date field", icon: <Calendar className="h-3 w-3" /> },
  },
  {
    patterns: [/^age$|^count$|quantity|price|amount|score|rating|weight|height|total|qty/i],
    hint: { type: "number", label: "Number field", icon: <Hash className="h-3 w-3" /> },
  },
  {
    patterns: [/^is_|^has_|accept|agree|term|consent|remember|subscribe|active|verified|enabled/i],
    hint: { type: "boolean", label: "Yes / No field", icon: <ToggleRight className="h-3 w-3" /> },
  },
  {
    patterns: [/password|passwd/i],
    hint: { type: "string", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$", label: "Password field", icon: <Lock className="h-3 w-3" /> },
  },
  {
    patterns: [/description|message|comment|bio|note|details|content|body|summary/i],
    hint: { type: "string", label: "Long text field", icon: <AlignLeft className="h-3 w-3" /> },
  },
];

const detectFieldType = (name: string): DetectionHint | null => {
  if (!name.trim()) return null;
  for (const rule of DETECTION_RULES) {
    if (rule.patterns.some((p) => p.test(name))) return rule.hint;
  }
  return null;
};

const TYPE_HINTS: Record<string, string> = {
  string: "Stores any text — names, messages, descriptions",
  number: "Stores numeric values — age, price, count",
  integer: "Stores whole numbers — quantity, step count",
  boolean: "A true / false value — checkbox, toggle",
  array: "A list of multiple items in order",
  object: "A group of nested fields",
};

const FieldCard: React.FC<
  SortableFieldItemProps & { dragHandleProps?: any }
> = ({
  field,
  index: _index,
  onToggleRequired,
  onRemove,
  onEdit,
  onDuplicate,
  isDragOverlay = false,
  dragHandleProps,
}) => {
  const tc = getTypeConfig(field.type);
  return (
    <div
      className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-white dark:bg-neutral-900 transition-all ${
        isDragOverlay
          ? "border-purple-400 shadow-2xl shadow-purple-200/60 dark:shadow-purple-900/40 ring-2 ring-purple-300/50"
          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md"
      }`}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400 dark:group-hover:text-neutral-500 transition-colors" />
      </div>

      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm ${
          tc.bg
        } ${tc.color}`}
      >
        {field.name[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 truncate">
            {field.name}
          </span>
          {field.required && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex-shrink-0">
              required
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              tc.bg
            } ${tc.color} ${tc.border}`}
          >
            {tc.icon}
            {getTypeLabel(field.type)}
          </span>
          {field.description && (
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
              {field.description}
            </span>
          )}

        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleRequired(field.id)}
          title={field.required ? "Mark optional" : "Mark required"}
          className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
            field.required
              ? "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/60"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDuplicate(field.id)}
          title="Duplicate field"
          className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-violet-100 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onEdit(field.id)}
          title="Edit field"
          className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onRemove(field.id)}
          title="Remove field"
          className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const SortableFieldItem: React.FC<SortableFieldItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isDragging ? 0.3 : 1,
        scale: isDragging ? 0.98 : 1,
      }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <FieldCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </motion.div>
  );
};

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  onUseSchema,
}) => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("string");
  const [newFieldDescription, setNewFieldDescription] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string>(SCHEMA_TEMPLATES[0].name);

  // Smart detection state
  const [detectedHint, setDetectedHint] = useState<DetectionHint | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<string | undefined>(undefined);
  const [editDetectedHint, setEditDetectedHint] = useState<DetectionHint | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset edit-panel hint whenever a different field is opened
  React.useEffect(() => { setEditDetectedHint(null); }, [expandedFieldId]);

  // Schema name state
  const [schemaName, setSchemaName] = useState("");

  // Undo / redo history
  const [undoStack, setUndoStack] = useState<SchemaField[][]>([]);
  const [redoStack, setRedoStack] = useState<SchemaField[][]>([]);

  // Template modal search
  const [templateSearch, setTemplateSearch] = useState("");

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ── History helpers ──────────────────────────────────────────────────
  const setFieldsWithHistory = (newFields: SchemaField[]) => {
    setUndoStack((prev) => [...prev, fields]);
    setRedoStack([]);
    setFields(newFields);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, fields]);
    setUndoStack((s) => s.slice(0, -1));
    setFields(prev);
    toast.success("Undone");
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((s) => [...s, fields]);
    setRedoStack((r) => r.slice(0, -1));
    setFields(next);
    toast.success("Redone");
  };

  const clearAll = () => {
    if (fields.length === 0) return;
    setFieldsWithHistory([]);
    setSchemaName("");
    toast.success("Cleared — undo to restore");
  };
  // ─────────────────────────────────────────────────────────────────────

  const addField = () => {
    if (!newFieldName.trim()) {
      toast.error("Please enter a field name");
      return;
    }

    const newField: SchemaField = {
      id: Date.now().toString(),
      name: newFieldName,
      type: newFieldType,
      required: false,
      description: newFieldDescription || undefined,
      ...(pendingFormat && { format: pendingFormat }),
    };

    setFieldsWithHistory([...fields, newField]);
    setNewFieldName("");
    setNewFieldDescription("");
    setDetectedHint(null);
    setHintDismissed(false);
    setPendingFormat(undefined);
    toast.success("Field added successfully");
  };

  const removeField = (id: string) => {
    setFieldsWithHistory(fields.filter((f) => f.id !== id));
    toast.success("Field removed");
  };

  const toggleRequired = (id: string) => {
    setFieldsWithHistory(
      fields.map((f) => (f.id === id ? { ...f, required: !f.required } : f)),
    );
  };

  // Add field from template
  const addFieldTemplate = (template: FieldTemplate) => {
    const newField: SchemaField = {
      id: `field-${Date.now()}`,
      name: template.name,
      type: template.type,
      required: template.name === "email" || template.name === "password", // Email and password required by default
      description: template.description,
    };
    setFieldsWithHistory([...fields, newField]);
    toast.success(`${template.name} field added!`);
  };

  // Update field properties (for validation editing)
  const updateField = (id: string, updates: Partial<SchemaField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const duplicateField = (id: string) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    const copy: SchemaField = {
      ...field,
      id: `field-${Date.now()}`,
      name: `${field.name}_copy`,
    };
    const idx = fields.findIndex((f) => f.id === id);
    setFieldsWithHistory([...fields.slice(0, idx + 1), copy, ...fields.slice(idx + 1)]);
    toast.success(`Duplicated "${field.name}"`);
  };

  // Handle drag end for reordering
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      setFieldsWithHistory(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const activeField = fields.find((f) => f.id === activeId);

  // Load schema template
  const loadSchemaTemplate = (templateName: string) => {
    const template = SCHEMA_TEMPLATES.find((t) => t.name === templateName);
    if (template) {
      const newFields = template.fields.map((field) => ({
        ...field,
        id: `field-${Date.now()}-${Math.random()}`,
      }));
      setFieldsWithHistory(newFields);
      // Auto-fill schema name from template
      setSchemaName(template.name);
      toast.success(`Loaded ${template.name} template!`);
    }
  };

  const generateSchema = (schemaTitle?: string) => {
    const properties: any = {};
    const required: string[] = [];

    fields.forEach((field) => {
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
        ...(field.placeholder && { "x-placeholder": field.placeholder }),
        ...(field.example !== undefined && { examples: [field.example] }),
      };
      properties[field.name] = fieldSchema;
      if (field.required) {
        required.push(field.name);
      }
    });

    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      ...(schemaTitle && { title: schemaTitle }),
      properties,
      ...(required.length > 0 && { required }),
    };

    return schema;
  };

  const handleUseSchema = async () => {
    if (fields.length === 0) {
      toast.error("Please add at least one field before using the schema");
      return;
    }

    // Ensure schema has a name (use AI if not provided)
    let finalName = schemaName.trim();
    if (!finalName) {
      try {
        const fieldNames = fields.map((f) => f.name);
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

    toast.success(
      "Schema transferred to Technical Editor! Switch to Technical Editor tab to continue.",
    );
  };

  return (
    <div className="h-full flex gap-4">
      {/* Left Panel - Field Creation */}
      <div className="w-72 flex flex-col gap-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden flex-shrink-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
              <Plus className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            </span>
            Create Your Schema
          </h2>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 ml-8">
            Define fields one by one
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Schema Name */}
          <div className="px-5 pt-5 pb-4">
            <label className="block text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">
              Schema Name <span className="text-purple-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="e.g., Contact Form"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-dashed border-neutral-200 dark:border-neutral-800" />

          {/* Add Field Section */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Add a Field
            </p>

            <div>
              <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                Name <span className="text-purple-500">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                placeholder="e.g., email, username"
                value={newFieldName}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewFieldName(val);
                  setHintDismissed(false);
                  setPendingFormat(undefined);
                  setDetectedHint(detectFieldType(val));
                }}
                onKeyDown={(e) => e.key === "Enter" && addField()}
                className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
              />
              {/* Auto-detection chip */}
              <AnimatePresence>
                {detectedHint && !hintDismissed && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex items-center gap-2 mt-1.5 px-2.5 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800"
                  >
                    <Wand2 className="h-3 w-3 text-violet-500 flex-shrink-0" />
                    <span className="text-[11px] text-violet-700 dark:text-violet-300 flex-1 font-medium truncate">
                      {detectedHint.label} detected
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewFieldType(detectedHint.type);
                        setPendingFormat(detectedHint.format);
                        setHintDismissed(true);
                        toast.success(`Type set to ${detectedHint.label}`);
                      }}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors flex-shrink-0"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => setHintDismissed(true)}
                      className="text-violet-400 hover:text-violet-600 transition-colors flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                Type <span className="text-purple-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={newFieldType}
                  onChange={(e) => {
                    setNewFieldType(e.target.value);
                    setPendingFormat(undefined);
                  }}
                  className="w-full appearance-none px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all pr-8"
                >
                  <option value="string">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Yes / No</option>
                  <option value="array">List</option>
                  <option value="object">Group</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
              </div>
              {/* Contextual type hint */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={newFieldType}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5 leading-snug"
                >
                  {TYPE_HINTS[newFieldType]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                Description{" "}
                <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., User's email address"
                value={newFieldDescription}
                onChange={(e) => setNewFieldDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addField()}
                className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
              />
            </div>

            <button
              onClick={addField}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-purple-500 text-purple-600 dark:text-purple-400 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/20 active:bg-purple-100 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4 shrink-0 " />
                Add Field
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-dashed border-neutral-200 dark:border-neutral-800" />

          {/* Quick Add */}
          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
              Quick Add
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {FIELD_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => addFieldTemplate(template)}
                  title={template.description}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-all"
                >
                  <span className="text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                    {template.icon}
                  </span>
                  <span className="capitalize truncate">{template.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center mt-3">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-[10px] font-mono text-neutral-600 dark:text-neutral-300">
                Enter
              </kbd>{" "}
              to quickly add
            </p>
          </div>
        </div>
      </div>

      {/* Center Panel - Field List */}
      <Card className="flex-1 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <CardTitle className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Schema Fields{" "}
                <span className="text-neutral-400 dark:text-neutral-500 font-normal">
                  ({fields.length})
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {fields.length > 0 && (
                <>
                  <button
                    onClick={undo}
                    disabled={undoStack.length === 0}
                    title="Undo"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    title="Redo"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />
                  <button
                    onClick={clearAll}
                    title="Clear all fields"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />
                </>
              )}
              <Button
                onClick={handleUseSchema}
                disabled={fields.length === 0}
                size="sm"
                className="gap-1.5 bg-white dark:bg-neutral-900 border border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-none"
              >
                <Check className="h-3.5 w-3.5" />
                Use in Editor
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {/* Template Button - Opens Modal */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-2">
            {/* Field health hints */}
            {fields.length > 0 && (() => {
              const noDesc = fields.filter((f) => !f.description).length;
              const noValidation = fields.filter((f) =>
                f.type === "string"
                  ? !f.minLength && !f.maxLength && !f.format && !f.pattern
                  : f.type === "number" || f.type === "integer"
                  ? f.minimum === undefined && f.maximum === undefined
                  : false,
              ).length;
              if (noDesc === 0 && noValidation === 0) return null;
              return (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {noDesc > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <span className="w-1 h-1 rounded-full bg-amber-500" />
                      {noDesc} field{noDesc !== 1 ? "s" : ""} missing description
                    </span>
                  )}
                  {noValidation > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                      <span className="w-1 h-1 rounded-full bg-sky-500" />
                      {noValidation} field{noValidation !== 1 ? "s" : ""} without validation
                    </span>
                  )}
                </div>
              );
            })()}
            <Button
              onClick={() => setShowTemplateModal(true)}
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <FileJson className="h-3.5 w-3.5 text-purple-500" />
              Quick Start Templates
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
          {fields.length === 0 ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="py-8 px-4"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.4, type: "spring", stiffness: 180 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/50 dark:to-indigo-950/50 flex items-center justify-center mx-auto mb-5 shadow-sm"
              >
                <Layers className="h-8 w-8 text-purple-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.28 }}
                className="text-center mb-7"
              >
                <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100 mb-1.5">
                  Let's build your schema
                </h3>
                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                  Choose how you want to get started
                </p>
              </motion.div>

              <div className="flex flex-col gap-2.5 w-full max-w-xs mx-auto">
                {[
                  {
                    icon: <LayoutTemplate className="h-5 w-5" />,
                    label: "Use a Template",
                    description: "Pick from 9 ready-made schemas",
                    color: "purple" as const,
                    onClick: () => setShowTemplateModal(true),
                  },
                  {
                    icon: <PenLine className="h-5 w-5" />,
                    label: "Add Fields Myself",
                    description: "Build it field by field",
                    color: "blue" as const,
                    onClick: () => setTimeout(() => nameInputRef.current?.focus(), 50),
                  },
                ].map((opt, i) => (
                  <motion.button
                    key={opt.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.09, duration: 0.3, ease: "easeOut" }}
                    whileHover={{ scale: 1.012, transition: { duration: 0.12 } }}
                    whileTap={{ scale: 0.978 }}
                    onClick={opt.onClick}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-colors group ${
                      opt.color === "purple"
                        ? "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-700"
                        : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        opt.color === "purple"
                          ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60"
                          : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60"
                      }`}
                    >
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-bold mb-0.5 ${
                          opt.color === "purple"
                            ? "text-purple-900 dark:text-purple-100"
                            : "text-blue-900 dark:text-blue-100"
                        }`}
                      >
                        {opt.label}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {opt.description}
                      </div>
                    </div>
                    <ArrowRight
                      className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                        opt.color === "purple"
                          ? "text-purple-300"
                          : "text-blue-300"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        index={index}
                        onToggleRequired={toggleRequired}
                        onRemove={removeField}
                        onEdit={() => setExpandedFieldId(field.id)}
                        onDuplicate={duplicateField}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </SortableContext>
              <DragOverlay
                dropAnimation={{
                  duration: 200,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}
              >
                {activeField ? (
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.03, rotate: 0.8 }}
                    className="cursor-grabbing"
                  >
                    <FieldCard
                      field={activeField}
                      index={0}
                      onToggleRequired={() => {}}
                      onRemove={() => {}}
                      onEdit={() => {}}
                      onDuplicate={() => {}}
                      isDragOverlay
                      dragHandleProps={{}}
                    />
                  </motion.div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Right Panel - Live Preview */}
      <div
        className="w-100 flex-shrink-0 flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 overflow-hidden shadow-sm"
        style={{ minHeight: "800px", maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-neutral-200">
              Live Preview
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                JSON.stringify(
                  generateSchema(schemaName || undefined),
                  null,
                  2,
                ),
              );
              toast.success("Copied to clipboard");
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
        </div>
        {/* Code */}
        <div className="flex-1 overflow-auto">
          <pre className="text-[12px] font-mono leading-relaxed p-4 text-emerald-400">
            {JSON.stringify(generateSchema(schemaName || undefined), null, 2)
              .split("\n")
              .map((line, i) => (
                <div key={i} className="flex">
                  <span className="select-none text-neutral-600 w-7 shrink-0 text-right mr-4 leading-[1.7]">
                    {i + 1}
                  </span>
                  <span className="leading-[1.7]">{line}</span>
                </div>
              ))}
          </pre>
        </div>
        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            {fields.length} field{fields.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[11px] text-neutral-500">
            JSON Schema Draft-07
          </span>
        </div>
      </div>

      {/* Template Selection Modal — split-panel layout */}
      <AnimatePresence>
        {showTemplateModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="template-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => { setShowTemplateModal(false); setTemplateSearch(""); }}
              className="fixed inset-0 bg-black/60 z-50"
            />
            {/* Centering wrapper — static, pointer-events-none so backdrop clicks still close */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            {/* Panel */}
            <motion.div
              key="template-panel"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-900 flex pointer-events-auto"
              style={{ height: "540px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => { setShowTemplateModal(false); setTemplateSearch(""); }}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* ── Left: scrollable card list ── */}
              <div className="w-72 flex-shrink-0 flex flex-col border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
                {/* Header */}
                <div className="px-4 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      Quick Start Templates
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 ml-8">
                    {SCHEMA_TEMPLATES.length} ready-made schemas
                  </p>
                </div>

                {/* Search */}
                <div className="px-3 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                    />
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {(() => {
                    const filtered = SCHEMA_TEMPLATES.filter(
                      (t) =>
                        t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                        t.description.toLowerCase().includes(templateSearch.toLowerCase()),
                    );
                    if (filtered.length === 0)
                      return (
                        <div className="py-10 text-center">
                          <p className="text-xs text-neutral-400 dark:text-neutral-500">No templates found</p>
                        </div>
                      );
                    return filtered.map((template, i) => {
                      const cfg = TEMPLATE_CONFIG[template.name] ?? { icon: <FileJson className="h-4 w-4" /> };
                      const isActive = hoveredTemplate === template.name;
                      return (
                        <motion.button
                          key={template.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.2, ease: "easeOut" }}
                          onMouseEnter={() => setHoveredTemplate(template.name)}
                          onClick={() => {
                            if (fields.length > 0) {
                              setPendingTemplate(template.name);
                            } else {
                              loadSchemaTemplate(template.name);
                              setShowTemplateModal(false);
                              setTemplateSearch("");
                            }
                          }}
                          className={`w-full p-3 text-left rounded-xl border transition-all duration-150 ${
                            isActive
                              ? "bg-white dark:bg-neutral-900 border-purple-200 dark:border-purple-700 shadow-sm"
                              : "border-neutral-100 dark:border-neutral-700/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:border-neutral-200 dark:hover:border-neutral-600"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"}`}>
                              {cfg.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-semibold truncate ${isActive ? "text-purple-700 dark:text-purple-300" : "text-neutral-800 dark:text-neutral-200"}`}>
                                {template.name}
                              </div>
                              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                                {template.description}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 font-medium">
                                  {template.fields.length} fields
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${isActive ? "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400" : "bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"}`}>
                                  {template.fields.filter((f) => f.required).length} required
                                </span>
                              </div>
                            </div>
                            {isActive && <ChevronRight className="h-3.5 w-3.5 text-purple-400 flex-shrink-0 mt-2" />}
                          </div>
                        </motion.button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ── Right: animated detail panel ── */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
                <AnimatePresence mode="wait">
                  {(() => {
                    const template = SCHEMA_TEMPLATES.find((t) => t.name === hoveredTemplate);
                    if (!template) return null;
                    const cfg = TEMPLATE_CONFIG[template.name] ?? { icon: <FileJson className="h-5 w-5" /> };
                    return (
                      <motion.div
                        key={template.name}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex flex-col h-full"
                      >
                        {/* Detail header */}
                        <div className="px-7 pt-6 pb-5 border-b border-neutral-100 dark:border-neutral-800">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/50 dark:to-indigo-950/50 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                              {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-0.5">
                                {template.name}
                              </h3>
                              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                  {template.fields.length} fields total
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs text-purple-500 dark:text-purple-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                  {template.fields.filter((f) => f.required).length} required
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Field list */}
                        <div className="flex-1 overflow-y-auto px-7 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">Fields</p>
                          <div className="space-y-2">
                            {template.fields.map((f, idx) => {
                              const tc = getTypeConfig(f.type);
                              return (
                                <motion.div
                                  key={f.name}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.04, duration: 0.18 }}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"
                                >
                                  <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${tc.bg} ${tc.color}`}>
                                    {tc.icon}
                                  </span>
                                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex-1 truncate">
                                    {f.name}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${tc.bg} ${tc.color} ${tc.border}`}>
                                    {getTypeLabel(f.type)}
                                  </span>
                                  {f.required ? (
                                    <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-1.5 py-0.5 rounded-md flex-shrink-0">req</span>
                                  ) : (
                                    <span className="text-[10px] text-neutral-300 dark:text-neutral-600 flex-shrink-0">opt</span>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="px-7 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30">
                          <motion.button
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => {
                              if (fields.length > 0) {
                                setPendingTemplate(template.name);
                              } else {
                                loadSchemaTemplate(template.name);
                                setShowTemplateModal(false);
                                setTemplateSearch("");
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            Use {template.name}
                            <ArrowRight className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Replace Confirmation Dialog */}
      <AlertDialog open={!!pendingTemplate} onOpenChange={() => setPendingTemplate(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle_>Replace current fields?</AlertDialogTitle_>
            <AlertDialogDescription_>
              This will replace your {fields.length} current field
              {fields.length !== 1 ? "s" : ""} with the{" "}
              <strong>{pendingTemplate}</strong> template. This cannot be undone.
            </AlertDialogDescription_>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel
              className="mt-0 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
              onClick={() => setPendingTemplate(null)}
            >
              Keep mine
            </AlertDialogCancel>
            <button
              onClick={() => {
                if (pendingTemplate) {
                  loadSchemaTemplate(pendingTemplate);
                  setPendingTemplate(null);
                  setShowTemplateModal(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
            >
              Replace
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Field Edit Modal */}
      {expandedFieldId &&
        (() => {
          const editField = fields.find((f) => f.id === expandedFieldId);
          if (!editField) return null;

          return (
            <AlertDialog
              open={true}
              onOpenChange={() => setExpandedFieldId(null)}
            >
              <AlertDialogContent className="max-w-lg rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle_>
                    Edit: <span className="text-violet-600 dark:text-violet-400">{editField.name}</span>
                  </AlertDialogTitle_>
                  <AlertDialogDescription_>
                    Configure field properties and validation rules
                  </AlertDialogDescription_>
                </AlertDialogHeader>

                <div className="space-y-5 my-4">
                  {/* Basic Info Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={editField.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateField(editField.id, { name: val });
                            if (editField.type === "string") {
                              const hint = detectFieldType(val);
                              setEditDetectedHint(hint && (hint.format || hint.pattern) ? hint : null);
                            } else {
                              setEditDetectedHint(null);
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                        {editDetectedHint && (
                          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                            <span className="flex items-center gap-1.5 text-[11px] text-violet-700 dark:text-violet-300 font-medium flex-1">
                              {editDetectedHint.icon}
                              {editDetectedHint.label} detected
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                updateField(editField.id, {
                                  format: editDetectedHint.format || undefined,
                                  pattern: editDetectedHint.pattern || undefined,
                                });
                                setEditDetectedHint(null);
                              }}
                              className="px-2.5 py-1 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold transition-colors"
                            >
                              Apply
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditDetectedHint(null)}
                              className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                          Type
                        </label>
                        <select
                          value={editField.type}
                          onChange={(e) =>
                            updateField(editField.id, { type: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        >
                          <option value="string">Text</option>
                          <option value="number">Number</option>
                          <option value="integer">Integer</option>
                          <option value="boolean">Yes / No</option>
                          <option value="array">List</option>
                          <option value="object">Group</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={editField.description || ""}
                          onChange={(e) =>
                            updateField(editField.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                          placeholder="Optional description"
                        />
                      </div>
                      {/* Contextual example hint */}
                      {(() => {
                        const ex = getFieldExample(editField.type, editField.format);
                        return ex ? (
                          <div className="col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 flex-shrink-0">Example</span>
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">{ex}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* Validation Rules Section */}
                  {editField.type === "string" && (
                    <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                        Validation Rules
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                            Min Length
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={editField.minLength ?? ""}
                            onChange={(e) =>
                              updateField(editField.id, {
                                minLength: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                            placeholder="e.g. 2"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                            Max Length
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={editField.maxLength ?? ""}
                            onChange={(e) =>
                              updateField(editField.id, {
                                maxLength: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 ${
                              editField.maxLength !== undefined &&
                              editField.minLength !== undefined &&
                              editField.maxLength < editField.minLength
                                ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                                : "border-neutral-300 dark:border-neutral-600 focus:ring-violet-400"
                            }`}
                            placeholder="e.g. 100"
                          />
                        </div>
                        {editField.maxLength !== undefined &&
                          editField.minLength !== undefined &&
                          editField.maxLength < editField.minLength && (
                            <div className="col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[11px]">
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                              Max length ({editField.maxLength}) must be greater than min length ({editField.minLength}).
                            </div>
                          )}
                        {/* ── Input Format ── */}
                        <div className="col-span-2">
                          {(() => {
                            const FORMAT_PRESETS = [
                              { id: "none",    label: "No restriction — accept any text",  format: undefined,  pattern: undefined,                        hint: "" },
                              { id: "email",   label: "Email address",                     format: "email",    pattern: undefined,                        hint: "user@example.com" },
                              { id: "url",     label: "Website URL",                       format: "uri",      pattern: undefined,                        hint: "https://example.com" },
                              { id: "date",    label: "Date (YYYY-MM-DD)",                 format: "date",     pattern: undefined,                        hint: "2026-01-31" },
                              { id: "time",    label: "Time (HH:MM)",                      format: "time",     pattern: undefined,                        hint: "14:30" },
                              { id: "phone",   label: "Phone number",                      format: undefined,  pattern: "^\\+?[0-9 \\-()]{7,15}$",        hint: "+1 555 123 4567" },
                              { id: "numbers", label: "Numbers only",                      format: undefined,  pattern: "^[0-9]+$",                       hint: "42, 100, 9999" },
                              { id: "letters", label: "Letters only",                      format: undefined,  pattern: "^[A-Za-z]+$",                    hint: "John, Smith" },
                              { id: "nospace", label: "No spaces allowed",                 format: undefined,  pattern: "^\\S+$",                         hint: "username123" },
                              { id: "zip",     label: "Postal code / ZIP",                 format: undefined,  pattern: "^[0-9A-Z \\-]{3,10}$",          hint: "10001, SW1A" },
                              { id: "upper",    label: "Must start with capital letter",    format: undefined,  pattern: "^[A-Z]",                                                           hint: "John, London" },
                              { id: "password", label: "Password (strong)",                format: undefined,  pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$",        hint: "Min 8 chars, at least one uppercase letter and one number" },
                              { id: "custom",   label: "Custom pattern (advanced)",        format: undefined,  pattern: "__custom__",                                                        hint: "" },
                            ];

                            const isCustomActive = editField.pattern !== undefined && !FORMAT_PRESETS.some(
                              (p) => p.id !== "custom" && p.id !== "none" && p.pattern === editField.pattern
                            );

                            const activePreset = FORMAT_PRESETS.find((p) => {
                              if (p.id === "none")   return editField.pattern === undefined && !editField.format;
                              if (p.id === "custom") return isCustomActive;
                              if (p.format)          return editField.format === p.format;
                              return editField.pattern === p.pattern;
                            }) ?? FORMAT_PRESETS[0];

                            const selectValue = activePreset.id;

                            return (
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block">
                                  Input Format
                                </label>
                                <select
                                  value={selectValue}
                                  onChange={(e) => {
                                    const chosen = FORMAT_PRESETS.find((p) => p.id === e.target.value);
                                    if (!chosen) return;
                                    if (chosen.id === "none") {
                                      updateField(editField.id, { pattern: undefined, format: undefined });
                                    } else if (chosen.id === "custom") {
                                      updateField(editField.id, { format: undefined, pattern: "" });
                                    } else {
                                      updateField(editField.id, {
                                        format: chosen.format || undefined,
                                        pattern: chosen.pattern || undefined,
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                >
                                  {FORMAT_PRESETS.map((p) => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                  ))}
                                </select>

                                {/* Hint text for active preset */}
                                {activePreset.hint && (
                                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                                    Example: <span className="font-mono">{activePreset.hint}</span>
                                  </p>
                                )}

                                {/* Custom pattern text input */}
                                {(selectValue === "custom") && (
                                  <div className="space-y-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                                    <label className="text-xs font-medium text-violet-700 dark:text-violet-300 block">
                                      Enter your regex pattern
                                    </label>
                                    <input
                                      type="text"
                                      value={editField.pattern || ""}
                                      onChange={(e) =>
                                        updateField(editField.id, { pattern: e.target.value || undefined })
                                      }
                                      className="w-full px-3 py-2 text-sm border border-violet-300 dark:border-violet-700 rounded-lg bg-white dark:bg-neutral-800 font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
                                      placeholder="e.g., ^[A-Z][a-z]+$"
                                      autoFocus
                                    />
                                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                      Only input matching this pattern will be accepted.
                                    </p>
                                  </div>
                                )}

                                {/* Active rule tag */}
                                {(editField.pattern || editField.format) && activePreset.id !== "none" && (
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-[10px] font-mono border border-violet-200 dark:border-violet-800">
                                      {editField.format
                                        ? `format: ${editField.format}`
                                        : `pattern: ${editField.pattern}`}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateField(editField.id, { pattern: undefined, format: undefined })}
                                      className="text-[10px] text-neutral-400 hover:text-red-500 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {(editField.type === "number" ||
                    editField.type === "integer") && (
                    <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                        Validation Rules
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                            Minimum value
                          </label>
                          <input
                            type="number"
                            value={editField.minimum !== undefined ? editField.minimum : ""}
                            onChange={(e) =>
                              updateField(editField.id, {
                                minimum: e.target.value !== ""
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                            placeholder="e.g. 0"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                            Maximum value
                          </label>
                          <input
                            type="number"
                            value={editField.maximum !== undefined ? editField.maximum : ""}
                            onChange={(e) =>
                              updateField(editField.id, {
                                maximum: e.target.value !== ""
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 ${
                              editField.maximum !== undefined &&
                              editField.minimum !== undefined &&
                              editField.maximum < editField.minimum
                                ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                                : "border-neutral-300 dark:border-neutral-600 focus:ring-violet-400"
                            }`}
                            placeholder="e.g. 999"
                          />
                        </div>
                        {editField.maximum !== undefined &&
                          editField.minimum !== undefined &&
                          editField.maximum < editField.minimum && (
                            <div className="col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[11px]">
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                              Maximum ({editField.maximum}) must be greater than minimum ({editField.minimum}).
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <AlertDialogCancel
                    className="mt-0"
                    onClick={() => setExpandedFieldId(null)}
                  >
                    Done
                  </AlertDialogCancel>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          );
        })()}
    </div>
  );
};
