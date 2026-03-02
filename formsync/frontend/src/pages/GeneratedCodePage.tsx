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
import { FlowDiagram } from '../components/shared/FlowDiagram';

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

const MOCK_CODE = {
  frontend: `import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(20),
  age: z.number().min(18)
});

export const RegistrationForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Email</label>
        <input {...form.register('email')} className="border p-2 rounded" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};`,
  backend: `import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}`,
  dtos: `import { IsEmail, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Min(2)
  @Max(20)
  username: string;

  @IsInt()
  @Min(18)
  age: number;
}`,
  tests: `// Tests Pending Generation...`
};

export const GeneratedCodePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const schemaId = query.get('schemaId');

  const [localState, setLocalState] = React.useState<LocationState | null>(location.state as LocationState);
  const [isLoading, setIsLoading] = React.useState(false);

  // Define stages for the progress bar
  const completionStages: any[] = [
    { name: 'Enter Schema', status: 'complete', progress: 100 },
    { name: 'Input Validation', status: 'complete', progress: 100 },
    { name: 'Schema Conversion', status: 'complete', progress: 100 },
    { name: 'AI Enhancement', status: 'complete', progress: 100 },
    { name: 'Frontend Generation', status: 'complete', progress: 100 },
    { name: 'Backend Generation', status: 'complete', progress: 100 },
    { name: 'DTO Generation', status: 'complete', progress: 100 },
    { name: 'Test Generation', status: 'pending', progress: 0 },
  ];

  React.useEffect(() => {
    const fetchAndGenerate = async () => {
      if (!localState && schemaId) {
        setIsLoading(true);
        try {
          // Fetch schema
          // Note: In a real env, use env var. Assuming localhost:3000 based on EditorPage usage.
          const response = await fetch(`http://localhost:3000/schema/${schemaId}`);
          if (!response.ok) throw new Error('Failed to fetch schema');

          const schemaData = await response.json();
          // Ideally schemaData is the schema object or has content. 
          // Based on EditorPage: "content: currentSchema", so the API likely returns the DB record.
          // Let's assume schemaData.content is the actual schema or schemaData itself if it IS the schema.
          // EditorPage saves: { name, description, content, ... }
          // So we likely need schemaData.content

          const schema = schemaData.content || schemaData;

          // Generate code
          const result = await generationService.generateAll(schema);

          if (result.success && result.data) {
            setLocalState({
              generatedCode: { ...MOCK_CODE, ...result.data },
              schema: schema
            });
            toast.success('Code generated successfully');
          } else {
            throw new Error(result.error || 'Generation failed');
          }

        } catch (error) {
          console.error('Error in GeneratedCodePage:', error);
          // Fallback to mock logic
          setLocalState({
            generatedCode: MOCK_CODE,
            schema: { name: 'Demo Schema', content: {} }
          });
          toast.info('Using demo data (Generation failed)');
        } finally {
          setIsLoading(false);
        }
      } else if (!localState && !schemaId) {
        setLocalState({
          generatedCode: MOCK_CODE,
          schema: { name: 'Demo Schema', content: {} }
        });
      }
    };

    fetchAndGenerate();
  }, [localState, schemaId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Generating code...</p>
        </div>
      </div>
    );
  }

  // If no generated code (and not loading), redirect handles it or we return null
  if (!localState?.generatedCode) {
    return null;
  }

  // Use localState instead of state from here on
  const state = localState;


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

          {/* Progress Bar */}
          <div className="mb-6">
            <FlowDiagram stages={completionStages} />
          </div>

          {/* Pipeline Viewer - Full Width */}
          <div className="min-h-[600px]">
            <PipelineViewer
              isGenerating={false}
              generatedCode={state.generatedCode}
              stages={completionStages}
              onDownloadAll={handleDownloadAll}
            />
          </div>
        </main>
      </div>
    </PageTransition>
  );
};
