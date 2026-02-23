# Runtime Binding Engine

A FormSync microservice that generates **complete, ready-to-run Spring Boot backend servers** from JSON Schema definitions. Unlike the backend-dto-generator (which produces only DTOs), this service generates the full stack — controllers with validation, services, repositories, entities, DTOs, exception handling, and all configuration files needed to build and run immediately.

---

## Features

- **Complete Spring Boot Server** — Generates a runnable Maven project with `mvn spring-boot:run`
- **Jakarta Bean Validation** — All controllers use `@Valid`, all DTOs/entities have `@NotNull`, `@NotBlank`, `@Email`, `@Min`, `@Max`, `@Size`, `@Pattern`, `@DecimalMin`, `@DecimalMax`
- **Request/Response DTOs** — Separate DTO layer for clean API contracts
- **Global Exception Handler** — Returns structured JSON error responses for validation failures, 404s, and 500s
- **H2 or PostgreSQL** — Configurable database (H2 in-memory by default)
- **Swagger/OpenAPI** — Optional `springdoc-openapi` integration
- **Schema-driven** — The JSON Schema structure stays constant; only the data (field names, types, constraints) changes
- **Preview mode** — Get generated file contents as JSON without downloading a zip
- **Zip download** — Download the entire Spring Boot project as a zip

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Java 17+** and **Maven 3.8+** (to run the *generated* Spring Boot server)

---

## Installation

```bash
cd formsync/apps/runtime-binding-engine
npm install
```

---

## Running the Service

### Development mode (with ts-node)

```bash
npm run dev
```

### Production mode

```bash
npm run build
npm start
```

The server starts on **port 3002** by default. Override with `PORT` env var:

```bash
PORT=4000 npm run dev
```

---

## API Endpoints

### `POST /generate`

Generates a complete Spring Boot project.

#### Request Body

```json
{
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Employee",
    "description": "Schema for Employee",
    "type": "object",
    "properties": {
      "employeeId": {
        "type": "string",
        "pattern": "^[A-Za-z0-9]+$",
        "description": "Unique identifier for the employee"
      },
      "fullName": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50,
        "description": "Full name of the employee"
      },
      "email": {
        "type": "string",
        "format": "email",
        "description": "Email address of the employee"
      },
      "age": {
        "type": "integer",
        "minimum": 0,
        "maximum": 150,
        "description": "Age of the employee"
      },
      "department": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50,
        "description": "Department of the employee"
      },
      "salary": {
        "type": "number",
        "minimum": 0,
        "maximum": 1000000,
        "description": "Salary of the employee"
      },
      "isPermanent": {
        "type": "boolean",
        "description": "Whether the employee is permanent"
      }
    },
    "required": ["employeeId", "fullName", "email", "age", "department", "salary", "isPermanent"]
  },
  "config": {
    "basePackage": "com.example.employee",
    "serverPort": 8080,
    "includeSwagger": true,
    "database": "h2"
  },
  "preview": false
}
```

#### Configuration Options

| Field            | Type    | Default              | Description                                   |
| ---------------- | ------- | -------------------- | --------------------------------------------- |
| `basePackage`    | string  | `com.example.demo`   | Java base package for generated code          |
| `serverPort`     | number  | `8080`               | Port for the generated Spring Boot server     |
| `includeSwagger` | boolean | `true`               | Include springdoc-openapi dependency          |
| `database`       | string  | `h2`                 | Database type: `h2` (in-memory) or `postgres` |

#### Response

- **`preview: false`** (default) — Returns a **zip file** (`springboot-server.zip`)
- **`preview: true`** — Returns JSON with all generated files:

```json
{
  "success": true,
  "requestId": "uuid",
  "files": [
    { "path": "pom.xml", "content": "..." },
    { "path": "src/main/java/com/example/employee/EmployeeApplication.java", "content": "..." }
  ]
}
```

#### Alternative: Fetch schema by ID

```json
{
  "schemaId": "your-schema-id-from-schema-api",
  "config": { "basePackage": "com.example.hr" }
}
```

#### Alternative: Pass schema directly as body

You can also pass the JSON Schema as the entire request body (no wrapper):

```bash
curl -X POST http://localhost:3002/generate \
  -H "Content-Type: application/json" \
  -d @your-schema.json \
  -o springboot-server.zip
```

### `GET /health`

Health check endpoint.

```json
{ "status": "ok", "service": "runtime-binding-engine", "uptime": 123.456 }
```

---

## Running the Generated Spring Boot Server

After downloading and extracting the generated zip:

```bash
# 1. Unzip
unzip springboot-server.zip -d my-server
cd my-server

# 2. Build
mvn clean install

# 3. Run
mvn spring-boot:run
```

The Spring Boot server starts on the configured port (default **8080**).

### Generated API Endpoints (Example: Employee schema)

| Method   | URL                      | Description               | Validation |
| -------- | ------------------------ | ------------------------- | ---------- |
| `GET`    | `/api/employees`         | List all employees        | —          |
| `GET`    | `/api/employees/{id}`    | Get employee by ID        | —          |
| `POST`   | `/api/employees`         | Create a new employee     | ✅ `@Valid` |
| `PUT`    | `/api/employees/{id}`    | Update an employee        | ✅ `@Valid` |
| `DELETE` | `/api/employees/{id}`    | Delete an employee        | —          |

### H2 Console (in-memory mode)

When using H2 database, the H2 console is available at:

```
http://localhost:8080/h2-console
```

- **JDBC URL**: `jdbc:h2:mem:employeedb`
- **Username**: `sa`
- **Password**: *(empty)*

### Validation Error Response Example

```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "Request body has 3 validation error(s)",
  "path": "/api/employees",
  "timestamp": "2026-02-23T10:30:00",
  "validationErrors": [
    { "field": "email", "message": "email must be a valid email address", "rejectedValue": "not-an-email" },
    { "field": "age", "message": "age must be at least 0", "rejectedValue": -5 },
    { "field": "fullName", "message": "fullName is required", "rejectedValue": null }
  ]
}
```

---

## Generated Project Structure

```
my-server/
├── pom.xml
├── src/
│   └── main/
│       ├── java/com/example/employee/
│       │   ├── EmployeeApplication.java        ← Spring Boot main class
│       │   ├── controller/
│       │   │   └── EmployeeController.java      ← REST API with @Valid
│       │   ├── dto/
│       │   │   ├── EmployeeRequest.java         ← Request DTO with validations
│       │   │   └── EmployeeResponse.java        ← Response DTO
│       │   ├── exception/
│       │   │   ├── ApiError.java                ← Structured error response
│       │   │   ├── GlobalExceptionHandler.java  ← Handles validation & 404 errors
│       │   │   └── ResourceNotFoundException.java
│       │   ├── model/
│       │   │   └── Employee.java                ← JPA Entity with validations
│       │   ├── repository/
│       │   │   └── EmployeeRepository.java      ← Spring Data JPA
│       │   └── service/
│       │       └── EmployeeService.java         ← Business logic + DTO mapping
│       └── resources/
│           └── application.yml                  ← Server, DB, logging config
```

---

## Supported JSON Schema Features

| JSON Schema Keyword | Java Validation Annotation                     |
| -------------------- | ----------------------------------------------- |
| `required`           | `@NotNull` / `@NotBlank` (for strings)          |
| `type: "string"`     | `String`                                        |
| `type: "integer"`    | `Integer` + `@Min` / `@Max`                     |
| `type: "number"`     | `Double` + `@DecimalMin` / `@DecimalMax`         |
| `type: "boolean"`    | `Boolean`                                       |
| `type: "array"`      | `List<T>` + `@ElementCollection`                |
| `type: "object"`     | Nested entity class                              |
| `format: "email"`    | `@Email`                                        |
| `format: "date"`     | `LocalDate`                                     |
| `format: "date-time"`| `LocalDateTime`                                 |
| `minLength/maxLength`| `@Size(min=, max=)`                             |
| `minimum/maximum`    | `@Min` / `@Max` (integers) or `@DecimalMin/Max` |
| `pattern`            | `@Pattern(regexp=)`                             |
| `enum`               | Java `enum` class                               |

---

## Running Tests

```bash
npm test
```

---

## Environment Variables

| Variable          | Default                              | Description                         |
| ----------------- | ------------------------------------ | ----------------------------------- |
| `PORT`            | `3002`                               | Port for this microservice          |
| `SCHEMA_API_URL`  | `http://localhost:3000/schema`       | URL of the FormSync Schema API      |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Express Server (:3002)               │
│  POST /generate                                       │
│      ↓                                                │
│  SchemaMapper  →  InternalSchema                      │
│      ↓                                                │
│  SpringBootGenerator                                  │
│      ├── TemplateService (Handlebars)                 │
│      │     ├── pom.hbs                                │
│      │     ├── application-yml.hbs                    │
│      │     ├── java/application.hbs                   │
│      │     ├── java/entity.hbs          (validations) │
│      │     ├── java/dto-request.hbs     (validations) │
│      │     ├── java/dto-response.hbs                  │
│      │     ├── java/repository.hbs                    │
│      │     ├── java/service.hbs         (DTO mapping) │
│      │     ├── java/controller.hbs      (@Valid)      │
│      │     ├── java/exception-handler.hbs             │
│      │     ├── java/not-found-exception.hbs           │
│      │     └── java/api-error.hbs                     │
│      └── FileWriter → temp directory                  │
│      ↓                                                │
│  ZipService → response (zip or JSON preview)          │
└──────────────────────────────────────────────────────┘
```
