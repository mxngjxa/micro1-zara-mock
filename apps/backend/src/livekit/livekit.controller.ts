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
      participantId: user.id,
    });

    return {
      success: true,
      data: {
        token,
        url: this.livekitService.getLiveKitUrl(),
      },
    };
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create LiveKit room' })
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    const room = await this.livekitService.createRoom(
      createRoomDto.roomName,
      createRoomDto.emptyTimeout,
    );

    return {
      success: true,
      data: room,
    };
  }

  @Get('rooms')
  @ApiOperation({ summary: 'List all active rooms' })
  async listRooms() {
    const rooms = await this.livekitService.listRooms();

    return {
      success: true,
      data: rooms,
    };
  }

  @Get('rooms/:roomName')
  @ApiOperation({ summary: 'Get room information' })
  async getRoomInfo(@Param('roomName') roomName: string) {
    const room = await this.livekitService.getRoomInfo(roomName);

    return {
      success: true,
      data: room,
    };
  }

  @Delete('rooms/:roomName')
  @ApiOperation({ summary: 'Delete LiveKit room' })
  async deleteRoom(@Param('roomName') roomName: string) {
    await this.livekitService.deleteRoom(roomName);

    return {
      success: true,
      message: `Room ${roomName} deleted`,
    };
  }
}
