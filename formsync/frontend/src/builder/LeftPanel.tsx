import React, { useState } from 'react';
import { useBuilder, createField, collectAllFieldKeys } from '../context/BuilderContext';
import { FieldModel, FieldType } from '../types';
import { LucideIcon, Type, Mail, Lock, Hash, AlignLeft, Calendar, ChevronDown, CheckSquare, List, Upload, FileText, PenLine, Search, Calculator, Folder } from 'lucide-react';

// ─── Palette Config ───────────────────────────────────────────────────────────

type PaletteEntry = { type: FieldType; label: string; Icon: LucideIcon };
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
        onClick={onClick}
        title={`Add ${label}`}
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
    isSelected: boolean;
    onSelect: () => void;
    onRemove: () => void;
    indent?: number;
}> = ({ field, isSelected, onSelect, onRemove, indent = 0 }) => (
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
            onClick={onSelect}
        >
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#6366f1' : '#334155' }}>
                {field.label}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(0,0,0,0.4)', flexShrink: 0, fontFamily: 'monospace' }}>{field.type}</span>
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                title="Remove"
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
            <FieldTreeItem key={child.id} field={child} isSelected={false} onSelect={() => { }} onRemove={() => { }} indent={indent + 1} />
        ))}
    </div>
);

// ─── Left Panel ───────────────────────────────────────────────────────────────

export const LeftPanel: React.FC = () => {
    const { state, dispatch, isWizardMode } = useBuilder();
    const [tab, setTab] = useState<'palette' | 'tree'>('palette');

    const orderedFields = state.form.layout.order
        .map((id) => state.form.fields.find((f) => f.id === id))
        .filter((f): f is FieldModel => !!f);
    const unlistedFields = state.form.fields.filter((f) => !state.form.layout.order.includes(f.id));
    const displayFields = [...orderedFields, ...unlistedFields];

    const handleAdd = (type: FieldType) => {
        const stepIndex = isWizardMode ? state.activeStep : undefined;
        const existingKeys = collectAllFieldKeys(state.form.fields);
        dispatch({
            type: 'ADD_FIELD',
            payload: createField(type, stepIndex, existingKeys),
        });
    };

    const handleRemove = (id: string) => {
        if (window.confirm('Remove this field?')) dispatch({ type: 'REMOVE_FIELD', payload: id });
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
                                    {group.fields.map(({ type, label, Icon }) => (
                                        <PaletteButton key={type} label={label} Icon={Icon} onClick={() => handleAdd(type)} />
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
                            displayFields.map((field) => (
                                <FieldTreeItem
                                    key={field.id}
                                    field={field}
                                    isSelected={state.selectedFieldId === field.id}
                                    onSelect={() => dispatch({ type: 'SELECT_FIELD', payload: field.id })}
                                    onRemove={() => handleRemove(field.id)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
