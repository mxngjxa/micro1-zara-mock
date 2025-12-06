import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1764954724269 implements MigrationInterface {
  name = 'InitialSchema1764954724269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "transcript" text NOT NULL, "audio_url" character varying, "evaluation_json" jsonb, "feedback" text, "score" numeric(5,2), "confidence_score" numeric(5,2), "duration_seconds" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_677120094cf6d3f12df0b9dc5d" UNIQUE ("question_id"), CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_answer_score" ON "answers" ("score") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_answer_question" ON "answers" ("question_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."questions_difficulty_enum" AS ENUM('EASY', 'MEDIUM', 'HARD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "interview_id" uuid NOT NULL, "content" text NOT NULL, "expected_answer" text, "difficulty" "public"."questions_difficulty_enum" NOT NULL, "topic" character varying(100) NOT NULL, "order" integer NOT NULL, "evaluation_criteria" jsonb, "time_limit_seconds" integer, "gemini_prompt" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_question_interview_order" ON "questions" ("interview_id", "order") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."interviews_difficulty_enum" AS ENUM('JUNIOR', 'MID', 'SENIOR')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."interviews_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "interviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "job_role" character varying(100) NOT NULL, "difficulty" "public"."interviews_difficulty_enum" NOT NULL, "topics" text NOT NULL, "status" "public"."interviews_status_enum" NOT NULL DEFAULT 'PENDING', "overall_score" numeric(5,2), "performance_trend" character varying, "completed_questions" integer NOT NULL DEFAULT '0', "total_questions" integer NOT NULL, "duration_minutes" integer, "started_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_interview_started_at" ON "interviews" ("started_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_interview_user_status" ON "interviews" ("user_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "verification_token" character varying, "reset_token" character varying, "reset_token_expires" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "last_login" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_created_at" ON "users" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_email" ON "users" ("email") `,
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "FK_677120094cf6d3f12df0b9dc5d3" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_6024b110ce4990aa1feb1386e0e" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD CONSTRAINT "FK_b6fa4e1fab2f948fb14c736cd7a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_b6fa4e1fab2f948fb14c736cd7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_6024b110ce4990aa1feb1386e0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "FK_677120094cf6d3f12df0b9dc5d3"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_user_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_created_at"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_interview_user_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_interview_started_at"`);
    await queryRunner.query(`DROP TABLE "interviews"`);
    await queryRunner.query(`DROP TYPE "public"."interviews_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."interviews_difficulty_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_question_interview_order"`,
    );
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TYPE "public"."questions_difficulty_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_answer_question"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_answer_score"`);
    await queryRunner.query(`DROP TABLE "answers"`);
  }
}
