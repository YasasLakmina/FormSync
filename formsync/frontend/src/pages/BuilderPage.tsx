import React, { useEffect, useRef } from "react";
import {
  BuilderProvider,
  useBuilder,
  clearBuilderDraft,
  FORMSYNC_BUILDER_DRAFT_KEY,
  FORMSYNC_BUILDER_SCHEMA_ID_KEY,
} from "../context/BuilderContext";
import { BuilderLayout } from "../builder/BuilderLayout";
import { FormModel, parseJsonSchemaToFormModel } from "../types";
import { useAuth } from "../context/AuthContext";
import "../builder/builder.css";

function showLoadedToast() {
  const n = document.createElement("div");
  n.textContent = "✅ Schema loaded";
  n.style.cssText =
    "position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 24px;border-radius:8px;font-family:Inter,sans-serif;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,.1);";
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

function showErrorToast(message: string) {
  const n = document.createElement("div");
  n.textContent = message;
  n.style.cssText =
    "position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 24px;border-radius:8px;font-family:Inter,sans-serif;z-index:9999;";
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 4000);
}

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
      try {
        const response = await fetch(`/schema/${schemaId}`);
        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`,
          );
        }

        const schemaData = await response.json();
        const formModel = parseJsonSchemaToFormModel(schemaData.content);

        clearBuilderDraft();
        dispatch({ type: "UPDATE_FORM", payload: formModel });
        dispatch({ type: "SET_SCHEMA_ID", payload: schemaId });
        setSchemaIdInUrl(schemaId);
        showLoadedToast();
      } catch (error) {
        console.error("Failed to load schema:", error);
        try {
          sessionStorage.removeItem(FORMSYNC_BUILDER_SCHEMA_ID_KEY);
        } catch {
          /* ignore */
        }
        showErrorToast(
          `❌ Failed to load schema: ${error instanceof Error ? error.message : "API Error"}`,
        );
        runSyncFallbacks();
      }
    };

    const runSyncFallbacks = () => {
      const pending = sessionStorage.getItem("formsync_pending_schema");
      if (pending) {
        const loadAndSave = async () => {
          try {
            const schema = JSON.parse(pending);
            sessionStorage.setItem("formsync_schema_raw", pending);
            const formModel = parseJsonSchemaToFormModel(schema);
            clearBuilderDraft();
            dispatch({ type: "UPDATE_FORM", payload: formModel });

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
            showLoadedToast();
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
            dispatch({
              type: "UPDATE_FORM",
              payload: draft.form as FormModel,
            });
            if (typeof draft.activeStep === "number") {
              dispatch({ type: "SET_STEP", payload: draft.activeStep });
            }
            if (draft.schemaId) {
              dispatch({ type: "SET_SCHEMA_ID", payload: draft.schemaId });
            }
            showLoadedToast();
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
          const schema = JSON.parse(raw);
          const formModel = parseJsonSchemaToFormModel(schema);
          clearBuilderDraft();
          dispatch({ type: "UPDATE_FORM", payload: formModel });
          showLoadedToast();
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
