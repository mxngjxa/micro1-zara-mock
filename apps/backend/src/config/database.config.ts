import { DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Interview } from '../database/entities/interview.entity';
import { Question } from '../database/entities/question.entity';
import { Answer } from '../database/entities/answer.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'interview_db',
  entities: [User, Interview, Question, Answer],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
