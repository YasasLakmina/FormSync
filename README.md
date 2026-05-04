# FormSync

> **Schema-first authoring, AI-assisted enhancement, and generator-backed delivery across forms and backends**

FormSync is an intelligent, end-to-end solution for creating JSON schemas and generating production-ready forms, APIs, and DTOs with AI-powered enhancement and validation. The codebase is a single **npm workspaces** monorepo: a React client, an Express **API gateway**, NestJS services, and several generator and bundling services (described in the system summary below).

**What the system does:** FormSync is an end-to-end platform for turning structured requirements into reviewable **JSON Schemas** and then into generated software. On the **client**, users either edit schemas directly in a Monaco-based **technical editor** (JSON, YAML, XML) or compose them visually in a **template builder** with drag-and-drop fields, templates, and live preview. The **schema enhancement engine** (NestJS) handles format detection and conversion, validation, **quality scoring**, and **human-in-the-loop AI enhancement** using an OpenAI-compatible LLM API. **SRS import** from PDF/DOCX supports extracting user-story style inputs into the schema workflow. Persistent data, including schemas and related metadata, and **user accounts**, are stored in **PostgreSQL** with **Prisma**; **JWT authentication** and **template** APIs are exposed through a dedicated **user management** service.

All traffic from the browser flows through a single **API gateway** (Express) that routes to the schema engine, user service, and a family of **generator microservices**: **Java/Spring DTOs**, **full Spring Boot** backends, **Node.js** and **ASP.NET Core** APIs, **React** and **static HTML** frontends, and **form/bundle** packaging via the **formgen** pipeline, built on shared libraries such as **`@formsync/schema-openapi`** for internal schema and OpenAPI mapping. The system is developed as an **npm workspaces** monorepo and can be brought up for demos or deployment with **Docker Compose**, including the database, gateway, and downstream services with health checks and documented ports.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [API Gateway Routes](#api-gateway-routes)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

---

## Overview

FormSync transforms the way developers and non-technical users create and manage JSON schemas. With dual interfaces for both technical and non-technical users, AI-powered schema enhancement, and automatic code generation, FormSync reduces the friction of schema creation while aiming for consistent, reviewable quality.

### Key Highlights

- **AI-powered**: LLM integration via an **OpenAI-compatible** HTTP API (provider and model are configurable; e.g. OpenAI, Groq, or other compatible endpoints).
- **Dual interface**: Technical Editor for developers, Template Builder for non-technical users.
- **Multi-format support**: JSON, YAML, and XML input/output (via the schema engine).
- **Drag & drop**: Intuitive field reordering and template-based schema building in the UI.
- **Real-time generation**: React bundles, static frontends, and backend stubs produced through dedicated generator services behind the gateway.
- **Test case generation**: AI-assisted test-oriented outputs where implemented in the pipeline.
- **Quality metrics**: Built-in schema quality scoring and validation.
- **OpenAPI integration**: OpenAPI-related tooling and generators (`services/schema-openapi`, schema/service routes).
- **Microservices layout**: Single entry through the **API Gateway** (`services/api-gateway`, default port **3000**); downstream services on **3010-3017** in local/Docker layouts (see `docker-compose.yml`).

---

## Architecture

![FormSync System Architecture](formsync/docs/architecture.png)

<!-- Place `architecture.png` next to this README: use `./docs/architecture.png` when this file lives in the **monorepo root** (same folder as `package.json`, e.g. `formsync/README.md`). If the README sits **one level above** the app folder, use `formsync/docs/architecture.png` instead. Add the image file if it is missing. -->

FormSync is organised as a **frontend**, an **API Gateway**, **core NestJS services**, and **generator microservices**:

1. **Schema UI** (`frontend`) - schema creation and generation UX.
2. **Schema API** (`services/schema-enhancement-engine`) - parsing, conversion, validation, AI enhancement, Prisma/PostgreSQL.
3. **User & templates API** (`services/user-management-service`) - auth and template endpoints (via gateway).
4. **Form generation stack** - `services/formgen-service` plus shared packages (`packages/form-types`, `packages/formgen-shared`) for orchestration and shared types.
5. **DTO & backend generators** - `services/backend-dto-generator`, `services/runtime-binding-engine`, `services/node-backend-generator`, `services/dotnet-backend-generator`, `services/static-frontend-generator`.

---

## Components

### 1. Schema UI (`frontend`)

**Frontend application with dual user interfaces**

#### Technical Editor

Perfect for developers who need full control:

- **Monaco Editor**: Professional code editor with syntax highlighting.
- **Multi-format input**: Support for JSON, YAML, and XML.
- **Schema tree view**: Visual hierarchy of schema structure (where exposed in the UI).
- **Undo/redo history**: History management in the editor flows.
- **Upload support**: Import existing schemas.
- **AI enhancement**: Human-in-the-loop AI-powered schema improvement.
- **Live validation**: Real-time schema validation feedback.

#### Template Builder

Designed for non-technical users:

- **Quick add fields**: Pre-built field templates (email, phone, date, etc.).
- **Schema templates**: Ready-to-use form templates (contact, registration, survey, etc.).
- **Drag & drop reordering**: Intuitive field organization (`@dnd-kit`).
- **Field validation editor**: Visual validation rule configuration.
- **Live preview**: Real-time JSON schema preview.
- **Modal-based editing**: Organized field editing flows.

**Tech stack**: React 18, TypeScript, Tailwind CSS, Monaco Editor, Framer Motion, `@dnd-kit`, Radix UI, Zustand, Axios.

---

### 2. Schema API (`services/schema-enhancement-engine`)

**AI-integrated backend for schema processing**

#### Core features

- **Format detection**: Automatic input format recognition.
- **Multi-format conversion**: Conversion between JSON, YAML, and XML.
- **AI enhancement**: LLM-powered schema enrichment with (depending on configuration):
  - Intelligent field descriptions.
  - Format and pattern suggestions.
  - Accessibility-oriented metadata.
  - Example value generation.
- **Validation engine**: Schema validation.
- **Error correction**: AI-assisted error detection and fixing.
- **Quality metrics**: Schema quality scoring (completeness, validation coverage, documentation, accessibility-related signals).
- **Persistence**: PostgreSQL via Prisma (schemas, versions; see Prisma schema in the service).

#### AI integration

- **Provider**: OpenAI-compatible API (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, model env vars; see `docker-compose.yml` and service `.env` examples).
- **Capabilities**: Enhancement, suggestions, quality improvements, test-oriented generation where wired.

**Tech stack**: NestJS, TypeScript, Prisma, PostgreSQL, class-validator, JSON Schema tooling, OpenAI-compatible client.

---

### 3. FormGen stack (`services/formgen-service` + `packages/*`)

**Runtime and bundle generation aligned with FormSync’s form model**

#### Features (conceptually aligned with “FormGen Core” in earlier drafts)

- **Dynamic form generation**: React-oriented bundles and static outputs produced from schemas/form models.
- **Data binding**: Generated middleware or bindings as implemented per generator template.
- **Validation**: Client/server validation aligned with schema constraints.
- **AI test case generation**: Where connected to the enhancement/generation pipeline.
- **Extensibility**: Multiple output modes routed via `/formgen/*` and `/bundle/*` on the gateway.

#### Use cases

- Dynamic admin panels.
- Survey and form builders.
- Configuration UIs.
- Data entry applications.

**Tech stack**: Node.js/Express (`formgen-service`), shared TypeScript packages (`form-types`, `formgen-shared`), Handlebars/templates inside generator services as applicable.

---

### 4. DTO & backend generators (`backend-dto-generator`, `runtime-binding-engine`, `node-backend-generator`, `dotnet-backend-generator`, `static-frontend-generator`)

**Schema-driven Java/Spring DTOs, full Spring Boot servers, Node, .NET, static HTML**

#### Features

- **Java DTO generation**: Type-safe DTOs with validation annotations (backend DTO service).
- **OpenAPI specification**: Spec artifacts where generated by the pipeline.
- **Spring Boot runtime**: `runtime-binding-engine` can emit a **complete runnable Spring Boot** project (see `services/runtime-binding-engine/README.md`).
- **Node & .NET**: `node-backend-generator`, `dotnet-backend-generator`.
- **Static frontend**: `static-frontend-generator` for HTML/Bootstrap-style output.

#### Example artifact layout (illustrative; exact paths depend on the chosen generator)

```
FormSync-export.zip (conceptual)
├── frontend/              # or React bundle from formgen / static generator
├── backend/
│   ├── dto/               # Java DTOs (dto-generator)
│   └── api/
│       └── openapi.yaml   # when generated
└── middleware/            # binding/helpers when included in the bundle
```

**Tech stack**: Node.js, TypeScript, Handlebars (templates), OpenAPI-related libraries via `services/schema-openapi` (`@formsync/schema-openapi`) and other services.

---

## Features

### For non-technical users

- Visual template-based schema building.
- Drag & drop field reordering.
- Pre-built form templates.
- No coding required for the builder path.
- Live preview.

### For developers

- Multi-format schema editing (JSON/YAML/XML).
- Professional Monaco editor.
- AI-powered enhancements (with API keys configured).
- Multi-stack code generation (gateway-routed).
- OpenAPI-related outputs.
- Test-oriented AI outputs where enabled.

### AI capabilities

- Intelligent schema enhancement.
- Error detection and correction assistance.
- Quality metrics and scoring.
- Automated test case-style generation where implemented.
- Field description enrichment.

### Platform

- Centralised routing and aggregate health via the API Gateway.
- Docker Compose option for PostgreSQL and all services (see `docker-compose.yml`).

---

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript (Vite).
- **Styling**: Tailwind CSS.
- **UI components**: Radix UI and app-specific components.
- **Editor**: Monaco Editor.
- **State management**: Zustand.
- **Animations**: Framer Motion.
- **Drag & drop**: `@dnd-kit`.
- **HTTP client**: Axios.

### Backend

- **Gateway**: Express (`services/api-gateway`).
- **Core APIs**: NestJS (`schema-enhancement-engine`, `user-management-service`).
- **Generators**: Express microservices (DTO, runtime, formgen, Node, .NET, static frontend).
- **AI integration**: OpenAI-compatible API (key/base URL/model from environment).
- **Validation**: class-validator, JSON Schema validators (per service).
- **Documentation**: OpenAPI/Swagger where enabled on NestJS services (`/api/docs` patterns).

### Data & caching

- **PostgreSQL** + **Prisma** on schema and user services; Redis/caching as described in `services/schema-enhancement-engine/README.md` when enabled.

### Build tools

- **Package manager**: npm.
- **Monorepo**: npm **workspaces** (root `package.json`).
- **Bundler**: Vite (frontend).
- **Linting**: ESLint.
- **Formatting**: Prettier.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL (local dev) *or* Docker for the full stack.
- LLM API credentials if you use AI features (`OPENAI_API_KEY`, optional `OPENAI_BASE_URL`, model variables).

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YasasLakmina/FormSync
   cd FormSync/formsync
   ```

   Use the directory that contains this README and the root `package.json` (npm workspaces). If your fork has no outer `FormSync` folder and the monorepo is the clone root, `cd` into that root directly instead of `FormSync/formsync`.

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - **Repository root** `.env`: often consumed by `api-gateway` and Docker Compose (see `docker-compose.yml` for `JWT_SECRET`, `DATABASE_URL`, `OPENAI_*`, ports).
   - **`frontend/.env`**: point the UI at the gateway, e.g.  
     `VITE_API_URL=http://localhost:3000`, `VITE_API_GATEWAY_URL=http://localhost:3000`, and other `VITE_*` vars used in your branch.
   - **Per-service** `.env` files under `services/*` as required for local ports (`SCHEMA_ENGINE_URL`, `USER_SERVICE_URL`, etc.).

   Example fragments (adjust to your setup):

   ```env
   # Schema engine / shared DB (illustrative)
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DBNAME
   OPENAI_API_KEY=your_key_here
   ```

4. **Database (Prisma)**

   From the **monorepo root** (the folder containing `services/`), enter the schema engine and run Prisma:

   ```bash
   cd services/schema-enhancement-engine
   npx prisma generate
   npx prisma migrate dev
   ```

   Repeat or align migrations for `user-management-service` if your branch expects a shared DB (follow that service’s README).

5. **Run the development servers**

   ```bash
   # Default dev task: gateway, schema engine, user service, DTO generator, runtime engine,
   # formgen, node-backend generator, and frontend (see root package.json "dev" script).
   npm run dev
   ```

   For **all** backend generators, including **static frontend** and **.NET**, use **Docker Compose** or start the extra workspaces manually. The root `dev` script does **not** currently include `static-frontend-generator` or `dotnet-backend-generator`.

   **Targeted scripts** (from monorepo root):

   ```bash
   npm run dev:gateway
   npm run dev:schema:api      # schema-enhancement-engine
   npm run dev:schema:ui       # frontend
   npm run dev:user:api
   npm run dev:backend-gen
   npm run dev:runtime
   npm run dev:formgen
   npm run dev:node-backend
   npm run dev:static-frontend
   ```

   For **dotnet-backend-generator**, run `npm run dev` inside `services/dotnet-backend-generator` (no root shortcut script yet).

6. **Access the application**

   - **Frontend (Vite):** http://localhost:5173  
   - **API Gateway:** http://localhost:3000  
   - **Direct services (typical local defaults):** 3010 schema engine, 3011 user service, 3012 DTO, 3013 runtime, 3014 formgen, 3015 Node gen, 3016 .NET gen, 3017 static frontend gen  
   - **Gateway docs / health:** `GET http://localhost:3000/health`, service Swagger where configured (often `http://localhost:3010/api/docs` for Nest, not via gateway unless proxied; check the running service).

### Docker Compose

```bash
docker compose up --build
```

See comments at the top of `docker-compose.yml` for ports and service graph.

### Build for production

```bash
npm run build
npm run build --workspace=frontend   # example: single workspace
```

---

## Documentation

### API usage

In development, **prefer calling through the API Gateway** at `http://localhost:3000` so paths match the deployed topology:

- Schema operations under **`/schema/*`** (proxied to the schema enhancement engine).
- Auth and templates under **`/auth/*`**, **`/users/*`**, **`/template*`**.
- Generators under **`/dto/*`**, **`/runtime/*`**, **`/formgen/*`**, **`/bundle/*`**, **`/node-backend/*`**, **`/dotnet-backend/*`**, **`/static-frontend/*`**.

Illustrative routes (names may vary by version; inspect gateway and service OpenAPI):

| Concern | Example (via gateway) |
|--------|------------------------|
| Convert / validate / enhance | `POST /schema/...` (see live OpenAPI on the schema service) |
| Generated DTOs | `POST /dto/...` |
| Full Spring Boot zip | `POST /runtime/...` |

### Component guides (frontend)

#### Technical Editor

```tsx
// Paths: frontend/src/components/TechnicalEditor.tsx
import { TechnicalEditor } from "@/components/TechnicalEditor";

<TechnicalEditor
  onGenerate={handleGenerate}
  isGenerating={false}
  onStageUpdate={handleStageUpdate}
/>;
```

#### Template Builder

```tsx
import { TemplateBuilder } from "@/components/TemplateBuilder";

<TemplateBuilder onUseSchema={handleSchemaCreated} />;
```

#### Generated outputs

Consumption depends on the bundle you download (React zip, static HTML, Spring Boot project, etc.). See in-app **Documentation** and each service README under `services/`.

---

## API Gateway Routes

| Prefix | Downstream |
|--------|------------|
| `/schema/*` | Schema enhancement engine |
| `/auth/*`, `/users/*`, `/template*` | User management service |
| `/dto/*` | Backend DTO generator |
| `/runtime/*` | Runtime binding engine |
| `/formgen/*`, `/bundle/*` | Formgen service |
| `/node-backend/*` | Node backend generator |
| `/dotnet-backend/*` | .NET backend generator |
| `/static-frontend/*` | Static frontend generator |
| `GET /health` | Aggregated health |

---

## Project Structure

```
formsync/
├── frontend/
│   ├── src/
│   │   ├── components/          # TechnicalEditor, TemplateBuilder, UI
│   │   ├── pages/               # Route-level screens
│   │   ├── stores/              # Zustand / state
│   │   └── api/                 # HTTP clients → gateway
│   └── package.json
├── packages/
│   ├── form-types/
│   └── formgen-shared/
├── services/
│   ├── api-gateway/
│   ├── schema-openapi/          # @formsync/schema-openapi (library; OpenAPI builders)
│   ├── schema-enhancement-engine/
│   │   ├── src/                 # NestJS modules (schema, AI, plugins)
│   │   └── prisma/
│   ├── user-management-service/
│   ├── backend-dto-generator/
│   ├── runtime-binding-engine/
│   ├── formgen-service/
│   ├── node-backend-generator/
│   ├── dotnet-backend-generator/
│   └── static-frontend-generator/
├── docs/                        # Optional: architecture.png, extra docs
├── docker-compose.yml
├── package.json                 # npm workspaces root
└── LICENSE
```

---

## Contributing

We welcome contributions when the repository is shared for collaboration. Please follow these guidelines:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

### Development guidelines

- Follow TypeScript best practices.
- Write meaningful commit messages.
- Add tests for new features.
- Update documentation as needed.
- Ensure lint/tests pass before submitting a PR (`npm run lint`, `npm test`).

---

## Acknowledgments

This project is submitted in the context of a **Research Project (RP)** and related programme support. The authors gratefully acknowledge:

- **Supervisor:** Mr. Jeewaka Perera - project supervision and guidance.
- **Co-Supervisor:** Ms. Thilini Jayalath - project supervision and guidance.
- **Team members:** Thamindu Vimansha, Thihansi Gunawardena, Yasas Lakmina, and Movindu Liyanage - design, implementation, and documentation throughout the project.
- **Evaluation panel:** the RP evaluation panel for their time, feedback, and assessment of this work.
- **CDAP team:** the CDAP team for programme support, coordination, and resources made available to the project.
- **All other contributors:** mentors, lab staff, open-source maintainers, and external collaborators who supported development, tooling, or deployment.

Technology and communities that make FormSync possible include:

- **OpenAI-compatible LLM APIs** and providers used for development and deployment.
- **Monaco Editor** for the code editor experience.
- **NestJS** and **Express** ecosystems.
- **React** and **Vite** teams.
- **Prisma** and **PostgreSQL**.
- All **open-source contributors** whose libraries appear in workspace `package.json` files.

---

## Contact

For questions, suggestions, or support:

- **Issues:** [GitHub Issues](https://github.com/YasasLakmina/FormSync/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YasasLakmina/FormSync/discussions)

---

<div align="center">

⭐ Star this repo if you find it helpful!

</div>
