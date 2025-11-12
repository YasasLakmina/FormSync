import { useEditorStore } from '../store';
import { Button } from './ui/button';
import { formApi } from '../lib/api';

export function ExportButton() {
    const { currentForm } = useEditorStore();

    const handleExport = async () => {
        if (!currentForm) return;
        try {
            const blob = await formApi.exportReact(currentForm);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'form-project.zip');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (e) {
            console.error(e);
            alert('Export failed');
        }
    };

    return <Button onClick={handleExport}>Export React</Button>;
}
