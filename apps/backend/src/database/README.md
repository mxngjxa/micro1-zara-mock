# Database Schema & Setup

This directory contains the TypeORM entities, migrations, and configuration for the interview platform's PostgreSQL database.

## Entities

### User (`users`)
Represents a registered user of the platform.
- **id**: UUID (Primary Key)
- **email**: User's email address (Unique, Indexed)
- **password_hash**: Hashed password
- **email_verified**: Boolean flag for email verification
- **interviews**: One-to-Many relationship with Interview entity

### Interview (`interviews`)
Represents a technical interview session.
- **id**: UUID (Primary Key)
- **user_id**: Foreign Key to User
- **status**: Enum (PENDING, IN_PROGRESS, COMPLETED, ABANDONED)
- **difficulty**: Enum (JUNIOR, MID, SENIOR)
- **questions**: One-to-Many relationship with Question entity
- **started_at**: Timestamp (Indexed)

### Question (`questions`)
Represents a specific question within an interview.
- **id**: UUID (Primary Key)
- **interview_id**: Foreign Key to Interview
- **content**: The text of the question
- **difficulty**: Enum (EASY, MEDIUM, HARD)
- **answer**: One-to-One relationship with Answer entity

### Answer (`answers`)
Represents the user's audio/transcript response to a question.
- **id**: UUID (Primary Key)
- **question_id**: Foreign Key to Question
- **transcript**: Text transcript of the answer
- **score**: Numerical score (Indexed)
- **audio_url**: URL to the stored audio file

## Relationships Diagram

```mermaid
erDiagram
    User ||--o{ Interview : "has many"
    Interview ||--o{ Question : "contains many"
    Question ||--|| Answer : "has one"
```

## Migrations

Migrations are managed using TypeORM CLI.

### Running Migrations

To apply pending migrations to the database:

```bash
npm run migration:run
```

### Reverting Migrations

To revert the last applied migration:

```bash
npm run migration:revert
```

### Generating New Migrations

After modifying entity files, generate a new migration file:

```bash
npm run migration:generate -- -n MigrationName
```

## Connection

The database connection is configured in `src/config/database.config.ts` and uses environment variables from `.env`.

- **Host**: `DATABASE_HOST`
- **Port**: `DATABASE_PORT`
- **User**: `DATABASE_USER`
- **Password**: `DATABASE_PASSWORD`
- **Database**: `DATABASE_NAME`

## Seeding

To seed the database with a test user:

```bash
npx ts-node src/scripts/seed.ts