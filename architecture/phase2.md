# **PHASE 2: INTERVIEW ENGINE & VOICE AI AGENT**

## **High-Level Overview**

**Objective**: Implement complete interview lifecycle with question generation, LiveKit Python Agent with Gemini Live API integration, and voice-based interview sessions. This phase bridges authentication (Phase 1) with the core interview functionality.

**Focus Areas**:
- Interview creation and management (NestJS)
- Question generation using Gemini API (NestJS)
- Answer submission and basic evaluation (NestJS)
- LiveKit Python Agent with Gemini Live API for voice interaction
- Frontend interview session UI with LiveKit components
- Real-time voice communication and transcription

**Key Architectural Decision**: Interview business logic lives in NestJS, while voice orchestration happens in the Python Agent. The agent fetches questions from NestJS and sends back transcripts for evaluation.

***

## **PROMPT 1: BACKEND ENGINEER (Interview Services & Gemini Integration)**

### **Objective**
Implement complete interview management system with question generation using Gemini API, answer submission, and basic evaluation. Set up endpoints for the LiveKit Python Agent to interact with. **Focus on business logic and data persistence** - the Python Agent will handle voice interactions.

### **Project Context**
You're building the interview engine for a voice-based AI interview platform. Users create interviews with specific parameters (job role, difficulty, topics). The NestJS backend generates questions using Gemini API, stores them in PostgreSQL, and provides endpoints for the Python Agent to fetch questions and submit answers. Authentication is already implemented (Phase 1).

### **Required Technologies**
- **AI**: @google/generative-ai for Gemini API integration
- **Validation**: class-validator, class-transformer (already installed)
- **Database**: TypeORM with PostgreSQL (already configured)

***

### **TASK 1: Install Dependencies**

```bash
# Navigate to backend directory
cd apps/backend

# Install Gemini AI SDK
npm install @google/generative-ai
```

***

### **TASK 2: Environment Configuration**

Update **`.env.example`** and **`.env`**:

example code is provided here, please implement according to existing code



```env
# ... existing variables

# Google Gemini API
GOOGLE_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
```

Update **`config/app.config.ts`** validation schema:

```typescript
validationSchema: Joi.object({
  // ... existing validation
  GOOGLE_API_KEY: Joi.string().required(),
  GEMINI_MODEL: Joi.string().default('gemini-1.5-flash'),
  GEMINI_TEMPERATURE: Joi.number().min(0).max(1).default(0.7)
})
```

***

### **TASK 3: Create Module Structure**

Create the following directory structure:

```
/apps/backend/src
  /gemini
    gemini.service.ts
    gemini.module.ts
  /interviews
    /dto
      create-interview.dto.ts
      update-interview.dto.ts
      start-interview.dto.ts
    interviews.controller.ts
    interviews.service.ts
    interviews.module.ts
  /questions
    /dto
      get-next-question.dto.ts
    questions.service.ts
    questions.module.ts
  /answers
    /dto
      create-answer.dto.ts
    answers.controller.ts
    answers.service.ts
    answers.module.ts
```

***

### **TASK 4: Implement Gemini Service**

Create **`gemini/gemini.service.ts`**:

example code is provided here, please implement according to existing code



**Purpose**: Centralized service for all Gemini API interactions (question generation, answer evaluation).

**Pseudocode**:
```
CLASS GeminiService:
  CONSTRUCTOR:
    - Inject ConfigService
    - Initialize GoogleGenerativeAI client with API key from config
    - Set model name from config (default: gemini-1.5-flash)
    - Set temperature from config (default: 0.7)
  
  METHOD generateQuestions(jobRole, difficulty, topics, count):
    INPUT: jobRole (string), difficulty (ENUM), topics (array), count (number)
    OUTPUT: Array of question objects with structure: {content, expected_answer, difficulty, topic}
    
    LOGIC:
      - Build structured prompt:
        * "You are an expert technical interviewer"
        * "Generate {count} interview questions for a {difficulty} level {jobRole} position"
        * "Focus on these topics: {topics.join(', ')}"
        * "Return ONLY valid JSON array with this structure: [{content, expected_answer, difficulty, topic}]"
        * "Each question should be clear, specific, and appropriate for the difficulty level"
      
      - Call Gemini API with:
        * Prompt text
        * Response MIME type: "application/json"
        * Temperature from config
      
      - Parse JSON response
      - Validate structure (has required fields)
      - If validation fails, retry with exponential backoff (max 3 attempts)
      - Return questions array
  
  METHOD evaluateAnswer(questionContent, expectedAnswer, userTranscript):
    INPUT: questionContent (string), expectedAnswer (string), userTranscript (string)
    OUTPUT: Evaluation object {score, correctness, completeness, clarity, feedback}
    
    LOGIC:
      - Build evaluation prompt:
        * "You are an expert interviewer evaluating a candidate's answer"
        * "Question: {questionContent}"
        * "Expected Answer: {expectedAnswer}"
        * "Candidate's Answer: {userTranscript}"
        * "Evaluate on: correctness (0-100), completeness (0-100), clarity (0-100)"
        * "Return ONLY valid JSON: {score, correctness, completeness, clarity, feedback}"
        * "Provide constructive feedback in 2-3 sentences"
      
      - Call Gemini API with JSON response format
      - Parse and validate response
      - Calculate overall score: (correctness * 0.5 + completeness * 0.3 + clarity * 0.2)
      - Return evaluation object
  
  PRIVATE METHOD retry with exponential backoff for API failures
```

**Key Implementation Details**:
- Use `@google/generative-ai` SDK
- Configure `generationConfig` with response MIME type `application/json`
- Implement retry logic for API failures (network issues, rate limits)
- Add comprehensive error handling and logging
- Validate JSON structure before returning

***

### **TASK 5: Implement DTOs**

Create **`interviews/dto/create-interview.dto.ts`**:

example code is provided here, please implement according to existing code



**Pseudocode**:
```typescript
export class CreateInterviewDto {
  @IsString() @MinLength(2) @MaxLength(100)
  job_role: string;
  
  @IsEnum(['JUNIOR', 'MID', 'SENIOR'])
  difficulty: string;
  
  @IsArray() @IsString({ each: true }) @ArrayMinSize(1) @ArrayMaxSize(10)
  topics: string[];
  
  @IsNumber() @Min(5) @Max(20)
  total_questions: number;
}
```

Create **`interviews/dto/start-interview.dto.ts`**:

example code is provided here, please implement according to existing code



```typescript
export class StartInterviewDto {
  @IsUUID()
  interview_id: string;
}
```

Create **`answers/dto/create-answer.dto.ts`**:

example code is provided here, please implement according to existing code



**Pseudocode**:
```typescript
export class CreateAnswerDto {
  @IsUUID()
  question_id: string;
  
  @IsString() @MinLength(10)
  transcript: string;
  
  @IsNumber() @Min(0) @Optional()
  duration_seconds?: number;
}
```

***

### **TASK 6: Implement Interviews Service**

Create **`interviews/interviews.service.ts`**:

example code is provided here, please implement according to existing code



**Purpose**: Manage interview lifecycle (create, start, complete, get details).

**Pseudocode**:
```
CLASS InterviewsService:
  CONSTRUCTOR:
    - Inject InterviewRepository (TypeORM)
    - Inject QuestionService
    - Inject GeminiService
    - Inject LiveKitService
    - Inject ConfigService
    - Inject LoggerService
  
  METHOD createInterview(userId, createDto):
    INPUT: userId (UUID), createDto (job_role, difficulty, topics, total_questions)
    OUTPUT: Interview object with generated questions
    
    TRANSACTION START:
      - Create interview entity:
        * user_id = userId
        * job_role, difficulty, topics, total_questions from DTO
        * status = 'PENDING'
        * completed_questions = 0
      
      - Save interview to database
      
      - Generate questions using GeminiService:
        * Call geminiService.generateQuestions(job_role, difficulty, topics, count)
        * For each question from Gemini:
          - Create Question entity
          - Set interview_id, content, expected_answer, difficulty, topic
          - Set order (sequential: 0, 1, 2...)
        * Bulk save questions to database
      
      - Return interview with questions (exclude expected_answer from response)
    TRANSACTION END
  
  METHOD startInterview(userId, interviewId):
    INPUT: userId (UUID), interviewId (UUID)
    OUTPUT: LiveKit credentials {token, url, room_name}
    
    LOGIC:
      - Find interview by ID and user_id (authorization check)
      - If not found: throw NotFoundException
      - If status != 'PENDING': throw BadRequestException('Interview already started')
      
      - Create LiveKit room:
        * room_name = `interview-${interviewId}`
        * Call livekitService.createRoom(room_name, emptyTimeout: 1800) // 30 min
        * Store room metadata: {interview_id, user_id, job_role}
      
      - Generate LiveKit token for user:
        * Call livekitService.generateToken(room_name, user.email, userId)
      
      - Update interview:
        * status = 'IN_PROGRESS'
        * started_at = NOW()
      - Save interview
      
      - Return {token, url: livekitService.getLiveKitUrl(), room_name}
  
  METHOD getInterviewForAgent(interviewId, roomName):
    INPUT: interviewId (UUID), roomName (string)
    OUTPUT: Interview details with questions for agent
    
    NOTE: This endpoint is called by Python Agent
    
    LOGIC:
      - Find interview by ID with questions (ordered by 'order' field)
      - If not found: throw NotFoundException
      - Validate roomName matches expected format
      
      - Return:
        * interview_id, job_role, difficulty
        * questions array (content, difficulty, topic, order)
        * completed_questions count
        * status
  
  METHOD completeInterview(interviewId):
    INPUT: interviewId (UUID)
    OUTPUT: Updated interview with final scores
    
    LOGIC:
      - Find interview with questions and answers
      - If not found: throw NotFoundException
      
      - Calculate overall_score:
        * Average of all answer scores
        * If no answers: score = 0
      
      - Calculate interview duration:
        * duration_minutes = (NOW() - started_at) / 60
      
      - Analyze performance trend:
        * Compare first 3 and last 3 answer scores
        * If improving: 'IMPROVING'
        * If declining: 'DECLINING'
        * Else: 'CONSISTENT'
      
      - Update interview:
        * status = 'COMPLETED'
        * completed_at = NOW()
        * overall_score, duration_minutes, performance_trend
      - Save interview
      
      - Delete LiveKit room:
        * room_name = `interview-${interviewId}`
        * Call livekitService.deleteRoom(room_name)
      
      - Return updated interview
  
  METHOD getUserInterviews(userId, filters, pagination):
    INPUT: userId, status filter, pagination params
    OUTPUT: Paginated list of user's interviews
    
    LOGIC:
      - Query interviews where user_id = userId
      - Apply status filter if provided
      - Order by started_at DESC
      - Apply pagination (page, limit)
      - Return {data: interviews[], total, page, limit}
  
  METHOD getInterviewById(userId, interviewId):
    INPUT: userId, interviewId
    OUTPUT: Complete interview with questions and answers
    
    LOGIC:
      - Find interview by ID and user_id
      - Include questions with answers and evaluations
      - If not found: throw NotFoundException
      - Return interview details
```

**Key Implementation Details**:
- Use TypeORM transactions for interview creation
- Implement proper error handling for Gemini API failures
- Add logging for all critical operations
- Ensure user authorization on all operations
- Use database relations to efficiently load questions and answers

***

### **TASK 7: Implement Questions Service**

Create **`questions/questions.service.ts`**:

example code is provided here, please implement according to existing code



**Purpose**: Manage questions and adaptive difficulty selection.

**Pseudocode**:
```
CLASS QuestionsService:
  CONSTRUCTOR:
    - Inject QuestionRepository
    - Inject AnswerRepository
  
  METHOD getNextQuestion(interviewId):
    INPUT: interviewId (UUID)
    OUTPUT: Next question to ask or null if all answered
    
    LOGIC:
      - Find all questions for interview (ordered by 'order')
      - Find all answers for interview
      - Filter questions to get unanswered ones
      
      - If no unanswered questions:
        * Return null (interview complete)
      
      - Get last answer's score for adaptive difficulty
      - If no previous answers:
        * Return first unanswered question
      
      - Implement adaptive logic:
        * If last_score >= 80:
          - Prefer HARD difficulty questions
        * Else if last_score >= 50:
          - Prefer MEDIUM difficulty questions  
        * Else:
          - Prefer EASY difficulty questions
      
      - Find next unanswered question matching preferred difficulty
      - If no match found, return any unanswered question
      
      - Return question (exclude expected_answer field)
  
  METHOD getQuestionById(questionId):
    INPUT: questionId (UUID)
    OUTPUT: Question object
    
    LOGIC:
      - Find question by ID
      - If not found: throw NotFoundException
      - Return question
  
  METHOD bulkCreateQuestions(interviewId, questionsData):
    INPUT: interviewId, array of question data
    OUTPUT: Created questions array
    
    NOTE: Used internally by InterviewsService
    
    LOGIC:
      - For each question data:
        * Create Question entity
        * Set interview_id, content, expected_answer, difficulty, topic, order
      - Bulk insert into database
      - Return created questions
```

**Key Implementation Details**:
- Adaptive difficulty algorithm should be configurable
- Questions are ordered by the 'order' field
- Never expose 'expected_answer' to frontend (only to Python Agent)

***

### **TASK 8: Implement Answers Service**

Create **`answers/answers.service.ts`**:

example code is provided here, please implement according to existing code



**Purpose**: Handle answer submission and trigger evaluation.

**Pseudocode**:
```
CLASS AnswersService:
  CONSTRUCTOR:
    - Inject AnswerRepository
    - Inject QuestionRepository
    - Inject InterviewRepository
    - Inject GeminiService
    - Inject LoggerService
  
  METHOD createAnswer(createDto):
    INPUT: createDto (question_id, transcript, duration_seconds)
    OUTPUT: Created answer with evaluation
    
    TRANSACTION START:
      - Find question by ID with interview relation
      - If not found: throw NotFoundException
      
      - Check if answer already exists for this question:
        * If exists: throw ConflictException('Question already answered')
      
      - Create Answer entity:
        * question_id, transcript, duration_seconds
        * Set created_at = NOW()
      - Save answer (without evaluation yet)
      
      - Trigger evaluation using Gemini:
        * Call geminiService.evaluateAnswer(
            question.content,
            question.expected_answer,
            transcript
          )
        * Get evaluation result: {score, correctness, completeness, clarity, feedback}
      
      - Update answer with evaluation:
        * evaluation_json = {correctness, completeness, clarity}
        * score = overall score
        * feedback = constructive feedback text
        * confidence_score = (score >= 70 ? 0.8 : 0.6) // Simple heuristic
      - Save answer with evaluation
      
      - Update interview progress:
        * Increment completed_questions
        * Save interview
      
      - Return answer with evaluation
    TRANSACTION END
    
    ERROR HANDLING:
      - If Gemini evaluation fails:
        * Log error
        * Save answer with null evaluation
        * Schedule retry evaluation job (optional)
        * Return answer without evaluation
  
  METHOD getAnswersByInterview(interviewId):
    INPUT: interviewId (UUID)
    OUTPUT: All answers for interview with evaluations
    
    LOGIC:
      - Find all answers where question.interview_id = interviewId
      - Include question content
      - Order by created_at ASC
      - Return answers array
  
  METHOD getAnswerById(answerId):
    INPUT: answerId (UUID)
    OUTPUT: Answer with evaluation and question
    
    LOGIC:
      - Find answer by ID with question relation
      - If not found: throw NotFoundException
      - Return answer details
```

**Key Implementation Details**:
- Evaluation happens synchronously during answer creation
- Use transactions to ensure data consistency
- Implement fallback if Gemini evaluation fails
- Log all evaluation requests for debugging

***

### **TASK 9: Implement Controllers**

Create **`interviews/interviews.controller.ts`**:

example code is provided here, please implement according to existing code



**Pseudocode**:
```typescript
@Controller('interviews')
@ApiBearerAuth()
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new interview with questions' })
  async createInterview(
    @CurrentUser() user,
    @Body() createDto: CreateInterviewDto
  ) {
    const interview = await this.interviewsService.createInterview(
      user.id,
      createDto
    );
    return { success: true, data: interview };
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start interview and get LiveKit credentials' })
  async startInterview(
    @CurrentUser() user,
    @Param('id') interviewId: string
  ) {
    const credentials = await this.interviewsService.startInterview(
      user.id,
      interviewId
    );
    return { success: true, data: credentials };
  }

  @Get()
  @ApiOperation({ summary: 'Get user interviews with filters' })
  async getUserInterviews(
    @CurrentUser() user,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const result = await this.interviewsService.getUserInterviews(
      user.id,
      { status },
      { page, limit }
    );
    return { success: true, data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview details with Q&A' })
  async getInterview(
    @CurrentUser() user,
    @Param('id') interviewId: string
  ) {
    const interview = await this.interviewsService.getInterviewById(
      user.id,
      interviewId
    );
    return { success: true, data: interview };
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete interview and calculate final scores' })
  async completeInterview(
    @CurrentUser() user,
    @Param('id') interviewId: string
  ) {
    const interview = await this.interviewsService.completeInterview(interviewId);
    return { success: true, data: interview };
  }

  // AGENT ENDPOINT (No auth required - secured by room validation)
  @Public()
  @Get('agent/:id')
  @ApiOperation({ summary: 'Get interview details for agent' })
  async getInterviewForAgent(
    @Param('id') interviewId: string,
    @Query('room_name') roomName: string
  ) {
    const interview = await this.interviewsService.getInterviewForAgent(
      interviewId,
      roomName
    );
    return { success: true, data: interview };
  }
}
```

Create **`answers/answers.controller.ts`**:

example code is provided here, please implement according to existing code



**Pseudocode**:
```typescript
@Controller('answers')
@ApiBearerAuth()
export class AnswersController {
  constructor(private answersService: AnswersService) {}

  // AGENT ENDPOINT (No auth - agent submits answers)
  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit answer with transcript (Agent)' })
  async createAnswer(@Body() createDto: CreateAnswerDto) {
    const answer = await this.answersService.createAnswer(createDto);
    return { success: true, data: answer };
  }

  @Get('interview/:interviewId')
  @ApiOperation({ summary: 'Get all answers for interview' })
  async getAnswersByInterview(
    @CurrentUser() user,
    @Param('interviewId') interviewId: string
  ) {
    // TODO: Add authorization check (user owns interview)
    const answers = await this.answersService.getAnswersByInterview(interviewId);
    return { success: true, data: answers };
  }
}
```

**Key Implementation Details**:
- Most endpoints require authentication except agent endpoints
- Agent endpoints use `@Public()` decorator
- Add rate limiting to prevent abuse (especially on agent endpoints)
- Add Swagger documentation for all endpoints

***

### **TASK 10: Configure Modules**

Create **`gemini/gemini.module.ts`**:

example code is provided here, please implement according to existing code



```typescript
import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Module({
  providers: [GeminiService],
  exports: [GeminiService]
})
export class GeminiModule {}
```

Create **`interviews/interviews.module.ts`**:

example code is provided here, please implement according to existing code



```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from '../database/entities/interview.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { QuestionsModule } from '../questions/questions.module';
import { GeminiModule } from '../gemini/gemini.module';
import { LiveKitModule } from '../livekit/livekit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview]),
    QuestionsModule,
    GeminiModule,
    LiveKitModule
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService],
  exports: [InterviewsService]
})
export class InterviewsModule {}
```

Create **`questions/questions.module.ts`**:

example code is provided here, please implement according to existing code



```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../database/entities/question.entity';
import { Answer } from '../database/entities/answer.entity';
import { QuestionsService } from './questions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer])],
  providers: [QuestionsService],
  exports: [QuestionsService]
})
export class QuestionsModule {}
```

Create **`answers/answers.module.ts`**:

example code is provided here, please implement according to existing code



```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../database/entities/answer.entity';
import { Question } from '../database/entities/question.entity';
import { Interview } from '../database/entities/interview.entity';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Answer, Question, Interview]),
    GeminiModule
  ],
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService]
})
export class AnswersModule {}
```

Update **`app.module.ts`**:

example code is provided here, please implement according to existing code



```typescript
import { Module } from '@nestjs/common';
// ... existing imports
import { GeminiModule } from './gemini/gemini.module';
import { InterviewsModule } from './interviews/interviews.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';

@Module({
  imports: [
    // ... existing modules
    GeminiModule,
    InterviewsModule,
    QuestionsModule,
    AnswersModule
  ]
})
export class AppModule {}
```

***

### **Deliverables**

✓ Gemini service for question generation and answer evaluation
✓ Interview creation with automatic question generation
✓ Interview start endpoint returning LiveKit credentials
✓ Question service with adaptive difficulty selection
✓ Answer submission endpoint with evaluation
✓ Interview completion with score calculation
✓ Endpoints for Python Agent to fetch questions and submit answers
✓ All endpoints documented with Swagger
✓ Error handling and logging throughout

***

### **Acceptance Criteria**

✓ POST `/interviews` creates interview with generated questions
✓ POST `/interviews/:id/start` returns LiveKit token and room name
✓ GET `/interviews/agent/:id` returns interview data for agent
✓ POST `/answers` submits answer and returns evaluation
✓ Question generation uses Gemini API successfully
✓ Answer evaluation provides scores and feedback
✓ Adaptive difficulty selects appropriate next question
✓ Interview completion calculates overall score
✓ All database operations use transactions
✓ Agent endpoints work without authentication
✓ User can only access their own interviews
✓ TypeScript compilation passes with zero errors
✓ Swagger documentation complete


***

## **What's NOT in Phase 2**

- ❌ Detailed interview reports with charts (Phase 3)
- ❌ AI-generated insights and recommendations (Phase 3)
- ❌ Performance trend analysis (Phase 3)
- ❌ PDF report generation (Phase 3)
- ❌ Interview retake with same questions (Phase 3)
- ❌ Advanced question caching (Phase 3)
- ❌ Adaptive difficulty mid-interview (basic version implemented, advanced in Phase 3)
- ❌ Background job processing for evaluations (Phase 4)
- ❌ Comprehensive testing suite (Phase 4)
- ❌ Production deployment configuration (Phase 4)

***

## **Next Steps for Phase 3**

Phase 3 will focus on:
1. **Comprehensive Reports** with charts and visualizations
2. **AI-Generated Insights** using Gemini for personalized feedback
3. **Performance Analytics** with trend analysis
4. **Question Categories** and scoring breakdowns
5. **Interview History** comparison and progress tracking

**End of Phase 2**


























































































***

## **PROMPT 2: FRONTEND ENGINEER (Interview Session UI & LiveKit Integration)**

### **Objective**
Implement interview creation UI, voice-based interview session page with LiveKit components, and real-time interview progress visualization. Users create interviews, start voice sessions with AI agent, and see live transcription and feedback.

### **Project Context**
You're building the interview session interface using **LiveKit React components** and **shadcn/ui**. Users will speak their answers to questions asked by the AI agent (Python). The frontend connects to LiveKit rooms, displays current questions, shows audio visualization, and handles interview completion flow.

### **Required Technologies**
- **LiveKit**: @livekit/components-react (already installed)
- **State**: Zustand for interview state
- **UI**: shadcn/ui components
- **Forms**: React Hook Form with Zod validation

***

### **TASK 1: Install Additional Dependencies**

```bash
# Navigate to frontend
cd apps/frontend

# Install additional shadcn components
npx shadcn@latest add progress
npx shadcn@latest add slider
npx shadcn@latest add radio-group
npx shadcn@latest add checkbox
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add tabs

# Install LiveKit styles (if not already)
npm install @livekit/components-styles
```

***

### **TASK 2: Create Interview Types**

Create **`types/interview.types.ts`**:

example code is provided here, please implement according to existing code



**Sample script**:

```typescript
export interface Interview {
  id: string;
  user_id: string;
  job_role: string;
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR';
  topics: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  overall_score: number | null;
  performance_trend: string | null;
  completed_questions: number;
  total_questions: number;
  duration_minutes: number | null;
  started_at: string;
  completed_at: string | null;
  questions?: Question[];
}

export interface Question {
  id: string;
  interview_id: string;
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  order: number;
  answer?: Answer;
}

export interface Answer {
  id: string;
  question_id: string;
  transcript: string;
  score: number | null;
  feedback: string | null;
  evaluation_json: {
    correctness: number;
    completeness: number;
    clarity: number;
  } | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface CreateInterviewPayload {
  job_role: string;
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR';
  topics: string[];
  total_questions: number;
}

export interface LiveKitCredentials {
  token: string;
  url: string;
  room_name: string;
}
```

***

### **TASK 3: Create Interview Service**

Create **`lib/interview.service.ts`**:

example code is provided here, please implement according to existing code



**Pseudocode**:

```typescript
CLASS InterviewService:
  
  METHOD createInterview(payload: CreateInterviewPayload):
    INPUT: job_role, difficulty, topics, total_questions
    OUTPUT: Created interview with questions
    
    LOGIC:
      - Call POST /interviews with payload
      - Return interview data
  
  METHOD startInterview(interviewId: string):
    INPUT: interviewId
    OUTPUT: LiveKit credentials
    
    LOGIC:
      - Call POST /interviews/:id/start
      - Return {token, url, room_name}
  
  METHOD getUserInterviews(filters):
    INPUT: status filter, pagination
    OUTPUT: Paginated interviews list
    
    LOGIC:
      - Call GET /interviews with query params
      - Return {data, total, page, limit}
  
  METHOD getInterviewById(interviewId):
    INPUT: interviewId
    OUTPUT: Complete interview with Q&A
    
    LOGIC:
      - Call GET /interviews/:id
      - Return interview details
  
  METHOD completeInterview(interviewId):
    INPUT: interviewId
    OUTPUT: Updated interview with final scores
    
    LOGIC:
      - Call POST /interviews/:id/complete
      - Return completed interview
```

***

### **TASK 4: Create Interview Store**

Create **`store/interview.store.ts`**:

example code is provided here, please implement according to existing code



**Pseudocode**:

```typescript
INTERFACE InterviewState:
  currentInterview: Interview | null
  interviews: Interview[]
  isLoading: boolean
  error: string | null
  
  // LiveKit session state
  livekitCredentials: LiveKitCredentials | null
  currentQuestion: Question | null
  isSessionActive: boolean
  
  // Actions
  createInterview(payload): Promise<void>
  startInterview(id): Promise<void>
  fetchUserInterviews(): Promise<void>
  fetchInterview(id): Promise<void>
  completeInterview(id): Promise<void>
  setCurrentQuestion(question): void
  endSession(): void
  clearError(): void

IMPLEMENTATION:
  create<InterviewState>((set, get) => ({
    // Initial state
    currentInterview: null,
    interviews: [],
    isLoading: false,
    error: null,
    livekitCredentials: null,
    currentQuestion: null,
    isSessionActive: false,
    
    createInterview: async (payload) => {
      set({ isLoading: true, error: null })
      try {
        const interview = await InterviewService.createInterview(payload)
        set({ 
          currentInterview: interview, 
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: error.message, 
          isLoading: false 
        })
        throw error
      }
    },
    
    startInterview: async (id) => {
      set({ isLoading: true, error: null })
      try {
        const credentials = await InterviewService.startInterview(id)
        set({ 
          livekitCredentials: credentials,
          isSessionActive: true,
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: error.message, 
          isLoading: false 
        })
        throw error
      }
    },
    
    // ... other methods
  }))
```

***

### **TASK 5: Create Interview Setup Page**

Create **`app/interviews/new/page.tsx`**:

example code is provided here, please implement according to existing code



**Purpose**: Form to create new interview with parameters.

**Pseudocode**:

```typescript
COMPONENT InterviewSetupPage:
  STATE:
    - form state using React Hook Form with Zod validation
    - selectedTopics: string[]
    - estimatedDuration: calculated based on question count
  
  FORM FIELDS:
    - Job Role: Input field (required, 2-100 chars)
    - Difficulty: Radio group (JUNIOR / MID / SENIOR)
    - Topics: Checkbox group with common options:
      * JavaScript, React, Node.js, TypeScript, System Design
      * Algorithms, Data Structures, Databases, APIs
      * Custom topic input field
    - Question Count: Slider (5-20, default: 10)
    - Show estimated duration: questionCount * 2 minutes
  
  ON SUBMIT:
    - Validate form
    - Call interviewStore.createInterview(formData)
    - If successful:
      * Navigate to /interviews/:id with newly created interview
    - If error:
      * Display error alert
  
  UI STRUCTURE:
    - Card component with form
    - Section headers for each category
    - Preview box showing selected parameters
    - Submit button "Create Interview"
    - Cancel button to go back to dashboard
```

**shadcn/ui components to use**:
- Card, CardHeader, CardTitle, CardContent
- Input for job role
- RadioGroup for difficulty
- Checkbox for topics
- Slider for question count
- Button for submit/cancel
- Alert for errors
- Badge to show selected topics

***
## **TASK 6: Create Interview Session Page with Voice Orb**

Create **`app/interviews/[id]/session/page.tsx`**:

**Purpose**: Voice interview session with LiveKit integration and simple audio-reactive orb visualization.

**Pseudocode**:

```typescript
COMPONENT InterviewSessionPage:
  PARAMS: interviewId from URL
  
  STATE:
    - livekitConnected: boolean
    - currentQuestionIndex: number
    - agentState: 'initializing' | 'listening' | 'thinking' | 'speaking'
    - agentAudioLevel: number (0-1, only when agent is speaking)
    - currentQuestion: string
  
  LIFECYCLE:
    ON MOUNT:
      - Call interviewStore.fetchInterview(interviewId)
      - Call interviewStore.startInterview(interviewId)
      - Wait for LiveKit credentials
      - Connect to LiveKit room
    
    ON UNMOUNT:
      - Disconnect from LiveKit
      - Call interviewStore.endSession()
  
  LIVEKIT SETUP:
    - Use LiveKitRoom component with:
      * token from store
      * serverUrl from store
      * audio={true}, video={false}
      * connect={true}
    
    - Use useVoiceAssistant hook to get:
      * Agent state
      * Agent audio level (only when speaking)
      * Transcript events
    
    - Listen for agent messages (questions)
    - Update currentQuestion when new question arrives
  
  UI LAYOUT:
    TOP SECTION:
      - Progress bar (completed / total questions)
      - Current question number: "Question X of Y"
      - Timer showing elapsed time
    
    CENTER SECTION (MAIN FOCUS):
      - Voice Orb (static position, center of screen):
        * Simple circular gradient sphere
        * Single blue color: #3B82F6
        * Animates ONLY when agent is speaking:
          - Scale pulses based on agent's audio level
          - Smooth breathing animation (scale 1.0 to 1.3)
          - Soft glow effect that intensifies with audio
        * Completely static when:
          - Agent is listening (no animation)
          - Agent is thinking (no animation)
          - User is speaking (no animation)
      
      - Current question text (below orb):
        * Clean card with question content
        * Large, readable typography
        * Fades in when question asked
    
    BOTTOM SECTION:
      - Interview metadata:
        * Job Role, Difficulty level, Topic badges
        * Questions completed count
      - "End Interview" button (minimal, bottom corner)
  
  ORB ANIMATION LOGIC:
    - Simple CSS-based animation using Framer Motion
    - Animation triggers:
      * IF agentState === 'speaking' AND agentAudioLevel > 0:
        - Scale from 1.0 to (1.0 + agentAudioLevel * 0.3)
        - Glow opacity from 0.3 to (0.3 + agentAudioLevel * 0.5)
      * ELSE:
        - Static at scale 1.0
        - No glow or minimal base glow (0.2 opacity)
    
    - Smooth transitions (0.1s ease-out)
    - No rotation, no drift, no physics
  
  COMPLETION FLOW:
    - When last question answered:
      * Call interviewStore.completeInterview(interviewId)
      * Disconnect from LiveKit
      * Navigate to /interviews/:id/report
```

**Implementation Components**:

**Required libraries**:
```bash
# Lightweight animation (already installed if using shadcn)
npm install framer-motion
```

**Component breakdown**:

1. **`VoiceOrb.tsx`** - Minimal orb component:
   ```typescript
   COMPONENT VoiceOrb:
     PROPS:
       - isAgentSpeaking: boolean
       - audioLevel: number (0-1)
     
     RENDER:
       - Single div with:
         * Circular shape (border-radius: 50%)
         * Blue gradient background (#3B82F6)
         * Box shadow for glow effect
         * Framer Motion for scale animation
       
       ANIMATION:
         - IF isAgentSpeaking:
           * animate={{ scale: 1.0 + audioLevel * 0.3 }}
           * animate={{ opacity: 0.3 + audioLevel * 0.5 }} (for glow)
         - ELSE:
           * animate={{ scale: 1.0 }}
           * opacity: 0.2 (minimal base glow)
   ```

2. **`QuestionDisplay.tsx`** - Question card:
   ```typescript
   COMPONENT QuestionDisplay:
     PROPS:
       - question: string
       - questionNumber: number
       - totalQuestions: number
     
     RENDER:
       - Card component (shadcn/ui)
       - Simple fade in animation
       - Centered text below orb
   ```

**LiveKit integration specifics**:
- **useVoiceAssistant** hook for agent state
- Track agent audio output level (not user input)
- Only animate orb when `agentState === 'speaking'`
- Audio level updates at ~30fps (throttled)

**shadcn/ui components to use**:
- Card for question display
- Progress for interview progress bar
- Badge for metadata (job role, difficulty)
- Button for "End Interview"

**Styling**:
```css
/* Simple orb styling */
.voice-orb {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, #60A5FA, #3B82F6);
  box-shadow: 0 0 60px rgba(59, 130, 246, 0.3);
  /* Animation handled by Framer Motion */
}
```

**Visual behavior**:
- **Idle/Listening**: Static blue circle, minimal glow
- **Agent Speaking**: Pulses smoothly with audio intensity
- **No user interaction**: Not draggable, not hoverable
- **Single color**: Blue (#3B82F6) only, no color changes

**Performance**:
- CSS-based rendering (no WebGL/Three.js needed)
- Throttle audio updates to 30fps
- Simple transform animations (GPU-accelerated)

**Mobile responsiveness**:
- Orb scales down on smaller screens (150px on mobile)
- Maintains center position
- Touch events disabled (no interaction)

***

### **TASK 7: Create Interview List Page**

Create **`app/interviews/page.tsx`**:

example code is provided here, please implement according to existing code



**Purpose**: List all user interviews with filters.

**Pseudocode**:

```typescript
COMPONENT InterviewsListPage:
  STATE:
    - statusFilter: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    - currentPage: number
  
  LIFECYCLE:
    ON MOUNT:
      - Call interviewStore.fetchUserInterviews()
  
  UI STRUCTURE:
    HEADER:
      - Page title "My Interviews"
      - Button "New Interview" → navigate to /interviews/new
    
    FILTERS:
      - Tabs for status filter (All, Pending, In Progress, Completed)
      - Search input (future feature)
    
    INTERVIEW CARDS:
      For each interview:
        - Card showing:
          * Job Role and Difficulty badge
          * Progress: X / Y questions completed
          * Status badge (color-coded)
          * Overall score (if completed)
          * Date created
          * Action buttons:
            - If PENDING: "Start Interview"
            - If IN_PROGRESS: "Continue"
            - If COMPLETED: "View Report"
    
    PAGINATION:
      - Show page numbers
      - Previous / Next buttons
    
    EMPTY STATE:
      - If no interviews:
        * Icon and message "No interviews yet"
        * Button "Create Your First Interview"
```

**shadcn/ui components**:
- Card for each interview
- Tabs for status filter
- Badge for status and difficulty
- Progress for completion
- Button for actions
- Pagination component (custom or shadcn)

***

### **TASK 8: Create Interview Report Page (Basic)**

Create **`app/interviews/[id]/report/page.tsx`**:

example code is provided here, please implement according to existing code



**Purpose**: Show basic interview results (detailed report in Phase 3).

**Pseudocode**:

```typescript
COMPONENT InterviewReportPage:
  PARAMS: interviewId from URL
  
  LIFECYCLE:
    ON MOUNT:
      - Call interviewStore.fetchInterview(interviewId)
      - Get interview with questions and answers
  
  UI STRUCTURE:
    HEADER:
      - "Interview Complete! 🎉"
      - Overall score (large, color-coded)
      - Performance trend badge
    
    STATS CARDS:
      - Total Questions: X
      - Completed: Y
      - Average Score: Z%
      - Duration: N minutes
    
    QUESTIONS SUMMARY:
      - Simple list of questions with scores:
        * Question text (truncated)
        * Score badge (color-coded)
        * Expand to see answer transcript
    
    ACTIONS:
      - Button "Retake Interview" (creates new with same params)
      - Button "Back to Dashboard"
      - Button "View Detailed Report" (Phase 3 feature, disabled)
  
  NOTE: Detailed analysis with charts and AI insights comes in Phase 3
```

**shadcn/ui components**:
- Card for stats
- Badge for scores
- Separator between sections
- Button for actions
- Progress indicator for scores

***

### **TASK 9: Update Dashboard**

Update **`app/dashboard/page.tsx`**:

example code is provided here, please implement according to existing code



Add to existing dashboard:

```typescript
// Add interview statistics cards
- Recent interviews section
- Quick start button for new interview
- Stats: Total interviews, Average score, Last interview date
```

***

### **TASK 10: Create Custom LiveKit Handlers**

Create **`components/interview/voice-assistant-handler.tsx`**:

example code is provided here, please implement according to existing code



**Purpose**: Custom component to handle LiveKit voice events.

**Pseudocode**:

```typescript
COMPONENT VoiceAssistantHandler:
  PROPS:
    - onQuestionReceived: (question) => void
    - onTranscriptUpdate: (transcript) => void
    - onAgentStateChange: (state) => void
  
  USE HOOKS:
    - useVoiceAssistant from @livekit/components-react
    - useRoomContext from @livekit/components-react
  
  LOGIC:
    - Listen to agent messages:
      * Parse message data
      * If type = 'question': call onQuestionReceived
      * If type = 'transcript': call onTranscriptUpdate
    
    - Monitor agent state:
      * Call onAgentStateChange when state changes
    
    - Handle errors and disconnections
  
  RENDER:
    - null (this is a logic-only component)
```

***

### **Deliverables**

✓ Interview creation form with validation
✓ Interview list page with filtering
✓ Voice interview session with LiveKit integration
✓ Real-time question display during session
✓ Audio visualization with agent state
✓ Basic interview report page
✓ Updated dashboard with interview stats
✓ Protected routes for all interview pages
✓ Error handling and loading states
✓ Responsive design for all pages

***

### **Acceptance Criteria**

✓ User can create interview with custom parameters
✓ Form validation prevents invalid inputs
✓ Interview list displays user's interviews
✓ Start interview connects to LiveKit room successfully
✓ Voice session displays current question
✓ Audio visualizer shows agent and user audio levels
✓ Agent state updates in real-time
✓ Interview completion navigates to report
✓ Report shows basic scores and statistics
✓ All pages use shadcn/ui components consistently
✓ No console errors or warnings
✓ TypeScript compilation passes
✓ Responsive design works on mobile and desktop

***

## **What's NOT in Phase 2**

- ❌ Detailed interview reports with charts (Phase 3)
- ❌ AI-generated insights and recommendations (Phase 3)
- ❌ Performance trend analysis (Phase 3)
- ❌ PDF report generation (Phase 3)
- ❌ Interview retake with same questions (Phase 3)
- ❌ Advanced question caching (Phase 3)
- ❌ Adaptive difficulty mid-interview (basic version implemented, advanced in Phase 3)
- ❌ Background job processing for evaluations (Phase 4)
- ❌ Comprehensive testing suite (Phase 4)
- ❌ Production deployment configuration (Phase 4)

***

## **Next Steps for Phase 3**

Phase 3 will focus on:
1. **Comprehensive Reports** with charts and visualizations
2. **AI-Generated Insights** using Gemini for personalized feedback
3. **Performance Analytics** with trend analysis
4. **Question Categories** and scoring breakdowns
5. **Interview History** comparison and progress tracking

**End of Phase 2**

***






















































































































































***

## **PROMPT 3: PYTHON ENGINEER (LiveKit Agent with Gemini Live API)**

### **Objective**
Implement LiveKit Python Agent that orchestrates voice interviews using Gemini Live API for natural conversation, fetches questions from NestJS backend, detects user speech completion, and submits transcripts for evaluation.

### **Project Context**
You're building the voice AI agent that conducts interviews. The agent connects to LiveKit rooms, uses Gemini Live API for voice interaction, asks questions fetched from NestJS, listens for user answers with automatic turn detection, and submits transcripts back to NestJS for evaluation. This agent is the bridge between LiveKit's real-time voice infrastructure and the interview business logic in NestJS.

### **Required Technologies**
- **LiveKit**: livekit-agents[google] for Gemini Live API integration
- **Audio**: livekit-plugins-silero for turn detection
- **HTTP**: httpx for NestJS API calls
- **Python**: 3.13+ with async/await
- **Package Manager**: uv (modern Python package and project manager)

***

### **TASK 1: Project Setup with uv**

Create directory structure:

```
/agent
  /src
    __init__.py
    agent.py              # Main agent entry point
    interview_orchestrator.py  # Interview flow logic
    api_client.py         # NestJS API client
    config.py             # Configuration
  pyproject.toml          # uv project configuration
  .python-version         # Python version specification
  .env.example
  .env
  README.md
```

**Initialize uv project:**

```bash
# Navigate to agent directory
cd agent

# Initialize uv project (creates pyproject.toml)
uv init --name interview-agent --lib

# Set Python version
echo "3.13" > .python-version

# Create virtual environment automatically managed by uv
uv venv
```

Create **`pyproject.toml`**:

```toml
[project]
name = "interview-agent"
version = "0.1.0"
description = "LiveKit Interview Agent with Gemini Live API"
readme = "README.md"
requires-python = ">=3.13"
dependencies = [
    "livekit-agents[google]>=0.8.0",
    "livekit-plugins-silero>=0.6.0",
    "httpx>=0.27.0",
    "python-dotenv>=1.0.0",
    "pydantic>=2.0.0",
    "pydantic-settings>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "black>=24.0.0",
    "ruff>=0.3.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 100
target-version = "py310"

[tool.black]
line-length = 100
target-version = ["py310", "py311", "py312"]
```

**Install dependencies:**

```bash
# Install all dependencies (production + dev)
uv sync

# Or just production dependencies
uv sync --no-dev

# Add new dependency
uv add <package-name>

# Add dev dependency
uv add --dev <package-name>
```

Create **`.env.example`**:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
GOOGLE_API_KEY=your-gemini-api-key
NESTJS_API_URL=http://localhost:3000
LOG_LEVEL=INFO
```

***

### **TASK 2: Create Configuration Module**

Create **`src/config.py`**:

**Pseudocode**:

```python
FROM pydantic_settings IMPORT BaseSettings
FROM typing IMPORT Optional

CLASS Config(BaseSettings):
    # LiveKit configuration
    livekit_url: str
    livekit_api_key: str
    livekit_api_secret: str
    
    # Gemini configuration
    google_api_key: str
    gemini_model: str = "gemini-2.0-flash-exp"
    gemini_voice: str = "Puck"
    gemini_temperature: float = 0.7
    
    # NestJS API
    nestjs_api_url: str
    
    # Logging
    log_level: str = "INFO"
    
    CLASS Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Global config instance
config = Config()
```

***

### **TASK 3: Create NestJS API Client**

Create **`src/api_client.py`**:

**Pseudocode**:

```python
IMPORT httpx
IMPORT logging
FROM typing IMPORT Dict, List, Optional

CLASS NestJSClient:
    """Client for communicating with NestJS backend API"""
    
    CONSTRUCTOR(base_url: str):
        - Set self.base_url = base_url
        - Initialize httpx.AsyncClient with timeout=30s
        - Setup logger
    
    ASYNC METHOD get_interview_details(interview_id: str, room_name: str):
        """Fetch interview details with questions for agent"""
        
        INPUT: interview_id (UUID), room_name (string)
        OUTPUT: Interview dict with questions array
        
        LOGIC:
          - Build URL: /interviews/agent/{interview_id}?room_name={room_name}
          - Make GET request to NestJS
          - If 200:
            * Parse JSON response
            * Return interview data
          - If error:
            * Log error
            * Raise exception
          
          RETURN: {
            interview_id: UUID,
            job_role: string,
            difficulty: string,
            questions: [
              {id, content, difficulty, topic, order},
              ...
            ],
            completed_questions: number,
            status: string
          }
    
    ASYNC METHOD submit_answer(question_id: str, transcript: str, duration: float):
        """Submit user's answer transcript for evaluation"""
        
        INPUT: question_id (UUID), transcript (string), duration (seconds)
        OUTPUT: Answer dict with evaluation
        
        LOGIC:
          - Build URL: POST /answers
          - Payload: {
              question_id: question_id,
              transcript: transcript,
              duration_seconds: int(duration)
            }
          - Make POST request to NestJS
          - If 200:
            * Parse JSON response
            * Return answer with evaluation
          - If error:
            * Log error but don't fail (evaluation can happen async)
            * Return None
          
          RETURN: {
            id: UUID,
            score: number | null,
            feedback: string | null,
            evaluation_json: object | null
          }
    
    ASYNC METHOD complete_interview(interview_id: str):
        """Notify NestJS that interview is complete"""
        
        INPUT: interview_id (UUID)
        OUTPUT: Success boolean
        
        LOGIC:
          - Build URL: POST /interviews/{interview_id}/complete
          - Make POST request
          - Return success status
    
    ASYNC METHOD close():
        """Close HTTP client"""
        - await self.client.aclose()
```

***

### **TASK 4: Create Interview Orchestrator**

Create **`src/interview_orchestrator.py`**:

**Pseudocode**:

```python
IMPORT asyncio
IMPORT logging
FROM datetime IMPORT datetime
FROM typing IMPORT List, Dict, Optional
FROM livekit.agents IMPORT llm
FROM api_client IMPORT NestJSClient

CLASS InterviewOrchestrator:
    """Orchestrates the interview flow with questions and answers"""
    
    CONSTRUCTOR(
        nestjs_client: NestJSClient,
        assistant: llm.VoiceAssistant,
        room_name: str
    ):
        - Set self.nestjs_client = nestjs_client
        - Set self.assistant = assistant
        - Set self.room_name = room_name
        - Initialize logger
        
        - Set self.interview_data = None
        - Set self.current_question_index = 0
        - Set self.questions = []
        - Set self.interview_id = None
        - Set self.answer_start_time = None
    
    ASYNC METHOD initialize():
        """Fetch interview details from NestJS"""
        
        LOGIC:
          - Extract interview_id from room_name
            * Format: "interview-{uuid}"
            * Parse UUID from room name
          
          - Call nestjs_client.get_interview_details(
              interview_id,
              room_name
            )
          
          - Store interview data:
            * self.interview_id = interview_id
            * self.questions = interview_data['questions']
            * Sort questions by 'order' field
          
          - Log interview details:
            * Job role, difficulty, number of questions
          
          - Return success boolean
    
    ASYNC METHOD start_interview():
        """Begin the interview by asking first question"""
        
        LOGIC:
          - Greet user:
            * "Hello! I'm your AI interviewer today."
            * "We'll be conducting a {difficulty} level interview for {job_role}."
            * "I have {N} questions prepared. Please answer each question to the best of your ability."
            * "Let's begin!"
          
          - Wait 2 seconds
          - Call ask_next_question()
    
    ASYNC METHOD ask_next_question():
        """Ask the next question in sequence"""
        
        LOGIC:
          - Check if all questions answered:
            * IF current_question_index >= len(questions):
              - Call conclude_interview()
              - RETURN
          
          - Get current question:
            * question = self.questions[current_question_index]
          
          - Record start time:
            * self.answer_start_time = datetime.now()
          
          - Ask question through assistant:
            * Format: "Question {N}: {question.content}"
            * Use assistant.say(text)
          
          - Wait for user to finish speaking:
            * Turn detection handles this automatically
          
          - Log question asked
    
    METHOD on_user_speech_committed(transcript: str):
        """Called when user finishes speaking (turn detection)"""
        
        INPUT: transcript (complete user speech)
        
        LOGIC:
          - Calculate answer duration:
            * duration = (datetime.now() - answer_start_time).total_seconds()
          
          - Get current question:
            * question = self.questions[current_question_index]
          
          - Provide acknowledgment:
            * "Thank you. Let me note your answer."
          
          - Submit answer to NestJS:
            * ASYNC TASK: nestjs_client.submit_answer(
                question_id=question['id'],
                transcript=transcript,
                duration=duration
              )
            * Don't wait for evaluation (fire and forget)
          
          - Move to next question:
            * self.current_question_index += 1
          
          - Wait 1 second (natural pause)
          
          - Call ask_next_question()
    
    ASYNC METHOD conclude_interview():
        """Finish the interview"""
        
        LOGIC:
          - Thank user:
            * "Thank you for completing the interview!"
            * "That concludes all {N} questions."
            * "Your responses are being evaluated and you'll receive a detailed report shortly."
            * "Have a great day!"
          
          - Wait 2 seconds
          
          - Notify NestJS interview complete:
            * await nestjs_client.complete_interview(self.interview_id)
          
          - Disconnect from room:
            * await room.disconnect()
          
          - Log completion
    
    METHOD handle_error(error: Exception):
        """Handle errors gracefully"""
        
        LOGIC:
          - Log error with details
          - Inform user:
            * "I apologize, but we've encountered a technical issue."
            * "Please try again or contact support."
          - Attempt to disconnect gracefully
```

***

### **TASK 5: Create Main Agent**

Create **`src/agent.py`**:

**Pseudocode**:

```python
IMPORT asyncio
IMPORT logging
FROM livekit IMPORT rtc
FROM livekit.agents IMPORT (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm
)
FROM livekit.agents.voice_assistant IMPORT VoiceAssistant
FROM livekit.plugins IMPORT google, silero

FROM config IMPORT config
FROM api_client IMPORT NestJSClient
FROM interview_orchestrator IMPORT InterviewOrchestrator

# Setup logging
logging.basicConfig(level=config.log_level)
logger = logging.getLogger(__name__)


ASYNC FUNCTION entrypoint(ctx: JobContext):
    """Main agent entry point - called when agent joins a room"""
    
    LOGIC:
      - Log agent connection:
        * Room name: ctx.room.name
        * Participant count
      
      - Initialize NestJS client:
        * nestjs_client = NestJSClient(config.nestjs_api_url)
      
      - Wait for participant to join:
        * await ctx.wait_for_participant()
      
      - Configure Gemini Live API:
        * model = google.llm.LLM(
            model=config.gemini_model,
            api_key=config.google_api_key,
            voice=config.gemini_voice,
            temperature=config.gemini_temperature,
            instructions=[
              "You are a professional technical interviewer.",
              "Ask questions clearly and wait for complete answers.",
              "Be encouraging and professional.",
              "Do not interrupt the candidate.",
              "Acknowledge answers briefly before moving on."
            ]
          )
      
      - Setup turn detection (Silero VAD):
        * vad = silero.VAD.load(
            min_speech_duration=0.5,  # 500ms minimum speech
            min_silence_duration=1.0,  # 1s silence = done speaking
            padding_duration=0.3       # 300ms padding
          )
      
      - Create Voice Assistant:
        * assistant = VoiceAssistant(
            llm=model,
            vad=vad,
            allow_interruptions=False  # Don't interrupt user mid-answer
          )
      
      - Create Interview Orchestrator:
        * orchestrator = InterviewOrchestrator(
            nestjs_client=nestjs_client,
            assistant=assistant,
            room_name=ctx.room.name
          )
      
      - Initialize orchestrator:
        * success = await orchestrator.initialize()
        * IF not success:
          - Log error
          - Disconnect
          - RETURN
      
      - Setup event handlers:
        * assistant.on("user_speech_committed", orchestrator.on_user_speech_committed)
        * assistant.on("agent_started_speaking", lambda: logger.info("Agent speaking"))
        * assistant.on("agent_stopped_speaking", lambda: logger.info("Agent stopped"))
      
      - Start voice assistant:
        * assistant.start(ctx.room)
      
      - Start interview:
        * await orchestrator.start_interview()
      
      - Keep agent alive until interview done:
        * await assistant.aclose()
      
      - Cleanup:
        * await nestjs_client.close()
        * logger.info("Interview agent session ended")


IF __name__ == "__main__":
    """Run the agent as a worker"""
    
    LOGIC:
      - Setup CLI with worker options:
        * cli.run_app(
            WorkerOptions(
              entrypoint_fnc=entrypoint,
              api_key=config.livekit_api_key,
              api_secret=config.livekit_api_secret,
              ws_url=config.livekit_url
            )
          )
```

***

### **TASK 6: Create README**

Create **`README.md`**:

```markdown
# LiveKit Interview Agent

Python agent for conducting voice-based technical interviews using LiveKit and Gemini Live API.

## Prerequisites

- Python 3.13+ (recommended: 3.13)
- [uv](https://github.com/astral-sh/uv) - Modern Python package manager

## Setup

### 1. Install uv (if not already installed)

**macOS/Linux:**
```
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows:**
```
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Using pip:**
```
pip install uv
```

### 2. Install dependencies

```
# Navigate to agent directory
cd agent

# Create virtual environment and install all dependencies
uv sync

# Or install without dev dependencies
uv sync --no-dev
```

### 3. Configure environment

```
cp .env.example .env
# Edit .env with your credentials:
# - LiveKit URL, API Key, API Secret
# - Google Gemini API Key
# - NestJS API URL
```

### 4. Download Silero VAD models

```
uv run python -m livekit.plugins.silero download-models
```

## Running Locally

### Development mode (hot reload):
```
uv run python src/agent.py dev
```

### Production mode:
```
uv run python src/agent.py start
```

## Adding Dependencies

```
# Add production dependency
uv add <package-name>

# Add dev dependency
uv add --dev <package-name>

# Update all dependencies
uv sync --upgrade
```

## Deployment to LiveKit Cloud

### 1. Install LiveKit CLI

```
curl -sSL https://get.livekit.io/cli | bash
```

### 2. Deploy agent

```
livekit-cli deploy agent src/agent.py
```

## Architecture

- **agent.py**: Main entry point, sets up voice assistant
- **interview_orchestrator.py**: Manages interview flow and questions
- **api_client.py**: Communicates with NestJS backend
- **config.py**: Configuration management with Pydantic

## How It Works

1. Agent joins LiveKit room when user starts interview
2. Fetches interview questions from NestJS API
3. Uses Gemini Live API for natural voice conversation
4. Asks questions sequentially
5. Detects when user finishes speaking (Silero VAD)
6. Sends transcript to NestJS for evaluation
7. Moves to next question
8. Completes interview and notifies backend

## Development

### Code formatting
```
uv run black src/
```

### Linting
```
uv run ruff check src/
```

### Running tests
```
uv run pytest
```

## Troubleshooting

### Virtual environment not activated
uv automatically manages the virtual environment. Use `uv run` prefix for all commands.

### Dependency conflicts
```
# Reset and reinstall
rm -rf .venv uv.lock
uv sync
```

### Model download issues
```
# Manually download Silero VAD models
uv run python -m livekit.plugins.silero download-models --force
```
```

***

### **TASK 7: Error Handling & Edge Cases**

Add comprehensive error handling:

**Pseudocode for error scenarios**:

```python
ERROR HANDLING:

  CASE: NestJS API unreachable
    - Retry with exponential backoff (3 attempts)
    - If still fails:
      * Inform user: "Cannot connect to server"
      * Log error with details
      * Gracefully disconnect

  CASE: Invalid interview ID or room name
    - Log error
    - Inform user: "Interview not found"
    - Disconnect immediately

  CASE: Gemini API failure
    - Log error
    - Retry question (max 2 retries)
    - If still fails:
      * Skip to next question
      * Log which question failed

  CASE: User disconnects mid-interview
    - Save progress to NestJS
    - Mark interview as 'ABANDONED'
    - Clean up resources

  CASE: Network interruption
    - Attempt reconnection (automatic with LiveKit)
    - Resume from last completed question
    - If cannot recover: mark abandoned

  CASE: Silence timeout (user not speaking)
    - Wait 30 seconds
    - Prompt: "Are you still there?"
    - Wait another 30 seconds
    - If still silent: end interview

  CASE: LiveKit room already has agent
    - Check participant count
    - If agent already present: exit gracefully
    - Log duplicate agent attempt
```

***

### **TASK 8: Testing Locally**

Create test script **`test_agent.sh`**:

```bash
#!/bin/bash

# Test agent locally with development room

echo "Starting LiveKit Agent in development mode..."
echo "Agent will connect when a user joins a room"
echo ""
echo "Using uv for dependency management..."

# Ensure dependencies are installed
uv sync

# Run agent in dev mode
uv run python src/agent.py dev

# Agent will automatically connect to rooms matching pattern "interview-*"
```

Make executable:
```bash
chmod +x test_agent.sh
```

***

### **Deliverables**

✓ LiveKit Python Agent with Gemini Live API integration
✓ Modern dependency management using uv
✓ Interview orchestration logic (fetch questions, ask sequentially)
✓ Turn detection using Silero VAD
✓ NestJS API client for fetching/submitting data
✓ Error handling for all failure scenarios
✓ Comprehensive logging
✓ Configuration management with Pydantic Settings
✓ pyproject.toml for modern Python packaging
✓ README with uv-based setup and deployment instructions
✓ Graceful connection/disconnection handling

***

### **Acceptance Criteria**

✓ Agent connects to LiveKit rooms automatically
✓ uv manages all dependencies efficiently
✓ Fetches interview details from NestJS successfully
✓ Uses Gemini Live API for natural voice conversation
✓ Asks questions in correct order
✓ Detects when user finishes speaking (no manual stop needed)
✓ Submits transcripts to NestJS for evaluation
✓ Handles all questions in interview sequence
✓ Completes interview and notifies backend
✓ Graceful error handling (API failures, disconnections)
✓ Logs all important events for debugging
✓ Works with LiveKit Cloud and self-hosted
✓ Can be deployed using LiveKit CLI
✓ Audio quality is clear and low-latency (<500ms)
✓ Turn detection works reliably (no false triggers)
✓ Agent cleans up resources on completion
✓ `uv sync` installs all dependencies without issues
✓ `uv run` commands work correctly

***

**Key uv advantages used in this setup:**

1. **Fast dependency resolution** - 10-100x faster than pip
2. **Lockfile management** - Reproducible builds with `uv.lock`
3. **Virtual environment automation** - No manual activation needed
4. **Modern pyproject.toml** - Standard Python packaging
5. **Easy command execution** - `uv run` handles everything
6. **Dependency updates** - Simple `uv sync --upgrade`

***

## **What's NOT in Phase 2**

- ❌ Detailed interview reports with charts (Phase 3)
- ❌ AI-generated insights and recommendations (Phase 3)
- ❌ Performance trend analysis (Phase 3)
- ❌ PDF report generation (Phase 3)
- ❌ Interview retake with same questions (Phase 3)
- ❌ Advanced question caching (Phase 3)
- ❌ Adaptive difficulty mid-interview (basic version implemented, advanced in Phase 3)
- ❌ Background job processing for evaluations (Phase 4)
- ❌ Comprehensive testing suite (Phase 4)
- ❌ Production deployment configuration (Phase 4)

***

## **Next Steps for Phase 3**

Phase 3 will focus on:
1. **Comprehensive Reports** with charts and visualizations
2. **AI-Generated Insights** using Gemini for personalized feedback
3. **Performance Analytics** with trend analysis
4. **Question Categories** and scoring breakdowns
5. **Interview History** comparison and progress tracking

**End of Phase 2**