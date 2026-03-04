import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "John Doe" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "strongPassword123", minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "strongPassword123" })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: "Jane Doe", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "jane@example.com", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: "oldPassword123" })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: "newPassword456", minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
