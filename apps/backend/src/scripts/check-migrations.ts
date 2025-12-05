import { DataSource, QueryRunner } from 'typeorm';
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
 * Connects to the configured database, inspects the 'migrations' table, logs its rows if present, lists public schema tables, and closes the connection.
 *
 * Any errors encountered during these checks are logged. */
async function checkMigrations() {
  let runner: QueryRunner | undefined;

  try {
    await dataSource.initialize();
    console.log('Connected to database.');

    // Check migrations table
    runner = dataSource.createQueryRunner();
    const migrationsTableExists = await runner.hasTable('migrations');
    
    if (migrationsTableExists) {
        const migrations = await runner.query('SELECT * FROM migrations');
        console.log('Executed migrations:', migrations);
    } else {
        console.log('Migrations table does not exist.');
    }

    // Check content tables
    const tables = await runner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
    console.log('Tables in database:', tables.map((t: any) => t.table_name));
    
  } catch (error) {
    console.error('Error checking migrations:', error);
    process.exitCode = 1;
  } finally {
    if (runner) {
      await runner.release();
    }
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

checkMigrations();