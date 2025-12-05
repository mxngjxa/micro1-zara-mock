import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export interface JwtPayload {
    sub: string;
    email: string;
}
export interface AuthTokens {
    access_token: string;
    refresh_token: string;
}
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        user: any;
        tokens: AuthTokens;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: any;
        tokens: AuthTokens;
    }>;
    refreshTokens(userId: string): Promise<AuthTokens>;
    validateUser(userId: string): Promise<any>;
    private generateTokens;
}
