import { useEditorStore } from '../../store';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export function ThemeEditor({ className }: { className?: string }) {
    const { currentForm, updateTheme } = useEditorStore();

    if (!currentForm) return null;

    return (
        <div className={className}>
            <div className="p-4 border-b font-medium bg-gray-50">Theme</div>
            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            className="w-10 p-1 px-1 h-9"
                            value={currentForm.theme.colors.primary}
                            onChange={(e) => updateTheme({ colors: { ...currentForm.theme.colors, primary: e.target.value } })}
                        />
                        <Input
                            value={currentForm.theme.colors.primary}
                            onChange={(e) => updateTheme({ colors: { ...currentForm.theme.colors, primary: e.target.value } })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Font Family</Label>
                    <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={currentForm.theme.typography.fontFamily}
                        onChange={(e) => updateTheme({ typography: { ...currentForm.theme.typography, fontFamily: e.target.value } })}
                    >
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Open Sans, sans-serif">Open Sans</option>
                        <option value="Merriweather, serif">Merriweather</option>
                        <option value="'Courier New', monospace">Courier New</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label>Border Radius (rem)</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            step="0.1"
                            value={parseFloat(currentForm.theme.borderRadius.base)}
                            onChange={(e) => updateTheme({ borderRadius: { ...currentForm.theme.borderRadius, base: `${e.target.value}rem` } })}
                        />
                        <span className="text-xs text-gray-500">rem</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
