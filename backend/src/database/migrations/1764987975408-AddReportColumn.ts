import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportColumn1764987975408 implements MigrationInterface {
  name = 'AddReportColumn1764987975408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if updated_at already exists on questions
    const hasUpdatedAt = await queryRunner.hasColumn('questions', 'updated_at');
    if (!hasUpdatedAt) {
      await queryRunner.query(
        `ALTER TABLE "questions" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
      );
    }

    // Check if report already exists on interviews
    const hasReport = await queryRunner.hasColumn('interviews', 'report');
    if (!hasReport) {
      await queryRunner.query(`ALTER TABLE "interviews" ADD "report" jsonb`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "interviews" DROP COLUMN "report"`);
    await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "updated_at"`);
  }
}
