import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'interview_db',
});

async function testConnection() {
  try {
    await dataSource.initialize();
    console.log('Successfully connected to the database!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

testConnection();