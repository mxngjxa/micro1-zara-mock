# **PHASE 1: AUTHENTICATION & LIVEKIT FOUNDATION**

## **High-Level Overview**

**Objective**: Implement secure JWT-based authentication and establish LiveKit infrastructure for voice communication. This phase bridges the foundation from Phase 0 with the voice AI capabilities needed for Phase 2.

**Focus Areas**:
- JWT-based authentication with email verification
- Protected routes and authorization middleware
- LiveKit Cloud setup and token generation
- Basic LiveKit room management
- Frontend authentication UI and state management
- LiveKit React components integration

**Key Architectural Decision**: Authentication comes before voice features because LiveKit rooms must be associated with authenticated users, and all interview sessions require user identity.

***

## **PROMPT 1: BACKEND ENGINEER (Authentication & LiveKit Services)**

### **Objective**
Implement complete authentication system with JWT tokens, password hashing, and email verification. Set up LiveKit integration for token generation and room management. **No AI integration yet** - focus on secure auth and LiveKit infrastructure.

### **Project Context**
You're building the authentication layer and LiveKit integration for a voice-based AI interview platform. Users must authenticate before starting interviews. Each interview session requires a LiveKit room with proper access tokens. The LiveKit Agent (Python) will be implemented in Phase 2.

### **Required Technologies**
- **Auth**: bcrypt for password hashing, @nestjs/jwt for token generation, @nestjs/passport with JWT strategy
- **LiveKit**: livekit-server-sdk for token generation and room management
- **Validation**: class-validator, class-transformer for DTO validation
- **Email**: @nestjs-modules/mailer (optional for Phase 1, can use console logging)

***

### **TASK 1: Install Dependencies**

THE FOLLOWING COMMANDS WERE ALREADY EXECUTED. 

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install livekit-server-sdk
npm install @types/passport-jwt @types/bcrypt --save-dev
```

***

### **TASK 2: Environment Configuration**

Update `.env.example` and `.env`:
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-256-bits
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRATION=7d

# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Application
FRONTEND_URL=http://localhost:3001
```

Update `config/app.config.ts` validation schema:
```typescript
validationSchema: Joi.object({
  // ... existing validation
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRATION: Joi.string().default('24h'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  LIVEKIT_URL: Joi.string().uri().required(),
  LIVEKIT_API_KEY: Joi.string().required(),
  LIVEKIT_API_SECRET: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required()
})
```

***

### **TASK 3: Create Auth Module Structure**

```
/apps/backend/src
  /auth
    /dto
      register.dto.ts
      login.dto.ts
      refresh-token.dto.ts
    /guards
      jwt-auth.guard.ts
      jwt-refresh.guard.ts
    /strategies
      jwt.strategy.ts
      jwt-refresh.strategy.ts
    /decorators
      public.decorator.ts
      current-user.decorator.ts
    auth.controller.ts
    auth.service.ts
    auth.module.ts
  /users
    users.service.ts
    users.module.ts
  /livekit
    /dto
      create-room.dto.ts
      get-token.dto.ts
    livekit.service.ts
    livekit.controller.ts
    livekit.module.ts
```

***

### **TASK 4: Implement DTOs with Validation**

**auth/dto/register.dto.ts**:

sample script:

```typescript
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and number/special character'
  })
  password: string;
}
```

**auth/dto/login.dto.ts**:

sample script:

```typescript
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
```

**auth/dto/refresh-token.dto.ts**:

sample script:

```typescript
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
```

***

### **TASK 5: Implement Users Service**

**users/users.service.ts**:

sample script:

```typescript
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(email: string, password: string): Promise<User> {
    // Check if user exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password (10 rounds)
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      email,
      password_hash,
      email_verified: false, // Will implement verification later
      verification_token: null // Generate token if email verification is implemented
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { last_login: new Date() });
  }
}
```

**users/users.module.ts**:

sample script:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
```

***

### **TASK 6: Implement Auth Service**

**auth/auth.service.ts**:

sample script:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await this.usersService.create(registerDto.email, registerDto.password);
    const tokens = await this.generateTokens(user.id, user.email);

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async login(loginDto: LoginDto): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(user, loginDto.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user.id, user.email);

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async refreshTokens(userId: string): Promise<AuthTokens> {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateTokens(user.id, user.email);
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async generateTokens(userId: string, email: string): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION')
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION')
      })
    ]);

    return { access_token, refresh_token };
  }
}
```

***

### **TASK 7: Implement JWT Strategies**

**auth/strategies/jwt.strategy.ts**:

sample script:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    return user; // Attached to request.user
  }
}
```

**auth/strategies/jwt-refresh.strategy.ts**:

sample script:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET')
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

***

### **TASK 8: Implement Guards and Decorators**

**auth/guards/jwt-auth.guard.ts**:

sample script:

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

**auth/guards/jwt-refresh.guard.ts**:

sample script:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
```

**auth/decorators/public.decorator.ts**:
```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**auth/decorators/current-user.decorator.ts**:
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
```

***

### **TASK 9: Implement Auth Controller**

**auth/auth.controller.ts**:

sample script:

```typescript
import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      data: result
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result
    };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @CurrentUser() user: any) {
    const tokens = await this.authService.refreshTokens(user.userId);
    return {
      success: true,
      data: tokens
    };
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return {
      success: true,
      data: user
    };
  }
}
```

***

### **TASK 10: Configure Auth Module**

**auth/auth.module.ts**:

sample script:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}) // Configuration done in strategies
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService]
})
export class AuthModule {}
```

***

### **TASK 11: Apply Global JWT Guard**

sample script:


Update `main.ts`:
```typescript
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestApplication.create(AppModule);
  
  // ... existing middleware
  
  // Global JWT guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  
  await app.listen(3000);
}
```

***

### **TASK 12: Implement LiveKit Service**

**livekit/livekit.service.ts**:

sample script:

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient, Room } from 'livekit-server-sdk';

export interface LiveKitTokenOptions {
  roomName: string;
  participantName: string;
  participantId: string;
}

@Injectable()
export class LiveKitService {
  private roomService: RoomServiceClient;
  private apiKey: string;
  private apiSecret: string;
  private livekitUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('LIVEKIT_API_KEY');
    this.apiSecret = this.configService.get('LIVEKIT_API_SECRET');
    this.livekitUrl = this.configService.get('LIVEKIT_URL');

    this.roomService = new RoomServiceClient(
      this.livekitUrl,
      this.apiKey,
      this.apiSecret
    );
  }

  async generateToken(options: LiveKitTokenOptions): Promise<string> {
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity: options.participantId,
      name: options.participantName,
      ttl: '1h' // Token valid for 1 hour
    });

    token.addGrant({
      roomJoin: true,
      room: options.roomName,
      canPublish: true,
      canSubscribe: true
    });

    return token.toJwt();
  }

  async createRoom(roomName: string, emptyTimeout: number = 300): Promise<Room> {
    try {
      const room = await this.roomService.createRoom({
        name: roomName,
        emptyTimeout: emptyTimeout, // 5 minutes
        maxParticipants: 2 // User + Agent
      });

      return room;
    } catch (error) {
      throw new BadRequestException(`Failed to create room: ${error.message}`);
    }
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.roomService.deleteRoom(roomName);
    } catch (error) {
      // Room might not exist, log but don't throw
      console.error(`Failed to delete room ${roomName}:`, error.message);
    }
  }

  async listRooms(): Promise<Room[]> {
    const rooms = await this.roomService.listRooms();
    return rooms;
  }

  async getRoomInfo(roomName: string): Promise<Room | null> {
    try {
      const rooms = await this.roomService.listRooms([roomName]);
      return rooms.length > 0 ? rooms[0] : null;
    } catch (error) {
      return null;
    }
  }

  getLiveKitUrl(): string {
    return this.livekitUrl;
  }
}
```

***

### **TASK 13: Implement LiveKit DTOs**

**livekit/dto/create-room.dto.ts**:

sample script:

```typescript
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'interview-123' })
  @IsString()
  roomName: string;

  @ApiProperty({ example: 300, description: 'Empty timeout in seconds', required: false })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  emptyTimeout?: number;
}
```

**livekit/dto/get-token.dto.ts**:
```typescript
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTokenDto {
  @ApiProperty({ example: 'interview-123' })
  @IsString()
  roomName: string;
}
```

***

### **TASK 14: Implement LiveKit Controller**

**livekit/livekit.controller.ts**:

sample script:

```typescript
import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LiveKitService } from './livekit.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { GetTokenDto } from './dto/get-token.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('LiveKit')
@ApiBearerAuth()
@Controller('livekit')
export class LiveKitController {
  constructor(private livekitService: LiveKitService) {}

  @Post('token')
  @ApiOperation({ summary: 'Generate LiveKit access token' })
  async getToken(@Body() getTokenDto: GetTokenDto, @CurrentUser() user: any) {
    const token = await this.livekitService.generateToken({
      roomName: getTokenDto.roomName,
      participantName: user.email,
      participantId: user.id
    });

    return {
      success: true,
      data: {
        token,
        url: this.livekitService.getLiveKitUrl()
      }
    };
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create LiveKit room' })
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    const room = await this.livekitService.createRoom(
      createRoomDto.roomName,
      createRoomDto.emptyTimeout
    );

    return {
      success: true,
      data: room
    };
  }

  @Get('rooms')
  @ApiOperation({ summary: 'List all active rooms' })
  async listRooms() {
    const rooms = await this.livekitService.listRooms();

    return {
      success: true,
      data: rooms
    };
  }

  @Get('rooms/:roomName')
  @ApiOperation({ summary: 'Get room information' })
  async getRoomInfo(@Param('roomName') roomName: string) {
    const room = await this.livekitService.getRoomInfo(roomName);

    return {
      success: true,
      data: room
    };
  }

  @Delete('rooms/:roomName')
  @ApiOperation({ summary: 'Delete LiveKit room' })
  async deleteRoom(@Param('roomName') roomName: string) {
    await this.livekitService.deleteRoom(roomName);

    return {
      success: true,
      message: `Room ${roomName} deleted`
    };
  }
}
```

***

### **TASK 15: Configure LiveKit Module**

**livekit/livekit.module.ts**:

sample script:

```typescript
import { Module } from '@nestjs/common';
import { LiveKitService } from './livekit.service';
import { LiveKitController } from './livekit.controller';

@Module({
  providers: [LiveKitService],
  controllers: [LiveKitController],
  exports: [LiveKitService]
})
export class LiveKitModule {}
```

Update `app.module.ts`:
```typescript
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LiveKitModule } from './livekit/livekit.module';

@Module({
  imports: [
    // ... existing imports
    AuthModule,
    UsersModule,
    LiveKitModule
  ]
})
```

***

### **TASK 16: Add Rate Limiting (Optional but Recommended)**

THE FOLLOWING COMMAND WAS ALREADY EXECUTED

```bash
npm install @nestjs/throttler
```

Update `app.module.ts`:

sample script:


```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10 // 10 requests per minute
    }]),
    // ... other imports
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
```

Apply stricter rate limiting to auth endpoints in controller:

sample script:

```typescript
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
@Post('login')
```

***

### **Deliverables**

✓ JWT-based authentication with access and refresh tokens
✓ User registration with password hashing (bcrypt 10 rounds)
✓ Login with credential validation
✓ Token refresh mechanism
✓ Protected routes with @Public() decorator
✓ CurrentUser decorator for extracting user from JWT
✓ LiveKit token generation for authenticated users
✓ LiveKit room creation, listing, and deletion
✓ Rate limiting on auth endpoints
✓ Swagger documentation for all endpoints

***

### **Acceptance Criteria**

✓ POST `/auth/register` creates user and returns tokens
✓ POST `/auth/login` validates credentials and returns tokens
✓ POST `/auth/refresh` generates new access token from refresh token
✓ GET `/auth/me` returns current user with valid JWT
✓ POST `/livekit/token` generates valid LiveKit token
✓ POST `/livekit/rooms` creates LiveKit room
✓ All protected routes return 401 without valid JWT
✓ Password validation enforces complexity rules
✓ Duplicate email registration returns 409 Conflict
✓ Unit tests cover >80% of auth and LiveKit services
✓ Invalid JWT returns 401 with clear error message






























































# **PHASE 1: AUTHENTICATION & LIVEKIT FOUNDATION - FRONTEND (shadcn/ui Integration)**

## **PROMPT 2: FRONTEND ENGINEER (Authentication UI & LiveKit Components)**

### **Objective**
Implement complete authentication UI using **existing shadcn/ui components** with registration, login, and protected routes. Integrate LiveKit React components for voice communication. Set up state management for auth and prepare for interview sessions.

### **Project Context**
You're building the client-side authentication and LiveKit integration for a voice-based AI interview platform. The project **already has shadcn/ui components installed** (Button, Card, Input, Label, Alert). Users must register/login before accessing interview features. The interview session will use LiveKit React components for voice communication with the AI agent (implemented in Phase 2).

### **Current shadcn/ui Components Available**
Based on the repomix output, you have:
- `components/ui/button.tsx` - Button component with variants
- `components/ui/card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `components/ui/input.tsx` - Input component
- `components/ui/label.tsx` - Label component  
- `components/ui/alert.tsx` - Alert, AlertDescription (assumed from typical shadcn setup)

***

### **TASK 1: Install Dependencies**

```bash
# Navigate to frontend directory
cd apps/frontend

# Install required dependencies
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install @livekit/components-react livekit-client
npm install js-cookie
npm install @types/js-cookie --save-dev

# Install missing shadcn/ui components if needed
npx shadcn@latest add form
npx shadcn@latest add alert
npx shadcn@latest add badge
npx shadcn@latest add separator
# If you need these components later
npx shadcn@latest add skeleton    # For loading states
npx shadcn@latest add avatar      # For user profiles
npx shadcn@latest add dropdown-menu  # For nav menus
npx shadcn@latest add dialog      # For modals
npx shadcn@latest add toast       # For notifications
```

***

### **TASK 2: Create Shared Types**

Create **`types/auth.types.ts`**:

example script:

```typescript
export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  last_login: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}
```

Create **`types/livekit.types.ts`**:

example script:

```typescript
export interface LiveKitToken {
  token: string;
  url: string;
}

export interface LiveKitTokenResponse {
  success: boolean;
  data: LiveKitToken;
}
```

***

### **TASK 3: Configure API Client with Auth Interceptors**

Create **`lib/api-client.ts`**:

example script:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Refresh token
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { access_token, refresh_token } = data.data;

        // Update cookies
        Cookies.set('access_token', access_token, { expires: 1 }); // 1 day
        Cookies.set('refresh_token', refresh_token, { expires: 7 }); // 7 days

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

***

### **TASK 4: Create Auth Service**

Create **`lib/auth.service.ts`**:

example script:

```typescript
import { apiClient } from './api-client';
import Cookies from 'js-cookie';
import type { 
  RegisterPayload, 
  LoginPayload, 
  AuthResponse, 
  User 
} from '@/types/auth.types';

export class AuthService {
  static async register(payload: RegisterPayload): Promise<{ user: User; tokens: any }> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    
    // Store tokens in cookies
    Cookies.set('access_token', data.data.tokens.access_token, { expires: 1 });
    Cookies.set('refresh_token', data.data.tokens.refresh_token, { expires: 7 });
    
    return data.data;
  }

  static async login(payload: LoginPayload): Promise<{ user: User; tokens: any }> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    
    // Store tokens in cookies
    Cookies.set('access_token', data.data.tokens.access_token, { expires: 1 });
    Cookies.set('refresh_token', data.data.tokens.refresh_token, { expires: 7 });
    
    return data.data;
  }

  static async logout(): Promise<void> {
    // Clear tokens from cookies
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }

  static async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  }

  static isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  }

  static getAccessToken(): string | undefined {
    return Cookies.get('access_token');
  }
}
```

***

### **TASK 5: Create LiveKit Service**

Create **`lib/livekit.service.ts`**:

example script:

```typescript
import { apiClient } from './api-client';
import type { LiveKitTokenResponse } from '@/types/livekit.types';

export class LiveKitService {
  static async getToken(roomName: string): Promise<{ token: string; url: string }> {
    const { data } = await apiClient.post<LiveKitTokenResponse>('/livekit/token', {
      roomName
    });
    
    return data.data;
  }

  static async createRoom(roomName: string, emptyTimeout?: number): Promise<any> {
    const { data } = await apiClient.post('/livekit/rooms', {
      roomName,
      emptyTimeout
    });
    
    return data.data;
  }

  static async deleteRoom(roomName: string): Promise<void> {
    await apiClient.delete(`/livekit/rooms/${roomName}`);
  }
}
```

***

### **TASK 6: Create Auth Store with Zustand**

Create **`store/auth.store.ts`**:

example script:

```typescript
import { create } from 'zustand';
import { AuthService } from '@/lib/auth.service';
import type { User, RegisterPayload, LoginPayload } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (payload) => {
    set({ isLoading: true, error: null });
    
    try {
      const { user } = await AuthService.register(payload);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    
    try {
      const { user } = await AuthService.login(payload);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AuthService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    if (!AuthService.isAuthenticated()) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    
    try {
      const user = await AuthService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      await AuthService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null })
}));
```

***

### **TASK 7: Create Form Validation Schemas**

Create **`lib/validations/auth.schema.ts`**:

example script:

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W])/,
      'Password must contain uppercase, lowercase, and number/special character'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
```

***

### **TASK 8: Create Auth UI Components Using shadcn/ui**

Create **`app/register/page.tsx`**:

example script:

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    
    try {
      await registerUser({
        email: data.email,
        password: data.password
      });
      
      router.push('/dashboard');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Start your interview journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

Create **`app/login/page.tsx`**:

example script:

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    
    try {
      await login(data);
      router.push('/dashboard');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to continue your interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

***

### **TASK 9: Create Protected Route Component**

Create **`components/auth/protected-route.tsx`**:

example script:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

***

### **TASK 10: Create Dashboard Page with shadcn/ui**

Create **`app/dashboard/page.tsx`**:

example script:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function DashboardContent() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview Dashboard</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back! 👋</CardTitle>
            <CardDescription>
              Ready to start your AI interview practice?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="gap-2">
              <Clock className="h-5 w-5" />
              Start New Interview (Coming in Phase 2)
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                No interviews yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">
                Complete an interview to see your score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Finish your first interview
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interview sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No interviews yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Start your first AI interview to practice your skills and get personalized feedback
              </p>
              <Badge variant="secondary">Coming in Phase 2</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

***

### **TASK 11: Update Landing Page with shadcn/ui**

Update **`app/page.tsx`**:

example script:

```typescript
import Link from 'next/link';
import { Mic, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Interview</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight">
              Practice Interviews <br />
              <span className="text-primary">with AI</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Improve your interview skills with our voice-based AI interviewer.
              Get real-time feedback and detailed performance reports.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 gap-2">
                Start Your First Interview
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Voice-First Interface</CardTitle>
                <CardDescription>
                  Natural conversation with AI using advanced speech recognition
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Feedback</CardTitle>
                <CardDescription>
                  Get instant analysis and suggestions during your practice sessions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Detailed Reports</CardTitle>
                <CardDescription>
                  Comprehensive performance analysis with actionable insights
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 AI Interview Platform. Built with Next.js and LiveKit.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

***

### **TASK 12: Create LiveKit Test Page**

Create **`app/test-livekit/page.tsx`**:

example script:

```typescript
'use client';

import { useState } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { Mic, Phone, PhoneOff } from 'lucide-react';
import { LiveKitService } from '@/lib/livekit.service';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import '@livekit/components-styles';

function LiveKitTestContent() {
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!roomName) {
      alert('Please enter a room name');
      return;
    }

    setLoading(true);

    try {
      const { token: livekitToken, url } = await LiveKitService.getToken(roomName);
      setToken(livekitToken);
      setServerUrl(url);
      setConnected(true);
    } catch (error: any) {
      alert(`Failed to connect: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setToken('');
    setServerUrl('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Mic className="h-6 w-6" />
                LiveKit Connection Test
              </CardTitle>
              <CardDescription className="mt-2">
                Test your LiveKit voice connection before starting interviews
              </CardDescription>
            </div>
            {connected && (
              <Badge variant="default" className="gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!connected ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="test-room-123"
                />
                <p className="text-xs text-muted-foreground">
                  Enter any room name to test your connection
                </p>
              </div>

              <Button 
                onClick={handleConnect} 
                disabled={loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? (
                  <>Connecting...</>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Connect to Room
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-900">Connected to: {roomName}</p>
                  <p className="text-sm text-green-700">Audio connection active</p>
                </div>
                <Button 
                  onClick={handleDisconnect} 
                  variant="outline"
                  className="gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>

              <LiveKitRoom
                token={token}
                serverUrl={serverUrl}
                connect={true}
                audio={true}
                video={false}
                className="rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-center h-64 bg-slate-100 rounded-md">
                  <div className="text-center">
                    <Mic className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-lg font-medium">LiveKit Room Connected</p>
                    <p className="text-sm text-muted-foreground">Audio Only Mode</p>
                  </div>
                </div>
              </LiveKitRoom>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LiveKitTestPage() {
  return (
    <ProtectedRoute>
      <LiveKitTestContent />
    </ProtectedRoute>
  );
}
```

***

### **TASK 13: Add Environment Variables**

Create **`.env.local`**:

example script:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Create **`.env.local.example`**:

example script:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

***

### **Deliverables**

✓ Registration page with shadcn/ui form components
✓ Login page with shadcn/ui form components
✓ Protected dashboard with shadcn/ui cards and badges
✓ Auth state management with Zustand
✓ API client with JWT interceptors and token refresh
✓ Cookie-based token storage
✓ LiveKit service for token generation
✓ LiveKit test page with shadcn/ui components
✓ Responsive UI using existing shadcn/ui design system
✓ Error handling with shadcn/ui Alert components
✓ Loading states with Lucide React icons

***

### **Acceptance Criteria**

✓ User can register with valid email/password using shadcn/ui forms
✓ User can login with credentials
✓ Invalid credentials show shadcn/ui Alert component
✓ Protected routes redirect to login when unauthenticated
✓ Dashboard displays user email and stats in shadcn/ui Cards
✓ Logout clears tokens and redirects to login
✓ Token refresh works automatically on 401
✓ LiveKit test page generates valid token with shadcn/ui
✓ Form validation displays helpful error messages
✓ No TypeScript errors
✓ Responsive design works on mobile and desktop using shadcn/ui components
✓ Password toggle using Lucide icons
✓ Consistent design system throughout all pages


