import { useEditorStore } from '../../store';
import { cn } from '../../lib/utils';

export function Canvas({ className }: { className?: string }) {
    const { currentForm, selectField, selectedFieldId } = useEditorStore();

    const order = currentForm?.layout?.order || [];
    const fieldMap = new Map(currentForm?.fields.map(f => [f.id, f]));

    // Global CSS Variables from Theme
    const getGlobalStyles = () => {
        if (!currentForm) return {};
        return {
            '--primary': hexToHSL(currentForm.theme.colors.primary),
            '--radius': currentForm.theme.borderRadius.base,
            '--font-sans': currentForm.theme.typography.fontFamily,
        } as React.CSSProperties;
    };

    return (
        <div className={cn("flex flex-col items-center py-8", className)}>
            <div
                className="w-full max-w-xl bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] flex flex-col"
                style={getGlobalStyles()}
            >
                {/* Form Header */}
                <div className="p-8 pb-4 border-b border-gray-100">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                        {currentForm?.title || 'Untitled Form'}
                    </h2>
                    {(currentForm as any)?.description && (
                        <p className="text-gray-500 text-lg">{(currentForm as any).description}</p>
                    )}
                </div>

                {/* Fields Area */}
                <div className="flex-1 p-8 space-y-6">
                    {order.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-12">
                            <div className="text-center">
                                <p>No fields added yet.</p>
                                <p className="text-sm">Drag fields from the sidebar</p>
                            </div>
                        </div>
                    ) : (
                        order.map(id => {
                            const field = fieldMap.get(id);
                            if (!field) return null;
                            return (
                                <PreviewField
                                    key={id}
                                    field={field}
                                    isSelected={selectedFieldId === id}
                                    onSelect={() => selectField(id)}
                                />
                            );
                        })
                    )}
                </div>

                {/* Form Footer */}
                <div className="p-8 pt-4 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                    <button className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-6 py-2.5 rounded-md font-medium text-sm w-full sm:w-auto shadow-sm">
                        {(currentForm as any)?.ui?.submitLabel || 'Submit'}
                    </button>
                </div>
            </div>

            <style>{`
                body {
                    font-family: var(--font-sans);
                }
                .bg-primary {
                    background-color: hsl(var(--primary));
                }
                .text-primary-foreground {
                    color: hsl(var(--primary-foreground, 0 0% 100%));
                }
                .border-radius {
                    border-radius: var(--radius);
                }
            `}</style>
        </div>
    );
}

function PreviewField({ field, isSelected, onSelect }: any) {
    // Merge global overrides if any (currently handled via CSS vars, but could be specific)
    // Local overrides
    const styles = field.ui.style || {};

    // Dynamic styles based on field properties
    const containerStyle: React.CSSProperties = {
        '--field-label': styles.labelColor || 'inherit',
        '--field-input-bg': styles.inputBackgroundColor || 'transparent',
        '--field-border': styles.borderColor || 'hsl(var(--input))', // default to theme input color
        '--field-focus': styles.focusColor || 'hsl(var(--ring))',
        '--field-text': styles.textColor || 'inherit',
    } as React.CSSProperties;

    return (
        <div
            className={cn(
                "group relative space-y-2 p-4 -m-4 rounded-lg transition-all cursor-pointer border-2",
                isSelected
                    ? "border-blue-500 bg-blue-50/10 ring-4 ring-blue-500/10 z-10"
                    : "border-transparent hover:border-gray-200 hover:bg-gray-50/50"
            )}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            style={containerStyle}
        >
            <label
                className="text-sm font-medium leading-none flex items-center justify-between"
                style={{ color: styles.labelColor }}
            >
                <span className="flex items-center gap-1">
                    {field.ui.label || field.key}
                    {field.constraints?.find((c: any) => c.type === 'required') && <span className="text-red-500">*</span>}
                </span>

                {/* Edit hint only on hover/select */}
                <span className={cn(
                    "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 transition-opacity",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    {field.type}
                </span>
            </label>

            <div className="relative">
                {renderWidget(field, styles)}
            </div>

            {field.ui.helpText && (
                <p className="text-[0.8rem] text-gray-500">{field.ui.helpText}</p>
            )}
        </div>
    );
}

function renderWidget(field: any, styles: any) {
    const commonClasses = "flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    // Apply inline styles for overrides
    const inputStyle = {
        color: styles.textColor,
        backgroundColor: styles.inputBackgroundColor,
        borderColor: styles.borderColor,
    };

    switch (true) {
        case field.ui.widget === 'textarea':
            return <textarea
                className={cn(commonClasses, "min-h-[100px]")}
                placeholder={field.ui.placeholder}
                style={inputStyle}
                disabled
            />;

        case field.type === 'boolean' || field.type === 'checkbox':
            return (
                <div className="flex items-center space-x-2">
                    <div
                        className="h-4 w-4 rounded border border-primary ring-offset-background"
                        style={{ borderColor: styles.borderColor || 'currentColor' }}
                    />
                    <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" style={{ color: styles.textColor }}>
                        {field.ui.label}
                    </span>
                </div>
            );

        case field.type === 'select':
            return (
                <select
                    className={commonClasses}
                    style={inputStyle}
                    disabled
                >
                    <option>Select...</option>
                    {field.ui.options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            );

        case field.type === 'string' || field.type === 'number' || field.type === 'email' || field.type === 'password' || field.type === 'text':
        default:
            const type = field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : 'text';
            return <input
                type={type}
                className={cn(commonClasses, "h-10")}
                placeholder={field.ui.placeholder}
                style={inputStyle}
                disabled
                defaultValue=""
            />;
    }
}

function hexToHSL(hex: string): string {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '222.2 47.4% 11.2%'; // Fallback

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}
