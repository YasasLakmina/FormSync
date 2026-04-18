/**
 * API Service for Code Generation
 */

// const API_BASE_URL = 'http://localhost:3000/api';

export type BackendLanguage = "nodeExpress" | "springBoot" | "dotnetWebApi";

export interface GenerateRequest {
  schema: any;
  validatedSchema?: any;
}

export interface GenerateResponse {
  success: boolean;
  data?: {
    frontend: string;
    backend: string;
    dtos: string;
    tests: string;
  };
  error?: string;
}

const API_GATEWAY_URL = import.meta.env.VITE_API_URL || "";

export const generationService = {
  /**
   * Generate all code from validated schema
   */
  async generateAll(validatedSchema: any): Promise<GenerateResponse> {
    // Extract content if the schema is a DB record wrapper
    const actualSchema = validatedSchema.content || validatedSchema;
    // Generate code client-side from the schema (no external service required)
    return this.generateFromSchema(actualSchema);
  },

  /**
   * Download a complete Spring Boot backend (with test cases) as a ZIP file
   * from the runtime-binding-engine via the API gateway.
   */
  async downloadBackendZip(
    schema: any,
    filename?: string,
    backendLanguage: BackendLanguage = "springBoot",
  ): Promise<void> {
    // Extract content if the schema is a DB record wrapper
    const actualSchema = schema.content || schema;

    const endpoint =
      backendLanguage === "dotnetWebApi"
        ? `${API_GATEWAY_URL}/dotnet-backend/generate`
        : `${API_GATEWAY_URL}/runtime/generate`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema: actualSchema }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody?.error || `Backend generation failed (${response.status})`,
      );
    }

    // Response is a ZIP binary — trigger browser download
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      filename ||
      (backendLanguage === "nodeExpress"
        ? "node-express-backend.zip"
        : backendLanguage === "dotnetWebApi"
          ? "dotnet-webapi-server.zip"
          : "springboot-server.zip");
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Download a fullstack ZIP containing generated frontend + selected backend.
   */
  async downloadFullstackZip(
    formModel: any | undefined,
    schema: any,
    backendLanguage: BackendLanguage = "springBoot",
  ): Promise<void> {
    const response = await fetch(
      `${API_GATEWAY_URL}/bundle/generate-fullstack`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formModel, schema, backendLanguage }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody?.error ||
          `Fullstack bundle generation failed (${response.status})`,
      );
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const rawSchema = schema?.content || schema;
    const schemaTitle =
      (rawSchema?.title as string) || schema?.name || "Generated Form";
    const schemaSlug = String(schemaTitle)
      .toLowerCase()
      .replace(/\s+/g, "-");
    const frontendSlug = "react";
    a.download = `${schemaSlug}_fullstack-${frontendSlug}_${backendLanguage}.zip`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  generateFromSchema(schema: any): GenerateResponse {
    const props: Record<string, any> = schema?.properties || {};
    const title = (schema?.title as string) || "GeneratedForm";
    const componentName = title.replace(/\s+/g, "");
    const fields = Object.entries(props);

    // --- Frontend React component ---
    const tsInterface = fields
      .map(([k, v]: [string, any]) => {
        const t =
          v.type === "integer" || v.type === "number"
            ? "number"
            : v.type === "boolean"
              ? "boolean"
              : v.type === "array"
                ? "string[]"
                : "string";
        return `  ${k}: ${t};`;
      })
      .join("\n");

    const formInputs = fields
      .map(([k, v]: [string, any]) => {
        const label = (v.title as string) || k;
        if (v.enum) {
          const opts = (v.enum as string[])
            .map((o) => `          <option value="${o}">${o}</option>`)
            .join("\n");
          return `      <div>\n        <label>${label}</label>\n        <select {...register('${k}')}>${opts}\n        </select>\n      </div>`;
        }
        const inputType =
          v.type === "integer" || v.type === "number"
            ? "number"
            : v.type === "boolean"
              ? "checkbox"
              : "text";
        return `      <div>\n        <label>${label}</label>\n        <input type="${inputType}" {...register('${k}')} />\n      </div>`;
      })
      .join("\n");

    const frontend = `import React from 'react';\nimport { useForm } from 'react-hook-form';\n\ninterface ${componentName}Data {\n${tsInterface}\n}\n\nexport const ${componentName}: React.FC = () => {\n  const { register, handleSubmit } = useForm<${componentName}Data>();\n\n  const onSubmit = (data: ${componentName}Data) => {\n    console.log(data);\n  };\n\n  return (\n    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">\n${formInputs}\n      <button type="submit">Submit</button>\n    </form>\n  );\n};`;

    // --- Backend NestJS controller ---
    const backend = `import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';\nimport { Create${componentName}Dto } from './dto/${componentName.toLowerCase()}.dto';\nimport { ${componentName}Service } from './${componentName.toLowerCase()}.service';\n\n@Controller('${componentName.toLowerCase()}')\nexport class ${componentName}Controller {\n  constructor(private readonly service: ${componentName}Service) {}\n\n  @Post()\n  create(@Body() dto: Create${componentName}Dto) {\n    return this.service.create(dto);\n  }\n\n  @Get()\n  findAll() {\n    return this.service.findAll();\n  }\n\n  @Get(':id')\n  findOne(@Param('id') id: string) {\n    return this.service.findOne(id);\n  }\n\n  @Put(':id')\n  update(@Param('id') id: string, @Body() dto: Create${componentName}Dto) {\n    return this.service.update(id, dto);\n  }\n\n  @Delete(':id')\n  remove(@Param('id') id: string) {\n    return this.service.remove(id);\n  }\n}`;

    // --- DTOs ---
    const dtoDecorators = fields
      .map(([k, v]: [string, any]) => {
        const required = ((schema?.required as string[]) || []).includes(k);
        const lines: string[] = [];
        if (v.type === "string" && !v.enum) lines.push("  @IsString()");
        if (v.enum)
          lines.push(
            "  @IsIn([" +
              (v.enum as string[]).map((e: string) => `'${e}'`).join(", ") +
              "])",
          );
        if (v.type === "integer" || v.type === "number")
          lines.push("  @IsNumber()");
        if (v.type === "boolean") lines.push("  @IsBoolean()");
        if (required) lines.push("  @IsNotEmpty()");
        else lines.push("  @IsOptional()");
        const tsType =
          v.type === "integer" || v.type === "number"
            ? "number"
            : v.type === "boolean"
              ? "boolean"
              : v.type === "array"
                ? "string[]"
                : "string";
        lines.push(`  ${k}${required ? "" : "?"}: ${tsType};`);
        return lines.join("\n");
      })
      .join("\n\n");

    const dtos = `import { IsString, IsNumber, IsBoolean, IsIn, IsNotEmpty, IsOptional } from 'class-validator';\n\nexport class Create${componentName}Dto {\n${dtoDecorators}\n}`;

    // --- Tests ---
    const tests = `import { describe, it, expect } from 'vitest';\nimport { render, screen } from '@testing-library/react';\nimport { ${componentName} } from '../${componentName}';\n\ndescribe('${componentName}', () => {\n  it('renders the form', () => {\n    render(<${componentName} />);\n    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();\n  });\n\n${fields.map(([k, v]: [string, any]) => `  it('renders ${(v.title as string) || k} field', () => {\n    render(<${componentName} />);\n    expect(screen.getByText('${(v.title as string) || k}')).toBeInTheDocument();\n  });`).join("\n\n")}\n});`;

    return { success: true, data: { frontend, backend, dtos, tests } };
  },

  /**
   * Download generated code as ZIP
   */
  async downloadZip(
    validatedSchema: any,
    _filename: string = "generated-project",
  ): Promise<void> {
    // Extract content if the schema is a DB record wrapper
    const actualSchema = validatedSchema.content || validatedSchema;
    // Generate client-side and download as individual files (no ZIP service needed)
    const result = this.generateFromSchema(actualSchema);
    if (!result.success || !result.data) throw new Error("Generation failed");

    const files: { name: string; content: string }[] = [
      { name: "UserForm.tsx", content: result.data.frontend },
      { name: "UserController.ts", content: result.data.backend },
      { name: "user.dto.ts", content: result.data.dtos },
      { name: "UserForm.test.tsx", content: result.data.tests },
    ];

    files.forEach(({ name, content }) => {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  },

  /**
   * Mock generation for development/testing
   */
  async generateMock(): Promise<GenerateResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      data: {
        frontend: `// Frontend Form Component
import React from 'react';
import { useForm } from 'react-hook-form';

interface UserFormData {
  name: string;
  email: string;
  age: number;
}

export const UserForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>();

  const onSubmit = (data: UserFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input 
          {...register('name', { required: 'Name is required' })}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.name && <span className="text-red-600 text-sm">{errors.name.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input 
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^\\S+@\\S+$/i,
              message: 'Invalid email address'
            }
          })}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.email && <span className="text-red-600 text-sm">{errors.email.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Age</label>
        <input 
          type="number"
          {...register('age', { 
            min: { value: 0, message: 'Age must be positive' },
            max: { value: 120, message: 'Age must be less than 120' }
          })}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.age && <span className="text-red-600 text-sm">{errors.age.message}</span>}
      </div>

      <button 
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
};`,
        backend: `// Backend API Controller
import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { UserDto, UpdateUserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: UserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return {
      success: true,
      message: 'User found',
      data: user,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}`,
        dtos: `// Data Transfer Objects with Validation
import { 
  IsString, 
  IsEmail, 
  IsNumber, 
  Min, 
  Max, 
  IsNotEmpty,
  IsOptional 
} from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNumber()
  @Min(0, { message: 'Age must be positive' })
  @Max(120, { message: 'Age must be less than 120' })
  age: number;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @Min(0)
  @Max(120)
  @IsOptional()
  age?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}`,
        tests: `// Test Cases for User Form
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from '../UserForm';

describe('UserForm Component', () => {
  beforeEach(() => {
    render(<UserForm />);
  });

  it('renders all form fields', () => {
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('validates age range', async () => {
    const ageInput = screen.getByLabelText(/age/i);
    
    // Test negative age
    await userEvent.type(ageInput, '-5');
    fireEvent.blur(ageInput);
    await waitFor(() => {
      expect(screen.getByText(/age must be positive/i)).toBeInTheDocument();
    });

    // Test age over 120
    await userEvent.clear(ageInput);
    await userEvent.type(ageInput, '150');
    fireEvent.blur(ageInput);
    await waitFor(() => {
      expect(screen.getByText(/age must be less than 120/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/age/i), '25');
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      });
    });

    consoleSpy.mockRestore();
  });
});`,
      },
    };
  },
};
