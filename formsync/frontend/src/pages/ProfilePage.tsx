import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { schemaApi } from '../api/schemaApi';
import { toast } from 'sonner';

const SCHEMA_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ProfilePage: React.FC = () => {
    const { user, token, logout, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'schemas' | 'templates'>('schemas');
    const [schemas, setSchemas] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loadingSchemas, setLoadingSchemas] = useState(false);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Fetch schemas when user is ready
    useEffect(() => {
        if (!user) return;
        setLoadingSchemas(true);
        fetch(`${SCHEMA_API_URL}/schema?userId=${user.id}`)
            .then((r) => r.json())
            .then((data) => setSchemas(Array.isArray(data) ? data : []))
            .catch(() => toast.error('Failed to load schemas'))
            .finally(() => setLoadingSchemas(false));
    }, [user]);

    // Fetch templates when tab switches to templates
    useEffect(() => {
        if (activeTab !== 'templates' || !token) return;
        setLoadingTemplates(true);
        authService
            .getMyTemplates(token)
            .then((data) => setTemplates(Array.isArray(data) ? data : []))
            .catch(() => toast.error('Failed to load templates'))
            .finally(() => setLoadingTemplates(false));
    }, [activeTab, token]);

    const handleDeleteTemplate = async (id: string) => {
        if (!token) return;
        try {
            await authService.deleteTemplate(token, id);
            setTemplates((prev) => prev.filter((t) => t.id !== id));
            toast.success('Template deleted');
        } catch {
            toast.error('Failed to delete template');
        }
    };

    const handleDeleteSchema = async (id: string) => {
        try {
            await schemaApi.delete(id);
            setSchemas((prev) => prev.filter((s) => s.id !== id));
            toast.success('Schema deleted');
        } catch {
            toast.error('Failed to delete schema');
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="max-w-5xl mx-auto px-4 py-10">
                {/* Profile Header */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl font-bold text-purple-600 dark:text-purple-400 select-none">
                            {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                {user.name || 'FormSync User'}
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                        Sign out
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl w-fit">
                    {(['schemas', 'templates'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab
                                ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-sm'
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                                }`}
                        >
                            {tab === 'schemas' ? `JSON Schemas (${schemas.length})` : `Templates (${templates.length})`}
                        </button>
                    ))}
                </div>

                {/* Schemas Tab */}
                {activeTab === 'schemas' && (
                    <div>
                        {loadingSchemas ? (
                            <div className="flex justify-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent" />
                            </div>
                        ) : schemas.length === 0 ? (
                            <EmptyState
                                icon="📄"
                                title="No schemas yet"
                                description="Go to the editor to create and save your first JSON schema."
                                action={<Link to="/editor" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">Open Editor</Link>}
                            />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {schemas.map((s) => (
                                    <SchemaCard key={s.id} schema={s} onDelete={() => handleDeleteSchema(s.id)} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Templates Tab */}
                {activeTab === 'templates' && (
                    <div>
                        {loadingTemplates ? (
                            <div className="flex justify-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent" />
                            </div>
                        ) : templates.length === 0 ? (
                            <EmptyState
                                icon="🎨"
                                title="No templates saved"
                                description="Build a form in the Form Builder and save it as a template to see it here."
                            />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {templates.map((t) => (
                                    <TemplateCard key={t.id} template={t} onDelete={() => handleDeleteTemplate(t.id)} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/* --------------------------------------------------------- */
/* Sub-components                                            */
/* --------------------------------------------------------- */

const SchemaCard: React.FC<{ schema: any; onDelete: () => void }> = ({ schema, onDelete }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group">
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg">📋</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${schema.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : schema.status === 'validated' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : schema.status === 'enhanced' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}>
                    {schema.status}
                </span>
            </div>
            <button
                onClick={onDelete}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1"
                title="Delete schema"
            >
                ✕
            </button>
        </div>
        <h3 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 truncate">{schema.name}</h3>
        {schema.description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">{schema.description}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs text-neutral-400">{new Date(schema.updatedAt).toLocaleDateString()}</span>
            <Link
                to={`/editor?schemaId=${schema.id}`}
                className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline"
            >
                Open →
            </Link>
        </div>
    </div>
);

const TemplateCard: React.FC<{ template: any; onDelete: () => void }> = ({ template, onDelete }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
        <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-lg">🎨</div>
            <button
                onClick={onDelete}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1"
                title="Delete template"
            >
                ✕
            </button>
        </div>
        <h3 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 truncate">{template.name}</h3>
        {template.description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">{template.description}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs text-neutral-400">{new Date(template.createdAt).toLocaleDateString()}</span>
            <span className="text-xs text-neutral-400">
                {template.content?.fields?.length ?? 0} fields
            </span>
        </div>
    </div>
);

const EmptyState: React.FC<{ icon: string; title: string; description: string; action?: React.ReactNode }> = ({
    icon, title, description, action
}) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mb-6">{description}</p>
        {action}
    </div>
);
