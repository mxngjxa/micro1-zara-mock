import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTokenDto {
  @ApiProperty({ example: 'interview-123' })
  @IsString()
  roomName!: string;
}
