/**
 * Unified Editor Page
 * 
 * Schema editing with integrated generation controls
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { TechnicalEditor } from '../components/TechnicalEditor';
import { TemplateBuilder } from '../components/TemplateBuilder';
import { FlowDiagram } from '../components/shared/FlowDiagram';
import { useSchemaStore } from '../stores/schemaStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Code2, Wand2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { generationService } from '../services/generationService';
import { Button } from '../components/ui/button';

export interface GenerationStage {
  name: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  progress: number;
}

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSchema, validationResults } = useSchemaStore();
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Handler to update stages from TechnicalEditor
  const handleStageUpdate = (stageName: string, status: 'loading' | 'complete' | 'error' | 'pending') => {
    setStages(prev =>
      prev.map(s =>
        s.name === stageName
          ? { ...s, status, progress: status === 'complete' ? 100 : status === 'loading' ? 50 : 0 }
          : s
      )
    );
  };

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
        setStages(prev =>
          prev.map((s, idx) => (idx === stageIndex ? { ...s, status: 'loading', progress: 0 } : s))
        );

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 25) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setStages(prev =>
            prev.map((s, idx) => (idx === stageIndex ? { ...s, progress } : s))
          );
        }

        // Mark complete
        setStages(prev =>
          prev.map((s, idx) => (idx === stageIndex ? { ...s, status: 'complete', progress: 100 } : s))
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
            schema: currentSchema
          },
        });
      } else {
        throw new Error(result.error || 'Generation failed');
      }

    } catch (error) {
      toast.error('Generation failed. Please try again.');
      setStages(prev => prev.map((s, idx) => idx >= 4 ? { ...s, status: 'error' } : s));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextToFormBuilder = async () => {
    console.log('[handleNextToFormBuilder] Called', { currentSchema: currentSchema, validationResults });

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
          userId: '303459c0-1f1c-44c1-a2c6-1f492d2c2965', // Demo user ID
          // userId: '979e33ad-8b60-44fd-b196-0cece840d63e', // hansi user ID
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
      const formBuilderUrl = import.meta.env.VITE_FORMGEN_UI_URL || 'http://localhost:5175';
      const urlWithSchemaId = `${formBuilderUrl}?schemaId=${savedSchema.id}`;
      console.log('[handleNextToFormBuilder] Navigating to Form Builder with schema ID');
      window.location.href = urlWithSchemaId;
    } catch (error) {
      toast.error('Failed to save schema to API. Please try again.');
      console.error('[handleNextToFormBuilder] Error:', error);
    }
  };


  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Schema Editor
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Create and validate your schema, then generate complete application code
            </p>
          </div>

          {/* Pipeline Flow - Always Visible Between Description and Tabs */}
          <div className="mb-6">
            <FlowDiagram stages={stages} />
          </div>

          {/* Next: Form Builder Button - Shows after Convert OR AI Enhancement is complete */}
          {(() => {
            console.log('[EditorPage] Button condition check:', {
              stage2: stages[2],
              stage3: stages[3],
              shouldShow: stages[2].status === 'complete' || stages[3].status === 'complete'
            });
            return (stages[2].status === 'complete' || stages[3].status === 'complete');
          })() && (
              <div className="mb-6 flex justify-center">
                <Button
                  onClick={handleNextToFormBuilder}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all hover:scale-105"
                >
                  <Sparkles className="h-5 w-5" />
                  Next: Form Builder
                </Button>
              </div>
            )}

          <div className="max-w-7xl mx-auto">
            {/* Tabs for Technical Editor and Template Builder */}
            <Tabs defaultValue="technical" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="technical" className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Technical Editor
                </TabsTrigger>
                <TabsTrigger value="builder" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Template Builder
                </TabsTrigger>
              </TabsList>

              <TabsContent value="technical" className="mt-0">
                <TechnicalEditor
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  onStageUpdate={handleStageUpdate}
                />
              </TabsContent>

              <TabsContent value="builder" className="mt-0">
                <TemplateBuilder />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};
