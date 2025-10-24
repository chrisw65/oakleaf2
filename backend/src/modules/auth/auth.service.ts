import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { TenantService } from '../tenant/tenant.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, TokenResponse } from './interfaces/jwt-payload.interface';
import { User, UserRole } from '../user/user.entity';
import { TenantPlan } from '../tenant/tenant.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tenantService: TenantService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string, tenantId?: string): Promise<any> {
    const user = await this.userService.findByEmailWithPassword(email, tenantId);

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is not active');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any, ip: string): Promise<TokenResponse> {
    // Update last login
    await this.userService.updateLastLogin(user.id, ip);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<TokenResponse> {
    let tenantId: string | undefined = undefined;

    // Create tenant if tenant name is provided (new tenant registration)
    if (registerDto.tenantName) {
      const tenant = await this.tenantService.create({
        name: registerDto.tenantName,
        subdomain: registerDto.subdomain,
        plan: TenantPlan.STARTER,
      });
      tenantId = tenant.id;
    }

    // Create user
    const user = await this.userService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
      tenantId,
      role: tenantId ? UserRole.ADMIN : UserRole.USER, // First user is admin
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    // TODO: Send verification email

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<Omit<TokenResponse, 'user'>> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.userService.findOne(payload.sub, payload.tenantId);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User | any): Promise<Omit<TokenResponse, 'user'>> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
