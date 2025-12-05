# **PHASE 0: FOUNDATION - Revised Implementation Prompts**

## **High-Level Overview**

**Objective**: Establish a minimal, working foundation with basic structure, database connectivity, and placeholder UI. **No authentication, no AI integration, no voice features yet** - those come in later phases.

**Focus Areas**:
- Monorepo structure with proper TypeScript configuration
- Basic Next.js frontend with routing skeleton
- NestJS backend with core middleware and health checks
- PostgreSQL database with TypeORM entities and migrations
- Shared types package for type safety
- Docker Compose for local development environment

***

## **PROMPT 1: FRONTEND ENGINEER (Next.js Foundation)**

### **Objective**
Initialize a minimal Next.js application with TypeScript, basic routing structure, and API client setup. **No authentication UI, no complex state management yet** - just the skeleton.

### **Project Context**
You're setting up the client-side foundation for a voice-based AI interview platform. This phase focuses on getting Next.js running with proper TypeScript configuration and basic page structure. Authentication, voice features, and complex UI come in later phases.

### **Tasks**

**1. Initialize Next.js Application**
- Navigate to `/apps/frontend` directory
- Initialize Next.js 14+ with App Router using TypeScript template: `npx create-next-app@latest .` - ALREADY DONE
- Enable TypeScript strict mode in `tsconfig.json` ALREADY DONE
- Configure path aliases in `tsconfig.json`:
  ```json
    {
    "compilerOptions": {
        "paths": {
        "@/*": ["./src/*"],
        "@/components/*": ["./src/components/*"],
        "@/lib/*": ["./src/lib/*"]
        }
    }
    }
  ```
current compilations are :

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```
- Create `.env.local.example` file for environment variable documentation

**2. Install Minimal Dependencies** - SKIP!
- `axios` - HTTP client for API calls already installed

**3. Create Basic Folder Structure**


verify existing structure first
```
/apps/frontend
  /src
    /app                    # Next.js App Router pages
      /api                  # API routes (if needed)
      layout.tsx            # Root layout
      page.tsx              # Landing page
    /components             # React components (empty for now)
      /ui                   # Basic UI components
    /lib                    # Utilities and helpers
      /api-client.ts        # Axios instance (basic setup)
    /types                  # TypeScript types
  /public                   # Static assets
  next.config.js
  tailwind.config.js
  tsconfig.json
  .env.local.example
```

**4. Configure TailwindCSS (Minimal)**
- Accept default Tailwind configuration from Next.js setup
- Add basic color variables in `tailwind.config.js`:
  ```js
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#64748B'
      }
    }
  }
  ```
- Do **NOT** add: Custom animations, complex design tokens (Phase 1+)

**5. Create Basic Page Structure (No Auth)**
- **app/page.tsx** - Simple landing page with "Coming Soon" text
- **app/layout.tsx** - Root layout with basic HTML structure
- Do **NOT** create: Login pages, Dashboard, Interview pages (Phase 1+)

**6. Set Up Basic API Client**
```typescript
// lib/api-client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Basic error logging (no interceptors yet)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

**7. Environment Configuration**
Create `.env.local.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**8. Create Basic UI Components (Optional)**
Only if time permits:
- `components/ui/Button.tsx` - Simple button component
- `components/ui/Card.tsx` - Simple card container
- Use basic ShadCN logic

**9. Development Scripts**
Verify these scripts in `package.json`:
- `dev` - Next.js development server
- `build` - Production build
- `start` - Start production server
- `lint` - ESLint check

### **Deliverables**
✓ Next.js application running on `http://localhost:3000` (or 3001 if backend uses 3000)
✓ TypeScript strict mode enabled with zero errors
✓ Basic landing page displays
✓ API client configured with backend base URL
✓ TailwindCSS working
✓ Environment variables documented
✓ No authentication, no complex features

### **Acceptance Criteria**
✓ `npm run dev` starts application without errors
✓ Landing page loads at root URL
✓ TypeScript compilation passes with strict mode
✓ Basic API client can make requests (test with health check)
✓ No console errors or warnings
✓ Clean code structure following Next.js conventions

***

## **PROMPT 2: BACKEND ENGINEER (NestJS Foundation)**

### **Objective**
Set up a minimal NestJS backend with global middleware, environment validation, and health check endpoint. **No auth, no business logic yet** - just the foundational infrastructure.

### **Project Context**
You're building the API foundation for a voice-based AI interview platform. This phase focuses on getting NestJS running with proper configuration, logging, error handling, and database connectivity. Authentication, AI integration, and WebSockets come in later phases.

### **Tasks**

**1. Initialize NestJS Application**
- Navigate to `/apps/backend` directory
- Initialize NestJS project: `nest new . --skip-git`
- Enable TypeScript strict mode in `tsconfig.json`
- Set up `.env.example` with required variables

**2. Install Core Dependencies Only**
```bash
npm install @nestjs/config @nestjs/typeorm typeorm pg
npm install class-validator class-transformer
npm install winston winston-daily-rotate-file
npm install @nestjs/swagger
```

Do **NOT** install yet:
- Authentication packages (Phase 1)
- WebSocket packages (Phase 2)
- AI SDK packages (Phase 2)

**3. Create Minimal Module Structure**
```
/apps/backend/src
  /config
    app.config.ts           # App configuration
    database.config.ts      # Database configuration
  /common
    /filters
      all-exceptions.filter.ts
    /interceptors
      logging.interceptor.ts
    /interfaces
      api-response.interface.ts
  /database
    /entities               # Created by database engineer
  main.ts
  app.module.ts
  app.controller.ts         # Health check endpoint
  app.service.ts
```

**4. Configure Environment Validation**
```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
      })
    }),
    // TypeORM config (in Task 6)
  ]
})
```

**5. Implement Basic Logging (Winston)**
```typescript
// common/services/logger.service.ts
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }
  
  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }
  
  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }
}
```

**6. Configure Database Connection (TypeORM)**
```typescript
// app.module.ts
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false, // Always use migrations
    logging: configService.get('NODE_ENV') === 'development'
  }),
  inject: [ConfigService]
})
```

**7. Create Global Exception Filter**
```typescript
// common/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}
  
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : 500;
    
    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';
    
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      exception instanceof Error ? exception.stack : '',
      'ExceptionFilter'
    );
    
    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        message,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

**8. Apply Global Validation Pipe**
```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true
}));
```

**9. Create Health Check Endpoint**
```typescript
// app.controller.ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get('health')
  getHealth() {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    };
  }
}
```

**10. Set Up Basic Swagger (Optional)**
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Interview Agent API')
  .setDescription('Voice-based AI Interview Platform API')
  .setVersion('1.0')
  .build();
  
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**11. Environment Configuration**
Create `.env.example`:
```
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=interview_db

LOG_LEVEL=info
```

### **Deliverables**
✓ NestJS application running on `http://localhost:3000`
✓ TypeScript strict mode enabled
✓ Global error handling configured
✓ Winston logging operational
✓ TypeORM connected to PostgreSQL
✓ Health check endpoint at `/health` returns 200
✓ Environment validation on startup
✓ Swagger docs at `/api/docs` (optional)
✓ No authentication, no business modules yet

### **Acceptance Criteria**
✓ `npm run start:dev` starts application without errors
✓ Health endpoint returns valid JSON response
✓ Database connection successful (logs confirmation)
✓ Missing env variables prevent startup with clear error
✓ All HTTP requests logged
✓ TypeScript compilation passes with strict mode
✓ No business logic implemented yet (Phase 1+)

***

## **PROMPT 3: DATABASE ENGINEER (PostgreSQL Schema Only)**

### **Objective**
Design and implement the complete database schema with TypeORM entities, relationships, migrations, and indexes. **No seed data with business logic yet** - just schema and structure.

### **Project Context**
You're designing the data layer that will support user authentication (Phase 1), interview management (Phase 3), and AI-driven questions/answers (Phase 2-3). This phase focuses purely on schema design and database setup.

### **Tasks**

**1. Set Up TypeORM Entity Location**
- Create `/apps/backend/src/database/entities` directory
- Ensure TypeORM configuration points to this directory
- Create `/apps/backend/src/database/migrations` directory for migrations

**2. Define Database Entities**

**User Entity** (`entities/user.entity.ts`):
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Interview } from './interview.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true, lowercase: true })
  email: string;
  
  @Column()
  password_hash: string;
  
  @Column({ default: false })
  email_verified: boolean;
  
  @Column({ nullable: true })
  verification_token: string;
  
  @Column({ nullable: true })
  reset_token: string;
  
  @Column({ type: 'timestamp', nullable: true })
  reset_token_expires: Date;
  
  @CreateDateColumn()
  created_at: Date;
  
  @UpdateDateColumn()
  updated_at: Date;
  
  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;
  
  @OneToMany(() => Interview, interview => interview.user)
  interviews: Interview[];
}
```

**Interview Entity** (`entities/interview.entity.ts`):
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Question } from './question.entity';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  user_id: string;
  
  @ManyToOne(() => User, user => user.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @Column({ length: 100 })
  job_role: string;
  
  @Column({ type: 'enum', enum: ['JUNIOR', 'MID', 'SENIOR'] })
  difficulty: string;
  
  @Column('simple-array')
  topics: string[];
  
  @Column({ type: 'enum', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'], default: 'PENDING' })
  status: string;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overall_score: number;
  
  @Column({ nullable: true })
  performance_trend: string;
  
  @Column({ type: 'int', default: 0 })
  completed_questions: number;
  
  @Column({ type: 'int' })
  total_questions: number;
  
  @Column({ type: 'int', nullable: true })
  duration_minutes: number;
  
  @CreateDateColumn()
  started_at: Date;
  
  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
  
  @OneToMany(() => Question, question => question.interview, { cascade: true })
  questions: Question[];
}
```

**Question Entity** (`entities/question.entity.ts`):
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Interview } from './interview.entity';
import { Answer } from './answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  interview_id: string;
  
  @ManyToOne(() => Interview, interview => interview.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;
  
  @Column('text')
  content: string;
  
  @Column('text', { nullable: true })
  expected_answer: string;
  
  @Column({ type: 'enum', enum: ['EASY', 'MEDIUM', 'HARD'] })
  difficulty: string;
  
  @Column({ length: 100 })
  topic: string;
  
  @Column('int')
  order: number;
  
  @Column('jsonb', { nullable: true })
  evaluation_criteria: object;
  
  @Column({ type: 'int', nullable: true })
  time_limit_seconds: number;
  
  @Column('text', { nullable: true })
  gemini_prompt: string;
  
  @CreateDateColumn()
  created_at: Date;
  
  @OneToOne(() => Answer, answer => answer.question, { cascade: true })
  answer: Answer;
}
```

**Answer Entity** (`entities/answer.entity.ts`):
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  question_id: string;
  
  @OneToOne(() => Question, question => question.answer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;
  
  @Column('text')
  transcript: string;
  
  @Column({ nullable: true })
  audio_url: string;
  
  @Column('jsonb', { nullable: true })
  evaluation_json: object;
  
  @Column('text', { nullable: true })
  feedback: string;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_score: number;
  
  @Column({ type: 'int', nullable: true })
  duration_seconds: number;
  
  @CreateDateColumn()
  created_at: Date;
  
  @UpdateDateColumn()
  updated_at: Date;
}
```

**3. Create Indexes**
Add indexes to entities using decorators:
```typescript
// In User entity
@Index('IDX_user_email', ['email'])
@Index('IDX_user_created_at', ['created_at'])

// In Interview entity
@Index('IDX_interview_user_status', ['user_id', 'status'])
@Index('IDX_interview_started_at', ['started_at'])

// In Question entity
@Index('IDX_question_interview_order', ['interview_id', 'order'])

// In Answer entity
@Index('IDX_answer_question', ['question_id'])
@Index('IDX_answer_score', ['score'])
```

**4. Generate Initial Migration**
```bash
npm run typeorm migration:generate -- -n InitialSchema
```

Verify migration includes:
- All table creation statements
- Foreign key constraints with CASCADE
- Index creation statements
- Enum type definitions

**5. Create Migration Run/Revert Scripts**
Add to `package.json`:
```json
{
  "scripts": {
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/config/database.config.ts",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/config/database.config.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/config/database.config.ts"
  }
}
```

**6. Create Minimal Seed Data (Optional)**
**Only** if time permits, create:
- 1 test user (email: test@example.com, password: hashed "Password123!")
- Document credentials in README
- Do NOT create interview/question seed data yet (Phase 1+)

**7. Database Documentation**
Create `database/README.md` with:
- Entity descriptions
- Relationship diagram (text-based or Mermaid)
- Migration execution steps
- Connection instructions

### **Deliverables**
✓ Complete TypeORM entities (User, Interview, Question, Answer)
✓ All relationships defined with proper cascades
✓ Indexes configured on all entities
✓ Initial migration generated and tested
✓ Migration run/revert scripts functional
✓ Database documentation created
✓ No business logic, no complex seed data yet

### **Acceptance Criteria**
✓ `npm run migration:run` executes without errors
✓ All tables created in PostgreSQL
✓ Foreign key constraints enforced
✓ Indexes created successfully
✓ `npm run migration:revert` successfully rolls back
✓ Entity files compile with TypeScript strict mode
✓ Backend can connect to database and query tables

***

## **INTEGRATION VERIFICATION**

### **Phase 0 Complete Checklist:**

**1. Frontend Verification**
- [ ] Next.js dev server runs on http://localhost:3001
- [ ] Landing page loads without errors
- [ ] TypeScript strict mode passes
- [ ] API client configured with backend URL

**2. Backend Verification**
- [ ] NestJS dev server runs on http://localhost:3000
- [ ] `/health` endpoint returns 200 OK
- [ ] Database connection successful (check logs)
- [ ] Swagger docs accessible at `/api/docs`

**3. Database Verification**
- [ ] PostgreSQL container running
- [ ] All migrations executed successfully
- [ ] Can query tables using pg admin or CLI
- [ ] Foreign keys and indexes present

**4. Docker Compose Verification**
- [ ] All services start with `docker-compose up`
- [ ] Frontend can reach backend health endpoint
- [ ] Backend can connect to database
- [ ] Hot reload works for both frontend and backend

**5. Documentation Verification**
- [ ] README exists with setup instructions
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] API endpoints documented (if any)

***

## **What's NOT in Phase 0**

The following features are **intentionally excluded** and will be added in subsequent phases:

❌ Authentication (login, register, JWT) → **Phase 1**  
❌ Password hashing and validation → **Phase 1**  
❌ Protected routes and auth guards → **Phase 1**  
❌ AI/Gemini integration → **Phase 2**  
❌ WebSocket gateway → **Phase 2**  
❌ Voice recording/playback → **Phase 2**  
❌ Speech-to-text/text-to-speech → **Phase 2**  
❌ Interview business logic → **Phase 3**  
❌ Question generation → **Phase 3**  
❌ Answer evaluation → **Phase 3**  
❌ Report generation → **Phase 3**  
❌ Complex UI components → **Phase 1-3**  
❌ State management (Zustand/React Query) → **Phase 1**  

**Phase 0 Success = Working foundation with database connectivity, ready for Phase 1 authentication implementation.**

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60588710/d423c828-fbc2-4ff2-a4f3-6927764b3e33/ARCHITECTURE.md)
[2](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60588710/d1e4a3a7-71a6-4cd5-96e8-039844a9c9ad/phase0.md)