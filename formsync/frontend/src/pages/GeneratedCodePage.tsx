/**
 * Generated Code Results Page
 *
 * Displays all generated code from the pipeline with download options
 */

import React from "react";
import { useLocation, Link } from "react-router-dom";
import { PageTransition } from "../components/layout/PageTransition";
import { PipelineViewer } from "../components/editor/PipelineViewer";
import { Button } from "../components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

import { toast } from "sonner";
import {
  generationService,
  type BackendLanguage,
  type FrontendStack,
} from "../services/generationService";
import { FlowDiagram } from "../components/shared/FlowDiagram";
import { BackendLanguageSelector } from "../components/BackendLanguageSelector";
import { FrontendStackSelector } from "../components/FrontendStackSelector";
import type { FormModel, JsonSchema } from "../types";
import { FORMSYNC_BUILDER_EXPORT_FORM_KEY } from "../context/BuilderContext";

interface GeneratedCode {
  frontend: string;
  backend: string;
  dtos: string;
  tests: string;
}

interface LocationState {
  generatedCode?: GeneratedCode;
  /** Fresh JSON Schema from Form Builder (preferred over re-fetch by schemaId). */
  schema?: any;
  backendLanguage?: BackendLanguage;
  /** Present when arriving from Form Builder so fullstack ZIP matches canvas customizations */
  formModel?: FormModel;
}

/**
 * Reads and clears the one-shot builder export stash (full-page redirect safe).
 * Supports legacy payloads with only `form`; prefer `syncedSchema` when present.
 */
function consumeBuilderExportPayload(
  id: string | null,
): { form?: FormModel; syncedSchema?: JsonSchema } {
  if (!id) return {};
  try {
    const raw = sessionStorage.getItem(FORMSYNC_BUILDER_EXPORT_FORM_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      schemaId?: string;
      form?: FormModel;
      syncedSchema?: JsonSchema;
    };
    if (parsed.schemaId !== id) return {};
    sessionStorage.removeItem(FORMSYNC_BUILDER_EXPORT_FORM_KEY);
    return {
      form: parsed.form,
      syncedSchema: parsed.syncedSchema,
    };
  } catch {
    return {};
  }
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
  tests: `// Tests Pending Generation...`,
};

export const GeneratedCodePage: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const schemaId = query.get("schemaId");
  const backendLanguageFromQuery = query.get(
    "backendLanguage",
  ) as BackendLanguage | null;

  const [localState, setLocalState] = React.useState<LocationState | null>(
    (location.state as LocationState | null) ?? null,
  );
  const [isLoading, setIsLoading] = React.useState(() => {
    const rs = location.state as LocationState | null;
    return !rs?.generatedCode;
  });
  const [isDownloadingBackend, setIsDownloadingBackend] = React.useState(false);
  const [isDownloadingStaticFrontend, setIsDownloadingStaticFrontend] =
    React.useState(false);
  const backendLanguageFromSession = sessionStorage.getItem(
    "formsync_backend_language",
  ) as BackendLanguage | null;
  const initialBackendLanguage: BackendLanguage =
    backendLanguageFromQuery ||
    (location.state as LocationState | null)?.backendLanguage ||
    backendLanguageFromSession ||
    "springBoot";
  const [backendLanguage, setBackendLanguage] =
    React.useState<BackendLanguage>(initialBackendLanguage);

  const frontendStackFromSession = sessionStorage.getItem(
    "formsync_frontend_stack",
  ) as FrontendStack | null;
  const initialFrontendStack: FrontendStack =
    frontendStackFromSession === "htmlBootstrap" ? "htmlBootstrap" : "react";
  const [frontendStack, setFrontendStack] =
    React.useState<FrontendStack>(initialFrontendStack);

  /** Tracks backendLanguage for regenerating preview only when the user changes the selector. */
  const prevBackendLanguageRef = React.useRef<BackendLanguage | null>(null);

  // Define stages for the progress bar
  const completionStages: any[] = [
    { name: "Enter Schema", status: "complete", progress: 100 },
    { name: "Input Validation", status: "complete", progress: 100 },
    { name: "Schema Conversion", status: "complete", progress: 100 },
    { name: "AI Enhancement", status: "complete", progress: 100 },
    { name: "Frontend Generation", status: "complete", progress: 100 },
    { name: "Backend Generation", status: "complete", progress: 100 },
    { name: "DTO Generation", status: "complete", progress: 100 },
    { name: "Test Generation", status: "complete", progress: 100 },
  ];

  React.useEffect(() => {
    if (localState?.generatedCode) {
      setIsLoading(false);
      return;
    }

    const routeState = location.state as LocationState | null;
    const syncedFromBuilder = routeState?.schema;

    const hydrate = async () => {
      if (schemaId && syncedFromBuilder) {
        setIsLoading(true);
        try {
          try {
            sessionStorage.removeItem(FORMSYNC_BUILDER_EXPORT_FORM_KEY);
          } catch {
            /* ignore */
          }
          const result = await generationService.generateAll(
            syncedFromBuilder,
            backendLanguage,
          );
          if (result.success && result.data) {
            setLocalState({
              generatedCode: { ...MOCK_CODE, ...result.data },
              schema: syncedFromBuilder,
              backendLanguage: routeState?.backendLanguage,
              ...(routeState?.formModel && { formModel: routeState.formModel }),
            });
            toast.success("Code generated successfully");
          } else {
            throw new Error(result.error || "Generation failed");
          }
        } catch (error) {
          console.error("Error in GeneratedCodePage:", error);
          setLocalState({
            generatedCode: MOCK_CODE,
            schema: syncedFromBuilder,
            ...(routeState?.formModel && { formModel: routeState.formModel }),
          });
          toast.info("Using demo data (Generation failed)");
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (schemaId) {
        const stash = consumeBuilderExportPayload(schemaId);

        if (stash.syncedSchema) {
          setIsLoading(true);
          try {
            const result = await generationService.generateAll(
              stash.syncedSchema,
              backendLanguage,
            );
            if (result.success && result.data) {
              setLocalState({
                generatedCode: { ...MOCK_CODE, ...result.data },
                schema: stash.syncedSchema,
                ...(stash.form && { formModel: stash.form }),
              });
              toast.success("Code generated successfully");
            } else {
              throw new Error(result.error || "Generation failed");
            }
          } catch (error) {
            console.error("Error in GeneratedCodePage:", error);
            setLocalState({
              generatedCode: MOCK_CODE,
              schema: stash.syncedSchema,
              ...(stash.form && { formModel: stash.form }),
            });
            toast.info("Using demo data (Generation failed)");
          } finally {
            setIsLoading(false);
          }
          return;
        }

        setIsLoading(true);
        try {
          const response = await fetch(`/schema/${schemaId}`);
          if (!response.ok) throw new Error("Failed to fetch schema");

          const schemaData = await response.json();

          const result = await generationService.generateAll(
            schemaData,
            backendLanguage,
          );

          if (result.success && result.data) {
            setLocalState({
              generatedCode: { ...MOCK_CODE, ...result.data },
              schema: schemaData,
              ...(stash.form && { formModel: stash.form }),
            });
            toast.success("Code generated successfully");
          } else {
            throw new Error(result.error || "Generation failed");
          }
        } catch (error) {
          console.error("Error in GeneratedCodePage:", error);
          setLocalState({
            generatedCode: MOCK_CODE,
            schema: { name: "Demo Schema", content: {} },
          });
          toast.info("Using demo data (Generation failed)");
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setLocalState({
        generatedCode: MOCK_CODE,
        schema: { name: "Demo Schema", content: {} },
      });
      setIsLoading(false);
    };

    void hydrate();
  }, [localState?.generatedCode, schemaId, location.state]);

  React.useEffect(() => {
    const schema = localState?.schema;
    if (!schema || !localState?.generatedCode) return;

    if (prevBackendLanguageRef.current === null) {
      prevBackendLanguageRef.current = backendLanguage;
      return;
    }

    if (prevBackendLanguageRef.current === backendLanguage) return;

    prevBackendLanguageRef.current = backendLanguage;

    let cancelled = false;
    void (async () => {
      try {
        const result = await generationService.generateAll(schema, backendLanguage);
        if (cancelled || !result.success || !result.data) return;
        setLocalState((prev) =>
          prev
            ? {
                ...prev,
                generatedCode: {
                  ...prev.generatedCode!,
                  ...result.data!,
                },
              }
            : prev,
        );
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [backendLanguage, localState?.schema, localState?.generatedCode]);

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
  const generatedCode = state.generatedCode!;

  /** Download a fullstack ZIP with frontend + selected backend. */
  const handleDownloadAll = async () => {
    if (!state?.schema) {
      toast.error("No schema available for bundle generation");
      return;
    }
    setIsDownloadingBackend(true);
    try {
      sessionStorage.setItem("formsync_backend_language", backendLanguage);
      sessionStorage.setItem("formsync_frontend_stack", frontendStack);
      await generationService.downloadFullstackZip(
        state.formModel,
        state.schema,
        backendLanguage,
        frontendStack,
      );
      toast.success("Fullstack project downloaded successfully!");
    } catch (error: any) {
      console.error("Fullstack download failed:", error);
      toast.error(error.message || "Failed to download fullstack project");
    } finally {
      setIsDownloadingBackend(false);
    }
  };

  const handleDownloadStaticFrontendOnly = async () => {
    if (!state.formModel) {
      toast.error(
        "Open this page from the Form Builder with your form to download the HTML frontend.",
      );
      return;
    }
    setIsDownloadingStaticFrontend(true);
    try {
      await generationService.downloadStaticFrontendZip(state.formModel);
      toast.success("Static HTML frontend downloaded!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Download failed";
      toast.error(message);
    } finally {
      setIsDownloadingStaticFrontend(false);
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
              Your complete application code is ready! Review, copy, or
              download.
            </p>
            <div className="mt-4 max-w-3xl space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-500 mb-2">
                  Backend Language
                </label>
                <BackendLanguageSelector
                  selected={backendLanguage}
                  onChange={(selected) => {
                    setBackendLanguage(selected);
                    sessionStorage.setItem(
                      "formsync_backend_language",
                      selected,
                    );
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-500 mb-2">
                  Frontend Stack
                </label>
                <FrontendStackSelector
                  selected={frontendStack}
                  onChange={(stack) => {
                    setFrontendStack(stack);
                    sessionStorage.setItem("formsync_frontend_stack", stack);
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDownloadingStaticFrontend}
                  onClick={() => void handleDownloadStaticFrontendOnly()}
                >
                  {isDownloadingStaticFrontend
                    ? "Downloading…"
                    : "Download HTML frontend only"}
                </Button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Generation Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  All components have been successfully generated from your
                  schema.
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
              generatedCode={generatedCode}
              stages={completionStages}
              onDownloadAll={handleDownloadAll}
              isDownloading={isDownloadingBackend}
            />
          </div>
        </main>
      </div>
    </PageTransition>
  );
};
