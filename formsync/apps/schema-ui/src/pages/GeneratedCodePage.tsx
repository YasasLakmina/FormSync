/**
 * Generated Code Results Page
 * 
 * Displays all generated code from the pipeline with download options
 */

import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { PipelineViewer } from '../components/editor/PipelineViewer';
import { Button } from '../components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

import { toast } from 'sonner';
import { generationService } from '../services/generationService';

interface GeneratedCode {
  frontend: string;
  backend: string;
  dtos: string;
  tests: string;
}

interface LocationState {
  generatedCode: GeneratedCode;
  schema: any;
}

export const GeneratedCodePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // If no generated code, redirect back to editor
  if (!state?.generatedCode) {
    navigate('/editor', { replace: true });
    return null;
  }

  const handleDownloadAll = async () => {
    if (!state.schema) {
      toast.error('Cannot download: Schema missing from state');
      return;
    }

    try {
      toast.info('Preparing download...');
      await generationService.downloadZip(state.schema, 'formsync-project');
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Header with Navigation */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/editor">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Editor
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Generated Code
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Your complete application code is ready! Review, copy, or download.
            </p>
          </div>

          {/* Success Message */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Generation Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  All components have been successfully generated from your schema.
                </p>
              </div>
            </div>
          </div>

          {/* Pipeline Viewer - Full Width */}
          <div className="min-h-[600px]">
            <PipelineViewer
              isGenerating={false}
              generatedCode={state.generatedCode}
              stages={[
                { name: 'Schema Validation', status: 'complete', progress: 100 },
                { name: 'Frontend Generation', status: 'complete', progress: 100 },
                { name: 'Backend Generation', status: 'complete', progress: 100 },
                { name: 'DTO & Tests', status: 'complete', progress: 100 },
              ]}
              onDownloadAll={handleDownloadAll}
            />
          </div>
        </main>
      </div>
    </PageTransition>
  );
};
