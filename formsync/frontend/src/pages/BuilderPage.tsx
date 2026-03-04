import React, { useEffect, useRef } from "react";
import { BuilderProvider, useBuilder } from "../context/BuilderContext";
import { BuilderLayout } from "../builder/BuilderLayout";
import { parseJsonSchemaToFormModel } from "../types";
import { useAuth } from "../context/AuthContext";
import "../builder/builder.css";

/**
 * Schema Loader — reads ?schemaId from the URL, fetches from schema-api,
 * converts to FormModel, and dispatches to BuilderContext.
 * Falls back to a demo form if no schemaId is present.
 */
const SchemaLoader: React.FC = () => {
  const { dispatch } = useBuilder();
  const { user } = useAuth();
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const urlParams = new URLSearchParams(window.location.search);
    const schemaId = urlParams.get("schemaId");

    if (schemaId) {
      const fetchSchema = async () => {
        try {
          const response = await fetch(`/api/schema/${schemaId}`);
          if (!response.ok)
            throw new Error(
              `API returned ${response.status}: ${response.statusText}`,
            );

          const schemaData = await response.json();
          const formModel = parseJsonSchemaToFormModel(schemaData.content);

          dispatch({ type: "UPDATE_FORM", payload: formModel });
          dispatch({ type: "SET_SCHEMA_ID", payload: schemaId });

          // Clean up URL param
          window.history.replaceState({}, "", window.location.pathname);

          // Toast-style notification
          const n = document.createElement("div");
          n.textContent = "✅ Schema loaded";
          n.style.cssText =
            "position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 24px;border-radius:8px;font-family:Inter,sans-serif;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,.1);";
          document.body.appendChild(n);
          setTimeout(() => n.remove(), 3000);
        } catch (error) {
          console.error("Failed to load schema:", error);
          const n = document.createElement("div");
          n.textContent = `❌ Failed to load schema: ${error instanceof Error ? error.message : "API Error"}`;
          n.style.cssText =
            "position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 24px;border-radius:8px;font-family:Inter,sans-serif;z-index:9999;";
          document.body.appendChild(n);
          setTimeout(() => n.remove(), 4000);
          loadDemoForm(dispatch);
        }
      };
      fetchSchema();
    } else {
      // No saved schemaId — check for a schema passed via sessionStorage (skip-save path)
      const pending = sessionStorage.getItem("formsync_pending_schema");
      if (pending) {
        const loadAndSave = async () => {
          try {
            const schema = JSON.parse(pending);
            // Convert to FormModel and load into builder
            const formModel = parseJsonSchemaToFormModel(schema);
            dispatch({ type: "UPDATE_FORM", payload: formModel });

            // Auto-save to get a real schemaId so "Generate Code" works
            if (user?.id) {
              try {
                const saveResponse = await fetch("/api/schema", {
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
                }
              } catch {
                // Auto-save failed — proceed without schemaId; Generate Code will still work via fallback
              }
            }

            sessionStorage.removeItem("formsync_pending_schema");

            const n = document.createElement("div");
            n.textContent = "✅ Schema loaded";
            n.style.cssText =
              "position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 24px;border-radius:8px;font-family:Inter,sans-serif;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,.1);";
            document.body.appendChild(n);
            setTimeout(() => n.remove(), 3000);
          } catch {
            sessionStorage.removeItem("formsync_pending_schema");
            loadDemoForm(dispatch);
          }
        };
        loadAndSave();
      } else {
        loadDemoForm(dispatch);
      }
    }
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
