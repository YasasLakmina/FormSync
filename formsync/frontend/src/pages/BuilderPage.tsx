import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  BuilderProvider,
  useBuilder,
  clearBuilderDraft,
  FORMSYNC_BUILDER_DRAFT_KEY,
  FORMSYNC_BUILDER_SCHEMA_ID_KEY,
} from "../context/BuilderContext";
import { BuilderLayout } from "../builder/BuilderLayout";
import { FormModel, parseJsonSchemaToFormModel, type JsonSchema } from "../types";
import { useAuth } from "../context/AuthContext";
import { warnIfNestedRepeaterInForm } from "../lib/nestedRepeaterGuard";
import "../builder/builder.css";

function setSchemaIdInUrl(schemaId: string) {
  const u = new URL(window.location.href);
  u.searchParams.set("schemaId", schemaId);
  window.history.replaceState({}, "", `${u.pathname}${u.search}`);
}

/**
 * Schema Loader — reads ?schemaId from the URL or session backup, fetches from schema-api,
 * or restores pending / draft / raw JSON. Falls back to a demo form only when nothing applies.
 */
const SchemaLoader: React.FC = () => {
  const { dispatch } = useBuilder();
  const { user } = useAuth();
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const urlSchemaId = urlParams.get("schemaId");
    const storedSchemaId = sessionStorage.getItem(FORMSYNC_BUILDER_SCHEMA_ID_KEY);

    const loadFromApi = async (schemaId: string) => {
      toast.loading("Loading schema...");
      try {
        const response = await fetch(`/schema/${schemaId}`);
        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`,
          );
        }

        const schemaData = await response.json();
        const rawContent = schemaData.content as JsonSchema;
        const formModel = parseJsonSchemaToFormModel(rawContent);

        clearBuilderDraft();
        dispatch({ type: "SET_BASE_SCHEMA", payload: rawContent });
        dispatch({ type: "UPDATE_FORM", payload: formModel });
        warnIfNestedRepeaterInForm(formModel.fields);
        dispatch({ type: "SET_SCHEMA_ID", payload: schemaId });
        setSchemaIdInUrl(schemaId);
        toast.dismiss();
        toast.success("Schema loaded successfully");
      } catch (error) {
        console.error("Failed to load schema:", error);
        toast.dismiss();
        const detail =
          error instanceof Error ? error.message : "Unknown error";
        toast.error("Failed to load schema", { description: detail });
        try {
          sessionStorage.removeItem(FORMSYNC_BUILDER_SCHEMA_ID_KEY);
        } catch {
          /* ignore */
        }
        runSyncFallbacks();
      }
    };

    const runSyncFallbacks = () => {
      const pending = sessionStorage.getItem("formsync_pending_schema");
      if (pending) {
        const loadAndSave = async () => {
          try {
            const schema = JSON.parse(pending) as JsonSchema;
            sessionStorage.setItem("formsync_schema_raw", pending);
            const formModel = parseJsonSchemaToFormModel(schema);
            clearBuilderDraft();
            dispatch({ type: "SET_BASE_SCHEMA", payload: schema });
            dispatch({ type: "UPDATE_FORM", payload: formModel });
            warnIfNestedRepeaterInForm(formModel.fields);

            if (user?.id) {
              try {
                const saveResponse = await fetch("/schema", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: (schema.title as string) || "Untitled Schema",
                    description:
                      (schema.description as string) ||
                      "Auto-saved from Schema Editor",
                    content: schema,
                    sourceFormat: "json",
                    status: "validated",
                    userId: user.id,
                  }),
                });
                if (saveResponse.ok) {
                  const saved = await saveResponse.json();
                  dispatch({ type: "SET_SCHEMA_ID", payload: saved.id });
                  setSchemaIdInUrl(saved.id);
                }
              } catch {
                /* auto-save failed */
              }
            }

            sessionStorage.removeItem("formsync_pending_schema");
            toast.success("Schema loaded successfully");
          } catch {
            sessionStorage.removeItem("formsync_pending_schema");
            tryHydrateDraftOrRawOrDemo();
          }
        };
        void loadAndSave();
        return;
      }

      tryHydrateDraftOrRawOrDemo();
    };

    const tryHydrateDraftOrRawOrDemo = () => {
      const draftStr = sessionStorage.getItem(FORMSYNC_BUILDER_DRAFT_KEY);
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr) as {
            form?: unknown;
            activeStep?: number;
            schemaId?: string | null;
          };
          if (draft.form && typeof draft.form === "object") {
            const restored = draft.form as FormModel;
            dispatch({
              type: "UPDATE_FORM",
              payload: restored,
            });
            warnIfNestedRepeaterInForm(restored.fields);
            if (typeof draft.activeStep === "number") {
              dispatch({ type: "SET_STEP", payload: draft.activeStep });
            }
            if (draft.schemaId) {
              dispatch({ type: "SET_SCHEMA_ID", payload: draft.schemaId });
            }
            toast.success("Schema loaded successfully");
            return;
          }
        } catch {
          try {
            sessionStorage.removeItem(FORMSYNC_BUILDER_DRAFT_KEY);
          } catch {
            /* ignore */
          }
        }
      }

      const raw = sessionStorage.getItem("formsync_schema_raw");
      if (raw) {
        try {
          const schema = JSON.parse(raw) as JsonSchema;
          const formModel = parseJsonSchemaToFormModel(schema);
          clearBuilderDraft();
          dispatch({ type: "SET_BASE_SCHEMA", payload: schema });
          dispatch({ type: "UPDATE_FORM", payload: formModel });
          warnIfNestedRepeaterInForm(formModel.fields);
          toast.success("Schema loaded successfully");
          return;
        } catch {
          /* fall through */
        }
      }

      loadDemoForm(dispatch);
    };

    if (urlSchemaId) {
      void loadFromApi(urlSchemaId);
      return;
    }

    if (storedSchemaId) {
      void loadFromApi(storedSchemaId);
      return;
    }

    runSyncFallbacks();
  }, [dispatch, user]);

  return null;
};

function loadDemoForm(dispatch: ReturnType<typeof useBuilder>["dispatch"]) {
  setTimeout(() => {
    dispatch({
      type: "UPDATE_FORM",
      payload: {
        id: "sample-form",
        name: "Employee Onboarding",
        version: "1.0",
        meta: {
          title: "Employee Onboarding Form",
          description: "Please fill out your details below.",
        },
        theme: {
          mode: "light",
          density: "normal",
          radius: 6,
          colors: {
            primary: "#3b82f6",
            background: "#ffffff",
            surface: "#ffffff",
            text: "#111827",
            muted: "#6b7280",
            border: "#e5e7eb",
            error: "#ef4444",
            inputBackground: "#f9fafb",
          },
          typography: { fontFamily: "Inter, sans-serif", baseFontSize: 16 },
        },
        layout: { order: ["f1", "f2", "f3"] },
        fields: [
          {
            id: "f1",
            key: "fullName",
            type: "text",
            label: "Full Name",
            required: true,
            ui: {},
          },
          {
            id: "f2",
            key: "email",
            type: "email",
            label: "Email Address",
            required: true,
            ui: {},
          },
          {
            id: "f3",
            key: "role",
            type: "select",
            label: "Role",
            required: false,
            constraints: { enum: ["Dev", "Design", "Product"] },
            ui: {},
          },
        ],
        submit: { text: "Register Now" },
      },
    });
  }, 500);
}

/**
 * BuilderPage — the /builder route in schema-ui
 * Wraps the Form Builder in its own context + CSS scope.
 */
const BuilderPage: React.FC = () => {
  return (
    <BuilderProvider>
      <SchemaLoader />
      <BuilderLayout />
    </BuilderProvider>
  );
};

export default BuilderPage;
