import { IsString, IsEnum, IsArray, IsNumber, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInterviewDto {
  @ApiProperty({ example: 'Senior React Developer' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  job_role!: string;
  
  @ApiProperty({ example: 'SENIOR', enum: ['JUNIOR', 'MID', 'SENIOR'] })
  @IsEnum(['JUNIOR', 'MID', 'SENIOR'])
  difficulty!: string;
  
  @ApiProperty({ example: ['React', 'TypeScript', 'Performance'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  topics!: string[];
  
  @ApiProperty({ example: 5, minimum: 5, maximum: 20 })
  @IsNumber()
  @Min(5)
  @Max(20)
  total_questions!: number;
}
