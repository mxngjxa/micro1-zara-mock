import {
  IsUUID,
  IsString,
  MinLength,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  question_id!: string;

  @ApiProperty({ example: 'React hooks allow you to use state...' })
  @IsString()
  @MinLength(10)
  transcript!: string;

  @ApiProperty({ example: 45, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration_seconds?: number;
}
