import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('interviews')
@Controller('interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new interview with questions' })
  async createInterview(
    @CurrentUser() user: any,
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
    @CurrentUser() user: any,
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
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserInterviews(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const result = await this.interviewsService.getUserInterviews(
      user.id,
      status,
      Number(page),
      Number(limit)
    );
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview details with Q&A' })
  async getInterview(
    @CurrentUser() user: any,
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
    @CurrentUser() user: any,
    @Param('id') interviewId: string
  ) {
    const interview = await this.interviewsService.completeInterview(
      user.id,
      interviewId
    );
    return { success: true, data: interview };
  }

  // AGENT ENDPOINT (No auth required - secured by room validation logic conceptually, usually would use API Key)
  @Public()
  @Get('agent/:id')
  @ApiOperation({ summary: 'Get interview details for agent' })
  @ApiQuery({ name: 'room_name', required: true })
  async getInterviewForAgent(
    @Param('id', ParseUUIDPipe) interviewId: string,
    @Query('room_name') roomName: string
  ) {
    if (!roomName) {
      throw new BadRequestException('room_name is required');
    }
    const interview = await this.interviewsService.getInterviewForAgent(
      interviewId,
      roomName
    );
    return { success: true, data: interview };
  }
}
