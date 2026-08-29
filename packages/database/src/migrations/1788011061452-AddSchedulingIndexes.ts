import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchedulingIndexes1788011061452 implements MigrationInterface {
    name = 'AddSchedulingIndexes1788011061452'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_c96e9f035686eb0d9ecc46160a" ON "appointment_requests"  ("student_id", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_d6667aa4ecb6bd8c89f8943b40" ON "appointment_requests"  ("faculty_id", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_25de4b6e84c9c6d6d944e289b5" ON "alternative_proposals"  ("appointment_request_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_27e83100fe6780c493e682be62" ON "appointments"  ("student_id", "starts_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_770344b675118cc6a6ded9f6c4" ON "appointments"  ("faculty_id", "starts_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_04df32e598f843b5829ab29a7e" ON "availability"  ("faculty_id", "starts_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_04df32e598f843b5829ab29a7e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_770344b675118cc6a6ded9f6c4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_27e83100fe6780c493e682be62"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_25de4b6e84c9c6d6d944e289b5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d6667aa4ecb6bd8c89f8943b40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c96e9f035686eb0d9ecc46160a"`);
    }

}
