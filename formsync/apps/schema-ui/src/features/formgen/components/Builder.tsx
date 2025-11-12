import { Sidebar } from './builder/Sidebar';
import { Canvas } from './builder/Canvas';
import { PropertiesPanel } from './builder/PropertiesPanel';
import { ThemeEditor } from './builder/ThemeEditor';
import { useEditorStore } from '../store';
import { ExportButton } from './ExportButton';
import { Button } from './ui/button';

export function Builder() {
    const { currentForm, setForm } = useEditorStore();

    if (!currentForm) return <div>Loading form...</div>;

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden">
            <header className="flex items-center justify-between border-b px-6 py-4 bg-white">
                <h1 className="text-xl font-bold">{currentForm.title}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setForm(null as any)}>Back to Schemas</Button>
                    <ExportButton />
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <Sidebar className="w-64 border-r bg-gray-50 overflow-y-auto" />
                <Canvas className="flex-1 bg-gray-100 p-8 overflow-y-auto" />
                <div className="w-80 border-l bg-white flex flex-col">
                    <PropertiesPanel className="flex-1 overflow-y-auto border-b" />
                    <ThemeEditor className="h-1/3 overflow-y-auto" />
                </div>
            </div>
        </div>
    );
}
