import { useEditorStore } from '../../store';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'; // Accessing from parent shared UI
import { Button } from '../ui/button';
import { Settings, RefreshCcw, Info } from 'lucide-react';
import { ThemeEditor } from './ThemeEditor'; // Reusing existing component for global theme

export function PropertiesPanel({ className }: { className?: string }) {
    const { currentForm, selectedFieldId, updateField, selectField, updateForm } = useEditorStore();

    if (!currentForm) return null;

    // --- Mode 1: Field Editing ---
    if (selectedFieldId) {
        const field = currentForm.fields.find(f => f.id === selectedFieldId);
        if (!field) return null;

        const updateStyle = (key: string, value: string) => {
            const currentStyle = (field.ui as any).style || {};
            updateField(field.id, {
                ui: {
                    ...field.ui,
                    style: { ...currentStyle, [key]: value }
                }
            });
        };

        const resetStyles = () => {
            updateField(field.id, {
                ui: {
                    ...field.ui,
                    style: undefined
                }
            });
        };

        return (
            <div className={className}>
                {/* Header: Clear Context */}
                <div className="p-4 border-b bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Editing Field</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-neutral-200"
                            onClick={() => selectField(null as any)}
                            title="Close Field Settings"
                        >
                            <span className="sr-only">Close</span>
                            &times;
                        </Button>
                    </div>
                    <h3 className="text-lg font-bold truncate flex items-center gap-2">
                        {field.ui.label || field.key}
                        <span className="text-xs font-normal text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">{field.type}</span>
                    </h3>
                    <div className="text-xs text-neutral-400 font-mono mt-1">{field.key}</div>
                </div>

                {/* Tabs: Content vs Style */}
                <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 pt-4">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="style">Style</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab: Content */}
                    <TabsContent value="content" className="flex-1 overflow-y-auto p-4 space-y-6">
                        <div className="space-y-3">
                            <Label>Label</Label>
                            <Input
                                value={field.ui.label || ''}
                                onChange={(e) => updateField(field.id, { ui: { ...field.ui, label: e.target.value } })}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Placeholder</Label>
                            <Input
                                value={field.ui.placeholder || ''}
                                onChange={(e) => updateField(field.id, { ui: { ...field.ui, placeholder: e.target.value } })}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Help Text</Label>
                            <Input
                                value={field.ui.helpText || ''}
                                onChange={(e) => updateField(field.id, { ui: { ...field.ui, helpText: e.target.value } })}
                            />
                        </div>

                        {/* Read-Only Schema Info */}
                        <div className="mt-8 pt-6 border-t border-neutral-100">
                            <Label className="flex items-center gap-1 text-neutral-400 text-xs mb-2">
                                <Info className="w-3 h-3" /> Schema Constraints (Read-only)
                            </Label>
                            <div className="bg-neutral-50 p-3 rounded-md text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Required</span>
                                    <span className="font-mono">{field.constraints?.some((c: any) => c.type === 'required') ? 'Yes' : 'No'}</span>
                                </div>
                                {field.ui.options && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Options</span>
                                        <span className="font-mono">{field.ui.options.length} items</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Style */}
                    <TabsContent value="style" className="flex-1 overflow-y-auto p-4 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-neutral-500 uppercase tracking-wider">Field Overrides</Label>
                            <Button variant="ghost" size="sm" onClick={resetStyles} className="h-6 text-xs text-red-500 hover:bg-red-50">
                                <RefreshCcw className="w-3 h-3 mr-1" /> Reset
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <Label>Label Color</Label>
                            <ColorPicker
                                value={(field.ui as any).style?.labelColor}
                                onChange={(v) => updateStyle('labelColor', v)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Text Color</Label>
                            <ColorPicker
                                value={(field.ui as any).style?.textColor}
                                onChange={(v) => updateStyle('textColor', v)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Border Color</Label>
                            <ColorPicker
                                value={(field.ui as any).style?.borderColor}
                                onChange={(v) => updateStyle('borderColor', v)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Background Color</Label>
                            <ColorPicker
                                value={(field.ui as any).style?.inputBackgroundColor}
                                onChange={(v) => updateStyle('inputBackgroundColor', v)}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    // --- Mode 2: Form Settings (Default) ---
    return (
        <div className={className}>
            <div className="p-4 border-b bg-neutral-50 dark:bg-neutral-900">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    Form Settings
                </h3>
            </div>

            <Tabs defaultValue="global" className="flex-1 flex flex-col">
                <div className="px-4 pt-4">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="global">Theme</TabsTrigger>
                        <TabsTrigger value="config">Config</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="global" className="flex-1 overflow-y-auto">
                    {/* Re-use existing ThemeEditor but styled to fit tab */}
                    <div className="p-4">
                        <div className="alert alert-info bg-blue-50 text-blue-800 text-xs p-3 rounded mb-4">
                            Global settings apply to all fields unless overridden.
                        </div>
                        <ThemeEditor className="" />
                    </div>
                </TabsContent>

                <TabsContent value="config" className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-3">
                        <Label>Form Title</Label>
                        <Input
                            value={currentForm.title}
                            onChange={(e) => updateForm({ title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Description</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={(currentForm as any).description || ''}
                            onChange={(e) => updateForm({ description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Submit Button Label</Label>
                        <Input
                            value={(currentForm as any).ui?.submitLabel || 'Submit'}
                            onChange={(e) => updateForm({ ui: { ...currentForm.ui, submitLabel: e.target.value } })}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ColorPicker({ value, onChange }: { value?: string, onChange: (val: string) => void }) {
    return (
        <div className="flex gap-2">
            <Input
                type="color"
                className="w-10 p-1 h-9 cursor-pointer"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
            />
            <Input
                value={value || ''}
                className="flex-1 font-mono text-xs"
                placeholder="Inherit"
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onChange('')} title="Reset to inherited">
                    <RefreshCcw className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}
