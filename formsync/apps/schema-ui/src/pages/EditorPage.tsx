/**
 * Unified Editor Page
 *
 * Schema editing with integrated generation controls
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { TechnicalEditor } from '../components/TechnicalEditor';
import { TemplateBuilder } from '../components/TemplateBuilder';
import { FlowDiagram } from '../components/shared/FlowDiagram';
import { useSchemaStore } from '../stores/schemaStore';
import { Tabs, TabsContent } from '../components/ui/tabs';
import { Code2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { generationService } from '../services/generationService';
import { useAuth } from '../context/AuthContext';

export interface GenerationStage {
  name: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  progress: number;
}

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { currentSchema, validationResults, loadSchema } = useSchemaStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [schemaFromBuilder, setSchemaFromBuilder] = useState<string>(''); // Schema transferred from Template Builder
  const [activeTab, setActiveTab] = useState('technical'); // Control which tab is active
  const [stages, setStages] = useState<GenerationStage[]>([
    { name: 'Enter Schema', status: 'pending', progress: 0 },
    { name: 'Input Validation', status: 'pending', progress: 0 },
    { name: 'Schema Conversion', status: 'pending', progress: 0 },
    { name: 'AI Enhancement', status: 'pending', progress: 0 },
    { name: 'Frontend Generation', status: 'pending', progress: 0 },
    { name: 'Backend Generation', status: 'pending', progress: 0 },
    { name: 'DTO Generation', status: 'pending', progress: 0 },
    { name: 'Test Generation', status: 'pending', progress: 0 },
  ]);

  // Load schema if a schemaId is provided in URL
  useEffect(() => {
    const schemaId = searchParams.get('schemaId');
    if (schemaId) {
      toast.loading('Loading schema...');
      loadSchema(schemaId)
        .then(() => {
          toast.dismiss();

          // Need to stringify the schema before passing it into TechnicalEditor
          // because it expects a raw JSON string to put into the Monaco editor
          const currentSchemaData = useSchemaStore.getState().currentSchema;
          if (currentSchemaData) {
            setSchemaFromBuilder(JSON.stringify(currentSchemaData, null, 2));
            toast.success('Schema loaded successfully');
            setActiveTab('technical');
          }
        })
        .catch(() => {
          toast.dismiss();
          toast.error('Failed to load schema');
        });
    }
  }, [searchParams, loadSchema]);

  // Handler to update stages from TechnicalEditor
  const handleStageUpdate = (
    stageName: string,
    status: 'loading' | 'complete' | 'error' | 'pending'
  ) => {
    setStages((prev) =>
      prev.map((s) =>
        s.name === stageName
          ? { ...s, status, progress: status === 'complete' ? 100 : status === 'loading' ? 50 : 0 }
          : s
      )
    );
  };

  // Handler to receive schema from Template Builder
  const handleUseSchemaFromBuilder = (schemaJson: string) => {
    setSchemaFromBuilder(schemaJson);
  };

  // Auto-switch to Technical Editor tab AFTER schemaFromBuilder state is set
  React.useEffect(() => {
    if (schemaFromBuilder && schemaFromBuilder.trim()) {
      setActiveTab('technical');
      toast.success('Schema transferred! Now in Technical Editor.');
    }
  }, [schemaFromBuilder]);

  const handleGenerate = async () => {
    // Validation check - show error if not valid
    if (!currentSchema) {
      toast.error('Please enter a schema first');
      return;
    }

    if (!validationResults) {
      toast.error('Validation results missing. Please click Validate then try again.');
      return;
    }

    if (!validationResults.valid) {
      toast.error('Schema validation failed. Please fix the errors shown in the editor.');
      return;
    }

    setIsGenerating(true);
    toast.info('Starting code generation...');

    try {
      // Start from Frontend Generation (index 4)
      const generationStages = stages.slice(4);

      for (let i = 0; i < generationStages.length; i++) {
        const stageIndex = i + 4; // Offset for actual index
        setStages((prev) =>
          prev.map((s, idx) => (idx === stageIndex ? { ...s, status: 'loading', progress: 0 } : s))
        );

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 25) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          setStages((prev) => prev.map((s, idx) => (idx === stageIndex ? { ...s, progress } : s)));
        }

        // Mark complete
        setStages((prev) =>
          prev.map((s, idx) =>
            idx === stageIndex ? { ...s, status: 'complete', progress: 100 } : s
          )
        );
      }

      // Call backend API
      const USE_MOCK = true;
      const result = USE_MOCK
        ? await generationService.generateMock()
        : await generationService.generateAll(currentSchema);

      if (result.success && result.data) {
        toast.success('Code generation complete!');
        navigate('/generated', {
          state: {
            generatedCode: result.data,
            schema: currentSchema,
          },
        });
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      toast.error('Generation failed. Please try again.');
      setStages((prev) => prev.map((s, idx) => (idx >= 4 ? { ...s, status: 'error' } : s)));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextToFormBuilder = async () => {
    console.log('[handleNextToFormBuilder] Called', {
      currentSchema: currentSchema,
      validationResults,
    });

    // Ensure we have a converted schema
    if (!currentSchema) {
      toast.error('Please complete validation and conversion first');
      console.log('[handleNextToFormBuilder] No currentSchema');
      return;
    }

    // If currentSchema exists, conversion was successful, which means validation passed

    try {
      // Save schema to API and get an ID
      const schemaApiUrl = 'http://localhost:3000/schema';
      console.log('[handleNextToFormBuilder] Saving schema to API...');

      const response = await fetch(schemaApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentSchema.title || 'Untitled Schema',
          description: currentSchema.description || 'Schema from Schema UI',
          content: currentSchema,
          sourceFormat: 'json',
          status: 'validated',
          // userId: 'd3bf867a-44fb-48fb-808c-b1cf220517a2', // Demo user ID
          userId: '979e33ad-8b60-44fd-b196-0cece840d63e', // hansi user ID
          // userId: 'd3bf867a-44fb-48fb-808c-b1cf220517a2', // yasas user ID
          // userId: '303459c0-1f1c-44c1-a2c6-1f492d2c2965', // thamindu user ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[handleNextToFormBuilder] API Error Response:', errorData);
        throw new Error(`API returned ${response.status}: ${errorData}`);
      }

      const savedSchema = await response.json();
      console.log('[handleNextToFormBuilder] Schema saved with ID:', savedSchema.id);

      // Show success message
      toast.success('Schema saved, navigating to Form Builder...');

      // Navigate to Form Builder with schema ID
      const urlWithSchemaId = `/builder?schemaId=${savedSchema.id}`;
      console.log('[handleNextToFormBuilder] Navigating to Form Builder with schema ID');
      window.location.href = urlWithSchemaId;
    } catch (error) {
      toast.error('Failed to save schema to API. Please try again.');
      console.error('[handleNextToFormBuilder] Error:', error);
    }
  };

  const TAB_ITEMS = [
    { value: 'technical', label: 'Technical Editor', icon: Code2 },
    { value: 'builder', label: 'Template Builder', icon: Wand2 },
  ] as const;

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-50 via-white to-purple-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mb-7"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Schema Editor
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-1.5">
              Build your schema
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
              Define your data structure, validate and enhance it with AI, then generate complete application code in one click.
            </p>
          </motion.div>

          {/* Pipeline Progress */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
            className="mb-7"
          >
            <FlowDiagram stages={stages} />
          </motion.div>

          {/* Editor Area */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14, ease: 'easeOut' }}
            className="max-w-7xl mx-auto"
          >
            {/* Custom animated segmented control */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setActiveTab(value)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none ${activeTab === value
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                      }`}
                  >
                    {activeTab === value && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-lg bg-white dark:bg-neutral-700 shadow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content — using Tabs component for accessibility/logic but hiding its native elements */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="technical" className="mt-0">
                <TechnicalEditor
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  onStageUpdate={handleStageUpdate}
                  onNextToFormBuilder={handleNextToFormBuilder}
                  stages={stages}
                  schemaFromBuilder={schemaFromBuilder}
                />
              </TabsContent>

              <TabsContent value="builder" className="mt-0">
                <TemplateBuilder onUseSchema={handleUseSchemaFromBuilder} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>

      </div>
    </PageTransition>
  );
};
