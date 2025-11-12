import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Builder } from '../features/formgen/components/Builder';
import { useEditorStore } from '../features/formgen/store';
import { formApi } from '../features/formgen/lib/api';
// Assuming toast from sonner is global or usable
import { toast } from 'sonner';
import { useSchemaStore } from '../stores/schemaStore';

export function FormBuilderPage() {
    const { schemaId } = useParams<{ schemaId: string }>();
    const navigate = useNavigate();
    const { setForm } = useEditorStore();
    const { currentSchema } = useSchemaStore();

    useEffect(() => {
        if (schemaId === 'current' && currentSchema) {
            loadFromRaw(currentSchema);
        } else if (schemaId && schemaId !== 'current') {
            loadSchema(schemaId);
        }
    }, [schemaId, currentSchema]);

    const loadFromRaw = async (schema: any) => {
        try {
            // We need an endpoint that accepts raw schema in formgen-api
            // fallback to just converting it if endpoint allows,
            // OR we implemented createFromSchema to take schemaId only?
            // Let's assume we can pass body { schema: ... }
            const form = await formApi.convertRaw(schema);
            setForm(form);
        } catch (e) {
            console.error(e);
            toast.error('Failed to convert schema');
        }
    };

    const loadSchema = async (id: string) => {
        try {
            const form = await formApi.createFromSchema(id);
            setForm(form);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load schema');
            navigate('/');
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            <Builder />
        </div>
    );
}
