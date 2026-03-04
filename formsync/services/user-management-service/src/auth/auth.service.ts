import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user/user.service";
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email already in use");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.userService.create({
      email: dto.email,
      name: dto.name,
      password: passwordHash,
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const { password: _, ...safeUser } = user;
    return {
      access_token: accessToken,
      user: safeUser,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.userService.findByEmail(dto.email);
      if (existing && existing.id !== userId) {
        throw new ConflictException("Email already in use");
      }
    }
    const updated = await this.userService.update(userId, dto);
    const { password: _, ...safeUser } = updated;
    return safeUser;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException("User not found");

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) throw new BadRequestException("Current password is incorrect");

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.userService.update(userId, { password: hash });
    return { message: "Password updated successfully" };
  }
}
