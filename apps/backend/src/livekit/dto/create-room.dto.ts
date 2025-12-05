import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'interview-123' })
  @IsString()
  roomName!: string;

  @ApiProperty({ example: 300, description: 'Empty timeout in seconds', required: false })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  emptyTimeout?: number;
}