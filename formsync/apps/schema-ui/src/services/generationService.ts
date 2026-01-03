/**
 * API Service for Code Generation
 */

const API_BASE_URL = 'http://localhost:3000/api';

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

export const generationService = {
  /**
   * Generate all code from validated schema
   */
  async generateAll(validatedSchema: any): Promise<GenerateResponse> {
    try {
      // Use backend-dto-generator service
      const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: validatedSchema,
          preview: true
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Download generated code as ZIP
   */
  async downloadZip(validatedSchema: any, filename: string = 'generated-project'): Promise<void> {
    try {
      const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: validatedSchema,
          preview: false // Request ZIP download
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle Blob download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  /**
   * Mock generation for development/testing
   */
  async generateMock(): Promise<GenerateResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

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
