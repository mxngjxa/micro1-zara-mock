import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        data: {
            user: any;
            tokens: import("./auth.service").AuthTokens;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        data: {
            user: any;
            tokens: import("./auth.service").AuthTokens;
        };
    }>;
    refresh(user: any): Promise<{
        success: boolean;
        data: import("./auth.service").AuthTokens;
    }>;
    getProfile(user: any): Promise<{
        success: boolean;
        data: any;
    }>;
}
