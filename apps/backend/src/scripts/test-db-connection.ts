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

/**
 * Attempts to initialize the configured TypeORM DataSource and then close it, logging the outcome.
 *
 * Initializes the global `dataSource` to verify database connectivity; logs a success message on successful connection
 * or an error message if initialization fails, and ensures the data source is destroyed afterward.
 */
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