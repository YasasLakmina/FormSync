# Runtime Binding Validation Engine - Usage Guide

## Overview

The Runtime Binding Validation Engine is a powerful plugin that generates complete, production-ready **Spring Boot REST API projects** from XML schema definitions. It automatically creates controllers, DTOs with validation annotations, and all necessary configuration files packaged as a downloadable ZIP file.

## Features

- ✅ **Automatic Code Generation**: Generates complete Spring Boot Maven projects
- ✅ **REST API Controllers**: Full CRUD operations (Create, Read, Update, Delete)
- ✅ **Validation Annotations**: Maps XML constraints to Jakarta Bean Validation
- ✅ **Production Ready**: Includes all dependencies, configuration, and documentation
- ✅ **Zero Manual Coding**: From schema to running server in seconds
- ✅ **ZIP Download**: Complete project packaged and ready to extract

## API Endpoint

```
POST /api/runtime-binding-validator/generate
```

## Request Format

### Headers
```
Content-Type: application/json
```

### Request Body

The API accepts three input formats:

**1. FormSync JSON Schema (Recommended - New Format)**
```json
{
  "formSyncSchema": { ... },        // FormSync JSON schema (see below)
  "projectName": "MyProject",       // Optional: overrides form.name
  "packageName": "com.example.app"  // Optional: overrides backend.package
}
```

**2. XML Schema (Legacy)**
```json
{
  "xmlInput": "<Form>...</Form>",   // XML schema
  "projectName": "MyProject",       // Optional
  "packageName": "com.example.app"  // Optional
}
```

**3. JSON Schema (Advanced)**
```json
{
  "jsonSchema": { ... },            // JSON Schema Draft-7
  "projectName": "MyProject",       // Optional
  "packageName": "com.example.app"  // Optional
}
```

## FormSync JSON Schema Format (Recommended)

The FormSync JSON schema format provides the most control and flexibility:

### Structure

```json
{
  "form": {
    "name": "FormName",              // Required: Project name
    "version": "1.0.0",              // Optional: Version
    "submitEndpoint": "/api/endpoint", // Optional: API endpoint path
    "method": "POST"                 // Optional: HTTP method
  },
  "fields": [                        // Required: Array of fields
    {
      "name": "fieldName",           // Required: Field name
      "type": "string",              // Required: Field type
      "required": true,              // Required: Is field required?
      "validation": {                // Optional: Validation rules
        "email": true,
        "minLength": 2,
        "maxLength": 100,
        "pattern": "^[A-Z].*$",
        "min": 0,
        "max": 100
      },
      "ui": {                        // Optional: UI metadata
        "label": "Field Label",
        "placeholder": "Placeholder text",
        "type": "password"
      }
    }
  ],
  "backend": {                       // Required: Backend configuration
    "package": "com.example.myapp",  // Required: Java package name
   "controller": {                  // Optional: Controller config
      "name": "MyController"
    },
    "dto": {                         // Optional: DTO config
      "name": "MyDto"
    }
  },
  "frontend": {                      // Optional: Frontend config (for future use)
    "framework": "react",
    "formLibrary": "formik"
  }
}
```

### Field Types

| FormSync Type | Java Type | Description |
|---------------|-----------|-------------|
| `string` | `String` | Text data |
| `number` | `Double` | Decimal numbers |
| `integer` | `Integer` | Whole numbers |
| `boolean` | `Boolean` | True/false values |

### Validation Rules

| Rule | Type | Description | Jakarta Annotation |
|------|------|-------------|-------------------|
| `email` | boolean | Must be valid email | `@Email` |
| `minLength` | number | Minimum string length | `@Size(min=...)` |
| `maxLength` | number | Maximum string length | `@Size(max=...)` |
| `pattern` | string | Regular expression | `@Pattern(regexp=...)` |
| `min` | number | Minimum numeric value | `@Min(...)` |
| `max` | number | Maximum numeric value | `@Max(...)` |
| `required` | boolean | Field is required | `@NotNull` / `@NotBlank` |

### Complete Example

```json
{
  "formSyncSchema": {
    "form": {
      "name": "UserRegistration",
      "version": "1.0.0",
      "submitEndpoint": "/api/users/register",
      "method": "POST"
    },
    "fields": [
      {
        "name": "email",
        "type": "string",
        "required": true,
        "validation": {
          "email": true,
          "maxLength": 100
        },
        "ui": {
          "label": "Email Address",
          "placeholder": "user@example.com"
        }
      },
      {
        "name": "password",
        "type": "string",
        "required": true,
        "validation": {
          "minLength": 8,
          "maxLength": 32,
          "pattern": "^(?=.*[A-Z])(?=.*\\d).*$"
        },
        "ui": {
          "label": "Password",
          "type": "password"
        }
      },
      {
        "name": "age",
        "type": "number",
        "required": false,
        "validation": {
          "min": 18,
          "max": 99
        },
        "ui": {
          "label": "Age"
        }
      }
    ],
    "backend": {
      "package": "com.example.user",
      "controller": {
        "name": "UserController"
      },
      "dto": {
        "name": "UserRegistrationRequest"
      }
    },
    "frontend": {
      "framework": "react",
      "formLibrary": "formik"
    }
  }
}
```

This will generate:
- Package: `com.example.user`
- DTO Class: `UserRegistrationRequestDto.java`
- Controller: `UserController.java`
- Endpoints at: `/api/userregistrationrequest`

## XML Schema Format (Legacy)

The XML schema should follow this structure:

```xml
<Form>
  <Title>Form Name</Title>
  <Field name="fieldName" type="fieldType" required="true|false">
    <Label>Field Label</Label>
    <!-- Validation constraints -->
    <MinLength>2</MinLength>
    <MaxLength>50</MaxLength>
    <Min>1</Min>
    <Max>100</Max>
  </Field>
</Form>
```

### Supported Field Types

| XML Type | Java Type | Validations |
|----------|-----------|-------------|
| `text` | `String` | `@Size`, `@NotBlank` |
| `email` | `String` | `@Email`, `@NotBlank` |
| `password` | `String` | `@Size`, `@NotBlank` |
| `number` | `Double` | `@Min`, `@Max`, `@NotNull` |
| `integer` | `Integer` | `@Min`, `@Max`, `@NotNull` |

### Validation Constraints

| XML Element | Jakarta Validation | Description |
|-------------|-------------------|-------------|
| `required="true"` | `@NotNull` / `@NotBlank` | Field is required |
| `<MinLength>` | `@Size(min=...)` | Minimum string length |
| `<MaxLength>` | `@Size(max=...)` | Maximum string length |
| `<Min>` | `@Min(...)` | Minimum numeric value |
| `<Max>` | `@Max(...)` | Maximum numeric value |
| `type="email"` | `@Email` | Email format validation |

## Usage Examples

### Example 1: Using FormSync JSON Schema (Recommended)

**Using Postman:**
1. **Create POST Request**
   - URL: `http://localhost:3000/api/runtime-binding-validator/generate`
   - Method: `POST`
   - Headers: `Content-Type: application/json`

2. **Request Body**
```json
{
  "formSyncSchema": {
    "form": {
      "name": "UserRegistration",
      "version": "1.0.0"
    },
    "fields": [
      {
        "name": "email",
        "type": "string",
        "required": true,
        "validation": {
          "email": true,
          "maxLength": 100
        },
        "ui": {
          "label": "Email Address"
        }
      },
      {
        "name": "password",
        "type": "string",
        "required": true,
        "validation": {
          "minLength": 8,
          "maxLength": 32
        },
        "ui": {
          "label": "Password",
          "type": "password"
        }
      },
      {
        "name": "age",
        "type": "number",
        "required": false,
        "validation": {
          "min": 18,
          "max": 99
        },
        "ui": {
          "label": "Age"
        }
      }
    ],
    "backend": {
      "package": "com.example.user",
      "controller": {
        "name": "UserController"
      },
      "dto": {
        "name": "UserRegistrationRequest"
      }
    }
  }
}
```

3. **Download Response**
   - Click "Send and Download"
   - Save as `UserRegistration.zip`

### Example 2: Using XML Schema (Legacy)

1. **Create POST Request**
   - URL: `http://localhost:3000/api/runtime-binding-validator/generate`
   - Method: `POST`
   - Headers: `Content-Type: application/json`

2. **Request Body**
```json
{
  "xmlInput": "<Form>\n  <Title>User Registration</Title>\n  <Field name=\"firstName\" type=\"text\" required=\"true\">\n    <Label>First Name</Label>\n    <MinLength>2</MinLength>\n    <MaxLength>50</MaxLength>\n  </Field>\n  <Field name=\"email\" type=\"email\" required=\"true\">\n    <Label>Email Address</Label>\n  </Field>\n  <Field name=\"age\" type=\"number\" required=\"false\">\n    <Label>Age</Label>\n    <Min>18</Min>\n    <Max>120</Max>\n  </Field>\n</Form>",
  "projectName": "UserRegistration"
}
```

3. **Download Response**
   - Click "Send and Download"
   - Save as `UserRegistration.zip`

### Example 3: Using cURL with FormSync JSON

```bash
curl -X POST http://localhost:3000/api/runtime-binding-validator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "xmlInput": "<Form><Title>Product</Title><Field name=\"productName\" type=\"text\" required=\"true\"><MinLength>3</MinLength></Field></Form>",
    "projectName": "ProductAPI"
  }' \
  -o ProductAPI.zip
```

### Example 3: Using PowerShell

```powershell
$xml = Get-Content -Path "schema.xml" -Raw
$body = @{
    xmlInput = $xml
    projectName = "MyProject"
    packageName = "com.mycompany.app"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:3000/api/runtime-binding-validator/generate" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -OutFile "MyProject.zip"
```

## Generated Project Structure

```
ProjectName/
├── src/main/java/com/formsync/generated/
│   ├── Application.java              # Main Spring Boot class
│   ├── controller/
│   │   └── ResourceController.java   # REST controller with CRUD
│   └── dto/
│       └── ResourceDto.java          # DTO with validation
├── src/main/resources/
│   └── application.properties        # Configuration
├── pom.xml                           # Maven dependencies
├── .gitignore                        # Git ignore rules
└── README.md                         # Instructions
```

## Generated REST Endpoints

For a resource named "User", the generated controller provides:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/user` | Create new user (validated) |
| `GET` | `/api/user` | Get all users |
| `GET` | `/api/user/{id}` | Get user by ID |
| `PUT` | `/api/user/{id}` | Update user (validated) |
| `DELETE` | `/api/user/{id}` | Delete user |

## Running the Generated Project

1. **Extract the ZIP**
```bash
unzip UserRegistration.zip
cd UserRegistration
```

2. **Prerequisites**
   - Java 17 or higher
   - Maven 3.6 or higher

3. **Run the Application**
```bash
mvn spring-boot:run
```

4. **Server starts on**
```
http://localhost:8080
```

## Testing Generated APIs

### Create a Resource
```bash
curl -X POST http://localhost:8080/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "email": "john@example.com",
    "age": 25
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "data": {
    "firstName": "John",
    "email": "john@example.com",
    "age": 25
  },
  "message": "User created successfully"
}
```

### Validation Error Example
```bash
curl -X POST http://localhost:8080/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "J",
    "email": "invalid-email"
  }'
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "validationErrors": {
    "firstName": "firstName must be between 2 and 50 characters",
    "email": "email must be a valid email address"
  }
}
```

## Dependencies Included

The generated project includes:

- **Spring Boot 3.2.0**
  - spring-boot-starter-web
  - spring-boot-starter-validation
- **Lombok** - Reduces boilerplate code
- **Jakarta Validation** - Bean validation
- **Maven** - Build tool

## Customization

After generation, you can customize:

1. **Package Name**: Change via `packageName` in request
2. **Port**: Edit `application.properties` → `server.port`
3. **Database**: Add JPA dependencies and entities
4. **Security**: Add Spring Security
5. **Additional Endpoints**: Extend the generated controllers

## Error Handling

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | "Either xmlInput, jsonSchema, or formSyncSchema must be provided" | Include one of the three input formats in request |
| 400 | "Unable to parse XML input" | Check XML syntax |
| 500 | "Spring Boot generator plugin not found" | Restart server, check plugin registration |

## Architecture

### Plugin Architecture
```
RuntimeBindingValidatorController
    ↓
LocalPluginRegistry.getRuntimeGenerator('springboot-generator')
    ↓
SpringBootGeneratorPlugin
    ↓
┌─────────────────────────┬──────────────────────┬────────────────────┐
│ SpringBootScaffoldService│ DtoGeneratorService  │ ControllerGenerator│
└─────────────────────────┴──────────────────────┴────────────────────┘
    ↓
ZipGeneratorService → ZIP Download
```

### Services

- **SpringBootScaffoldService**: Generates pom.xml, application.properties, main class
- **DtoGeneratorService**: Creates Java DTOs with validation annotations
- **ControllerGeneratorService**: Generates REST controllers with CRUD operations
- **ZipGeneratorService**: Packages everything into a downloadable ZIP

## Best Practices

1. **Use Descriptive Names**: Set meaningful `projectName` values
2. **Validate XML First**: Test your XML schema before generating
3. **Check Port Availability**: Ensure port 8080 is free for generated apps
4. **Version Control**: Commit generated projects to Git for tracking
5. **Extend, Don't Edit**: Add new files instead of modifying generated code

## Limitations

- **In-Memory Storage**: Generated apps use ConcurrentHashMap (not persistent)
- **Single Entity**: One DTO/Controller per generation
- **No Relationships**: Doesn't support foreign keys or relations
- **Basic Types**: Limited to String, Integer, Double, Boolean

## Future Enhancements

- Database integration (JPA/Hibernate)
- Multiple entity support
- Authentication/Authorization
- Custom validation rules
- GraphQL support
- Docker containerization

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify XML schema format
3. Ensure all services are running (Redis, PostgreSQL)
4. Review generated README.md in downloaded project

---

**Generated by FormSync - Component 1: Intelligent Schema Definition & AI Integration**
