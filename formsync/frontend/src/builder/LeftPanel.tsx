import React, { useState } from 'react';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    useBuilder,
    createField,
    collectAllFieldKeys,
    findFieldInTree,
    type CreateFieldOptions,
} from '../context/BuilderContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { FieldModel, FieldType } from '../types';
import {
    LucideIcon,
    Type,
    Mail,
    Lock,
    Hash,
    AlignLeft,
    Calendar,
    ChevronDown,
    CheckSquare,
    List,
    Upload,
    FileText,
    PenLine,
    Search,
    Calculator,
    Folder,
    GripVertical,
    Table2,
} from 'lucide-react';

// ─── Palette Config ───────────────────────────────────────────────────────────

type PaletteEntry = { type: FieldType; label: string; Icon: LucideIcon; repeaterAsTable?: boolean };
type PaletteGroup = { title: string; fields: PaletteEntry[] };

const PALETTE_GROUPS: PaletteGroup[] = [
    {
        title: 'Basic',
        fields: [
            { type: 'text', label: 'Text', Icon: Type },
            { type: 'email', label: 'Email', Icon: Mail },
            { type: 'password', label: 'Password', Icon: Lock },
            { type: 'number', label: 'Number', Icon: Hash },
            { type: 'textarea', label: 'Text Area', Icon: AlignLeft },
            { type: 'date', label: 'Date', Icon: Calendar },
        ],
    },
    {
        title: 'Choice',
        fields: [
            { type: 'select', label: 'Dropdown', Icon: ChevronDown },
            { type: 'checkbox', label: 'Checkbox', Icon: CheckSquare },
        ],
    },
    {
        title: 'Structure',
        fields: [
            { type: 'group', label: 'Group', Icon: Folder },
            { type: 'repeater', label: 'Repeater', Icon: List },
            { type: 'repeater', label: 'Repeating table', Icon: Table2, repeaterAsTable: true },
        ],
    },
    {
        title: 'Advanced',
        fields: [
            { type: 'file', label: 'File Upload', Icon: Upload },
            { type: 'richtext', label: 'Rich Text', Icon: FileText },
            { type: 'signature', label: 'Signature', Icon: PenLine },
            { type: 'typeahead', label: 'Typeahead', Icon: Search },
            { type: 'calculated', label: 'Calculated', Icon: Calculator },
        ],
    },
];

// ─── Palette Button ───────────────────────────────────────────────────────────

const PaletteButton: React.FC<{
    label: string;
    Icon: PaletteEntry['Icon'];
    onClick: () => void;
}> = ({ label, Icon, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        title={`Add ${label}`}
        aria-label={`Add ${label} field`}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: 5,
            background: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 500,
            color: '#475569',
            transition: 'border-color 0.1s, background 0.1s, color 0.1s',
            textAlign: 'left',
            fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
            e.currentTarget.style.color = '#6366f1';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = 'rgba(0,0,0,0.8)';
        }}
    >
        <Icon size={12} strokeWidth={2} />
        <span>{label}</span>
    </button>
);

// ─── Field Tree Item ──────────────────────────────────────────────────────────

const FieldTreeItem: React.FC<{
    field: FieldModel;
    selectedFieldId: string | null;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
    indent?: number;
    /** Drag handle shown only on root row (indent 0) in Layers */
    dragHandle?: React.ReactNode;
}> = ({ field, selectedFieldId, onSelect, onRemove, indent = 0, dragHandle }) => {
    const isSelected = selectedFieldId === field.id;
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.28rem 0.5rem',
                    paddingLeft: `${0.5 + indent * 1}rem`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                    marginBottom: 1,
                }}
                onClick={() => onSelect(field.id)}
            >
                {indent === 0 && dragHandle ? dragHandle : null}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#6366f1' : '#334155' }}>
                    {field.label}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(0,0,0,0.4)', flexShrink: 0, fontFamily: 'monospace' }}>{field.type}</span>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
                    title="Remove"
                    aria-label={`Remove ${field.label}`}
                    style={{
                        padding: '0 4px', lineHeight: '16px', fontSize: '0.85rem',
                        border: 'none', background: 'transparent', color: 'rgba(0,0,0,0.4)',
                        cursor: 'pointer', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.4)'; }}
                >
                    ×
                </button>
            </div>
            {field.children?.map((child) => (
                <FieldTreeItem
                    key={child.id}
                    field={child}
                    selectedFieldId={selectedFieldId}
                    onSelect={onSelect}
                    onRemove={onRemove}
                    indent={indent + 1}
                />
            ))}
        </div>
    );
};

const SortableRootFieldBlock: React.FC<{
    field: FieldModel;
    selectedFieldId: string | null;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
}> = ({ field, selectedFieldId, onSelect, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: field.id,
    });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.88 : 1,
    };
    const handle = (
        <button
            type="button"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            aria-label="Drag to reorder"
            title="Drag to reorder"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'grab',
                flexShrink: 0,
                touchAction: 'none',
            }}
        >
            <GripVertical size={14} strokeWidth={2} aria-hidden />
        </button>
    );
    return (
        <div ref={setNodeRef} style={style}>
            <FieldTreeItem
                field={field}
                selectedFieldId={selectedFieldId}
                onSelect={onSelect}
                onRemove={onRemove}
                indent={0}
                dragHandle={handle}
            />
        </div>
    );
};

// ─── Left Panel ───────────────────────────────────────────────────────────────

export const LeftPanel: React.FC = () => {
    const { state, dispatch, isWizardMode } = useBuilder();
    const [tab, setTab] = useState<'palette' | 'tree'>('palette');
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const orderedFields = state.form.layout.order
        .map((id) => state.form.fields.find((f) => f.id === id))
        .filter((f): f is FieldModel => !!f);
    const unlistedFields = state.form.fields.filter((f) => !state.form.layout.order.includes(f.id));
    const displayFields = [...orderedFields, ...unlistedFields];

    const handleAdd = (type: FieldType, palette?: CreateFieldOptions) => {
        const stepIndex = isWizardMode ? state.activeStep : undefined;
        const existingKeys = collectAllFieldKeys(state.form.fields);
        dispatch({
            type: 'ADD_FIELD',
            payload: createField(type, stepIndex, existingKeys, palette),
        });
    };

    const requestRemove = (id: string) => {
        setPendingRemoveId(id);
        setRemoveDialogOpen(true);
    };

    const pendingField = pendingRemoveId ? findFieldInTree(state.form.fields, pendingRemoveId) : undefined;

    const rootIds = displayFields.map((f) => f.id);

    const handleLayersDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = rootIds.indexOf(active.id as string);
        const newIndex = rootIds.indexOf(over.id as string);
        if (oldIndex < 0 || newIndex < 0) return;
        const nextOrder = arrayMove(rootIds, oldIndex, newIndex);
        dispatch({ type: 'REORDER_FIELDS', payload: nextOrder });
    };

    const tabBtn = (active: boolean): React.CSSProperties => ({
        flex: 1, padding: '0.35rem', border: 'none',
        borderBottom: `2px solid ${active ? '#6366f1' : 'transparent'}`,
        background: 'none', cursor: 'pointer', fontWeight: active ? 600 : 400,
        color: active ? '#6366f1' : '#64748b', fontSize: '0.72rem', fontFamily: 'inherit',
    });

    return (
        <div className="panel">
            <div className="panel-header" style={{ paddingBottom: 0, height: 'auto', flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: 40, paddingLeft: 0 }}>
                    <span style={{ color: '#000000' }}>Fields</span>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                    <button style={tabBtn(tab === 'palette')} onClick={() => setTab('palette')}>Palette</button>
                    <button style={tabBtn(tab === 'tree')} onClick={() => setTab('tree')}>
                        Layers ({displayFields.length})
                    </button>
                </div>
            </div>

            <div className="panel-content" style={{ paddingTop: '0.75rem' }}>
                {tab === 'palette' && (
                    <div>
                        {PALETTE_GROUPS.map((group) => (
                            <div key={group.title} style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>
                                    {group.title}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem' }}>
                                    {group.fields.map(({ type, label, Icon, repeaterAsTable }) => (
                                        <PaletteButton
                                            key={`${type}-${label}`}
                                            label={label}
                                            Icon={Icon}
                                            onClick={() =>
                                                handleAdd(type, repeaterAsTable ? { repeaterAsTable: true } : undefined)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isWizardMode && (
                            <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.5rem', background: 'rgba(99,102,241,0.06)', borderRadius: 5, border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.68rem', color: '#6366f1' }}>
                                Adding to Step {state.activeStep + 1}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'tree' && (
                    <div>
                        {displayFields.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
                                No fields yet.<br />Use the Palette tab.
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize: '0.62rem', color: 'rgba(0,0,0,0.45)', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                                    Drag the grip to reorder top-level fields. Canvas and export order match this list.
                                </p>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLayersDragEnd}>
                                    <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
                                        {displayFields.map((field) => (
                                            <SortableRootFieldBlock
                                                key={field.id}
                                                field={field}
                                                selectedFieldId={state.selectedFieldId}
                                                onSelect={(id) => dispatch({ type: 'SELECT_FIELD', payload: id })}
                                                onRemove={requestRemove}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </>
                        )}
                    </div>
                )}
            </div>

            <AlertDialog
                open={removeDialogOpen}
                onOpenChange={(open) => {
                    setRemoveDialogOpen(open);
                    if (!open) setPendingRemoveId(null);
                }}
            >
                <AlertDialogContent className="max-w-md rounded-xl border border-neutral-200 shadow-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove field?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingField
                                ? `“${pendingField.label}” will be removed from the form. You can undo afterward from the toolbar.`
                                : 'This field will be removed from the form. You can undo afterward from the toolbar.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                            onClick={() => {
                                if (pendingRemoveId) {
                                    dispatch({ type: 'REMOVE_FIELD', payload: pendingRemoveId });
                                }
                            }}
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
