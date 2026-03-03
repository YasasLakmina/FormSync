import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Code2, Server, Database, TestTube, Download, Copy, 
  Check, Loader2, FileCode, Package 
} from 'lucide-react';
import { toast } from 'sonner';

interface GenerationStage {
  name: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  progress: number;
}

interface GeneratedCode {
  frontend: string;
  backend: string;
  dtos: string;
  tests: string;
}

interface PipelineViewerProps {
  isGenerating: boolean;
  generatedCode: GeneratedCode | null;
  stages: GenerationStage[];
  onDownloadAll?: () => void;
  isDownloading?: boolean;
}

export const PipelineViewer: React.FC<PipelineViewerProps> = ({
  isGenerating,
  generatedCode,
  stages,
  onDownloadAll,
  isDownloading = false,
}) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = async (code: string, tabName: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedTab(tabName);
      toast.success(`${tabName} code copied to clipboard`);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const tabs = [
    { 
      id: 'frontend', 
      label: 'Frontend Forms', 
      icon: <Code2 className="h-4 w-4" />,
      code: generatedCode?.frontend,
      language: 'typescript',
    },
    { 
      id: 'backend', 
      label: 'Backend API', 
      icon: <Server className="h-4 w-4" />,
      code: generatedCode?.backend,
      language: 'typescript',
    },
    { 
      id: 'dtos', 
      label: 'DTOs', 
      icon: <Database className="h-4 w-4" />,
      code: generatedCode?.dtos,
      language: 'typescript',
    },
    { 
      id: 'tests', 
      label: 'Test Cases', 
      icon: <TestTube className="h-4 w-4" />,
      code: generatedCode?.tests,
      language: 'typescript',
    },
  ];

  return (
    <Card className="h-full flex flex-col border-2 border-neutral-200 dark:border-neutral-700">
      <CardHeader className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Generated Code
              </CardTitle>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {isGenerating ? 'Generating...' : 'Preview and download'}
              </p>
            </div>
          </div>

          {generatedCode && !isGenerating && (
            <Button
              onClick={onDownloadAll}
              size="sm"
              disabled={isDownloading}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg text-white disabled:opacity-60"
            >
              {isDownloading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Downloading…</>
              ) : (
                <><Download className="h-4 w-4" /> Download All</>
              )}
            </Button>
          )}
        </div>

        {/* Pipeline Progress */}
        {isGenerating && (
          <div className="mt-4 space-y-2">
            {stages.map((stage) => (
              <PipelineStageIndicator key={stage.name} stage={stage} />
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {!generatedCode && !isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <FileCode className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Code Generated Yet</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
              Validate your schema and click "Generate Code" to see your frontend, backend, DTOs, and tests here.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="frontend" className="h-full flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none bg-white dark:bg-neutral-900 px-4">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-950/20 dark:data-[state=active]:text-purple-400"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="flex-1 m-0 p-4 overflow-auto data-[state=active]:flex data-[state=inactive]:hidden"
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      {tab.label}
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => tab.code && handleCopy(tab.code, tab.label)}
                      className="gap-2"
                      disabled={!tab.code}
                    >
                      {copiedTab === tab.label ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-900 overflow-auto">
                    <pre className="p-4 text-sm font-mono">
                      <code className={`language-${tab.language} text-green-400`}>
                        {tab.code || '// Generating...'}
                      </code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Pipeline Stage Indicator Component
const PipelineStageIndicator: React.FC<{ stage: GenerationStage }> = ({ stage }) => {
  const getStatusColor = () => {
    switch (stage.status) {
      case 'complete':
        return 'text-green-600';
      case 'loading':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-neutral-400';
    }
  };

  const getStatusIcon = () => {
    switch (stage.status) {
      case 'complete':
        return <Check className="h-4 w-4" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error':
        return <span className="text-xs">✕</span>;
      default:
        return <div className="w-2 h-2 rounded-full bg-neutral-300" />;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${getStatusColor()}`}>
        {getStatusIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{stage.name}</span>
          {stage.status === 'loading' && (
            <span className="text-xs text-neutral-500">{stage.progress}%</span>
          )}
        </div>
        {stage.status === 'loading' && (
          <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
              style={{ width: `${stage.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
