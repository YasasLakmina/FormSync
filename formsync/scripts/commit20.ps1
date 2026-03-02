Set-Location "C:\Users\Yasas Lakmina\.gemini\antigravity\scratch"

function Stage-Deleted {
    param([string[]]$patterns)
    $allDeleted = git ls-files --deleted
    foreach ($p in $patterns) {
        $matched = $allDeleted | Where-Object { $_ -like "*$p*" }
        foreach ($f in $matched) {
            & git rm -- $f 2>&1 | Out-Null
        }
    }
}

function Stage-New {
    param([string[]]$paths)
    foreach ($p in $paths) {
        & git add -- $p 2>&1 | Out-Null
    }
}

function Commit {
    param([string]$msg)
    $r = & git commit -m $msg 2>&1
    Write-Host "  --> $($r | Select-Object -First 1)"
}

function Log-Step {
    param([int]$n, [string]$title)
    Write-Host "`n=== COMMIT $n : $title ===" -ForegroundColor Cyan
}

# ── 1 ─────────────────────────────────────────────────────────────────────────
Log-Step 1 "Remove schema-api Prisma module and DTO layer"
Stage-Deleted @("apps/schema-api/src/prisma", "apps/schema-api/src/schema/dto")
Commit "refactor(schema-api): remove embedded Prisma module and schema DTOs"

# ── 2 ─────────────────────────────────────────────────────────────────────────
Log-Step 2 "Remove schema-api schema business module"
Stage-Deleted @("apps/schema-api/src/schema")
Commit "refactor(schema-api): remove schema service, controller, enhancer and quality engine"

# ── 3 ─────────────────────────────────────────────────────────────────────────
Log-Step 3 "Decommission apps/schema-api"
Stage-Deleted @("apps/schema-api")
Commit "chore: decommission apps/schema-api NestJS monolith (app module, main, prisma migrations, tsconfig)"

# ── 4 ─────────────────────────────────────────────────────────────────────────
Log-Step 4 "Remove schema-ui legacy builder"
Stage-Deleted @("apps/schema-ui/src/builder")
Commit "refactor(schema-ui): remove legacy drag-and-drop form builder (Canvas, LeftPanel, RightPanel, export handlers)"

# ── 5 ─────────────────────────────────────────────────────────────────────────
Log-Step 5 "Remove schema-ui UI components"
Stage-Deleted @("apps/schema-ui/src/components")
Commit "refactor(schema-ui): remove all legacy UI components (ActionToolbar, TechnicalEditor, TemplateBuilder, ValidationDialog, layout, ui)"

# ── 6 ─────────────────────────────────────────────────────────────────────────
Log-Step 6 "Remove schema-ui context, data, lib, stores"
Stage-Deleted @("apps/schema-ui/src/context", "apps/schema-ui/src/data", "apps/schema-ui/src/lib", "apps/schema-ui/src/stores")
Commit "refactor(schema-ui): remove context providers, data layer, utils and Zustand store"

# ── 7 ─────────────────────────────────────────────────────────────────────────
Log-Step 7 "Remove schema-ui pages, services, styles, tests"
Stage-Deleted @("apps/schema-ui/src/pages", "apps/schema-ui/src/services", "apps/schema-ui/src/styles", "apps/schema-ui/src/test")
Commit "refactor(schema-ui): remove page components, API services, design tokens and test stubs"

# ── 8 ─────────────────────────────────────────────────────────────────────────
Log-Step 8 "Decommission apps/schema-ui"
Stage-Deleted @("apps/schema-ui")
Commit "chore: decommission apps/schema-ui legacy frontend (index.html, App.tsx, vite config, tailwind, public assets)"

# ── 9 ─────────────────────────────────────────────────────────────────────────
Log-Step 9 "Remove user-api auth module"
Stage-Deleted @("apps/user-api/src/auth")
Commit "refactor(user-api): remove JWT auth module, guards, strategy and auth DTOs from monolith"

# ── 10 ────────────────────────────────────────────────────────────────────────
Log-Step 10 "Decommission apps/user-api"
Stage-Deleted @("apps/user-api")
Commit "chore: decommission apps/user-api NestJS service (template module, user module, Prisma service, nest-cli, tsconfig)"

# ── 11 ────────────────────────────────────────────────────────────────────────
Log-Step 11 "Remove formgen-core and formgen-templates shared packages"
Stage-Deleted @("packages/formgen-core", "packages/formgen-templates")
Commit "chore: remove packages/formgen-core and formgen-templates (JSON Schema adapter, form model, type definitions)"

# ── 12 ────────────────────────────────────────────────────────────────────────
Log-Step 12 "Remove root backend-dto-generator source files"
Stage-Deleted @("backend-dto-generator/src")
Commit "refactor(backend-dto-generator): remove root-level source (SchemaMapper, BackendGenerator, server, Java Handlebars templates)"

# ── 13 ────────────────────────────────────────────────────────────────────────
Log-Step 13 "Remove root backend-dto-generator scaffold files"
Stage-Deleted @("backend-dto-generator")
Commit "chore: remove root-level backend-dto-generator package.json, tsconfig and jest config"

# ── 14 ────────────────────────────────────────────────────────────────────────
Log-Step 14 "Remove root runtime-binding-engine"
Stage-Deleted @("runtime-binding-engine")
Commit "chore: remove root-level runtime-binding-engine (SpringBoot generator, all Spring templates, pom.hbs, README)"

# ── 15 ────────────────────────────────────────────────────────────────────────
Log-Step 15 "Remove formgen-service, legacy infra and root config files"
Stage-Deleted @("formgen-service", "Containerized DBs", "tsconfig.base.json", ".eslintrc.json", ".prettierrc", ".gitattributes", ".gitignore")
Commit "chore: remove root formgen-service, docker-compose infra and legacy root config files (tsconfig, eslint, prettier, gitfiles)"

# ── 16 ────────────────────────────────────────────────────────────────────────
Log-Step 16 "Add config/ shared tooling directory"
Stage-New @("formsync/config/")
Commit "chore: add config/ with shared tsconfig.base.json, .eslintrc.json and .prettierrc"

# ── 17 ────────────────────────────────────────────────────────────────────────
Log-Step 17 "Add services/api-gateway"
Stage-New @("formsync/services/api-gateway/")
Commit "feat(api-gateway): add Express API gateway on port 3000 with proxy routing to all microservices"

# ── 18 ────────────────────────────────────────────────────────────────────────
Log-Step 18 "Add services/schema-enhancement-engine"
Stage-New @("formsync/services/schema-enhancement-engine/")
Commit "feat(schema-enhancement-engine): add NestJS schema service on port 3010 (Prisma, Groq AI, quality engine, JWT auth)"

# ── 19 ────────────────────────────────────────────────────────────────────────
Log-Step 19 "Add services/user-management-service"
Stage-New @("formsync/services/user-management-service/")
Commit "feat(user-management-service): add NestJS auth service on port 3011 (JWT, Prisma, register/login, template CRUD)"

# ── 20 ────────────────────────────────────────────────────────────────────────
Log-Step 20 "Add code-gen services, frontend and update workspace config"
Stage-New @(
    "formsync/services/backend-dto-generator/",
    "formsync/services/runtime-binding-engine/",
    "formsync/services/formgen-service/",
    "formsync/frontend/",
    "formsync/package.json",
    "formsync/package-lock.json"
)
Commit "feat: add backend-dto-generator, runtime-binding-engine, formgen-service, frontend and update npm workspaces"

Write-Host "`n=== ALL 20 COMMITS DONE ===" -ForegroundColor Green
git log --oneline -21

