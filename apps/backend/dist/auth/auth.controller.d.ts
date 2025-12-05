import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    private setCookies;
    register(registerDto: RegisterDto, res: Response): Promise<{
        success: boolean;
        data: {
            user: any;
        };
    }>;
    login(loginDto: LoginDto, res: Response): Promise<{
        success: boolean;
        data: {
            user: any;
        };
    }>;
    logout(res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    refresh(user: any, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(user: any): Promise<{
        success: boolean;
        data: any;
    }>;
}
