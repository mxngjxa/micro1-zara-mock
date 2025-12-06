import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportColumn1764987948340 implements MigrationInterface {
  name = 'AddReportColumn1764987948340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "interviews" ADD "report" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "interviews" DROP COLUMN "report"`);
    await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "updated_at"`);
  }
}
