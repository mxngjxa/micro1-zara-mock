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
 * Fetches the names of tables in the `public` schema of the configured PostgreSQL database and logs them.
 *
 * Initializes the TypeORM data source, queries `information_schema.tables` for `public`-schema table names, logs the retrieved names, and closes the data source. Errors encountered during the process are logged to the console.
 */
async function checkTables() {
  try {
    await dataSource.initialize();
    console.log('Connected to database.');

    const queryRunner = dataSource.createQueryRunner();
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log(
      'Tables in database:',
      tables.map((t: any) => t.table_name),
    );

    await dataSource.destroy();
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();
