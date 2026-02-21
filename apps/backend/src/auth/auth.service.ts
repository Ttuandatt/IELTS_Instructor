import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /* ───────── Register ───────── */
  async register(dto: RegisterDto) {
    // Check duplicate email
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password_hash,
        display_name: dto.display_name,
        role: dto.role || UserRole.learner,
        language: dto.language || 'vi',
        theme: dto.theme || 'light',
      },
    });

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitize(user),
      ...tokens,
    };
  }

  /* ───────── Login ───────── */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitize(user),
      ...tokens,
    };
  }

  /* ───────── Refresh ───────── */
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);

      return {
        user: this.sanitize(user),
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /* ───────── Profile ───────── */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitize(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return this.sanitize(user);
  }

  /* ───────── Helpers ───────── */
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtPayload: Record<string, unknown> = { ...payload };

    const accessExpiry = this.configService.get<string>('JWT_EXPIRY', '15m');
    const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d');

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessExpiry as any,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiry as any,
      }),
    ]);

    return { access_token, refresh_token };
  }

  private sanitize(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...rest } = user;
    return rest;
  }
}
