import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('answers')
@Controller('answers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @Public() // Allow agent to submit answers without JWT
  @ApiOperation({ summary: 'Submit an answer and trigger evaluation' })
  @ApiResponse({ status: 201, description: 'Answer submitted successfully' })
  async createAnswer(@Body() createDto: CreateAnswerDto) {
    // Validate question belongs to active interview
    const answer = await this.answersService.createAnswer(createDto);
    return { success: true, data: answer };
  }

  @Get('interview/:interviewId')
  @ApiOperation({ summary: 'Get all answers for an interview' })
  async getAnswersByInterview(
    @Param('interviewId', ParseUUIDPipe) interviewId: string,
    @CurrentUser() user: any,
  ) {
    return this.answersService.getAnswersByInterview(user.id, interviewId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific answer' })
  async getAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.answersService.getAnswerById(user.id, id);
  }
}
