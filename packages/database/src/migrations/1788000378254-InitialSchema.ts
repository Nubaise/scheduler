import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788000378254 implements MigrationInterface {
    name = 'InitialSchema1788000378254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3" UNIQUE ("code"), CONSTRAINT "UQ_8681da666ad9699d568b3e91064" UNIQUE ("name"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(320) NOT NULL, "name" character varying(255) NOT NULL, "role" character varying(20) NOT NULL, "status" character varying(20) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "faculty" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "department_id" uuid NOT NULL, "status" character varying(20) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_8bfeeeb1ddee46f095f5181f8c" UNIQUE ("user_id"), CONSTRAINT "PK_635ca3484f9c747b6635a494ad9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" uuid NOT NULL, "faculty_id" uuid NOT NULL, "requested_start" TIMESTAMP WITH TIME ZONE NOT NULL, "requested_end" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(30) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_1cf60fa5b34be5befb538b3129" CHECK ("requested_start" < "requested_end"), CONSTRAINT "PK_a54d411a88f1ed6fa9376ca5247" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "alternative_proposals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointment_request_id" uuid NOT NULL, "proposed_start" TIMESTAMP WITH TIME ZONE NOT NULL, "proposed_end" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(30) NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_9eaa9ac2ba45b7803244a5fdb1" CHECK ("proposed_start" < "proposed_end"), CONSTRAINT "PK_e52cdbe1352230172817cde7e8a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointment_request_id" uuid NOT NULL, "student_id" uuid NOT NULL, "faculty_id" uuid NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(30) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_ed3e56ef215a1350f282aa4b71" UNIQUE ("appointment_request_id"), CONSTRAINT "CHK_a867d5bc11430ed627cd8f2413" CHECK ("starts_at" < "ends_at"), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "availability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "faculty_id" uuid NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(20) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_6354f974db78bcceb0ca74eee5" CHECK ("starts_at" < "ends_at"), CONSTRAINT "PK_05a8158cf1112294b1c86e7f1d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "faculty" ADD CONSTRAINT "FK_8bfeeeb1ddee46f095f5181f8cc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "faculty" ADD CONSTRAINT "FK_008d2d8e1cfff7ed33b6c4029bf" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment_requests" ADD CONSTRAINT "FK_9fe74c3992bc0598e4d63535422" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment_requests" ADD CONSTRAINT "FK_3442260d88fc8e0196ee7d16cba" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alternative_proposals" ADD CONSTRAINT "FK_25de4b6e84c9c6d6d944e289b59" FOREIGN KEY ("appointment_request_id") REFERENCES "appointment_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alternative_proposals" ADD CONSTRAINT "FK_4f99d1275c250c69d11a9c7c8ca" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_ed3e56ef215a1350f282aa4b712" FOREIGN KEY ("appointment_request_id") REFERENCES "appointment_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_d62d6bb36d87c9ad5eddfabc098" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_11e20e5e2867a2110f3125f321f" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "availability" ADD CONSTRAINT "FK_4b98727245e4442feea9633f964" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "availability" DROP CONSTRAINT "FK_4b98727245e4442feea9633f964"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_11e20e5e2867a2110f3125f321f"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_d62d6bb36d87c9ad5eddfabc098"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_ed3e56ef215a1350f282aa4b712"`);
        await queryRunner.query(`ALTER TABLE "alternative_proposals" DROP CONSTRAINT "FK_4f99d1275c250c69d11a9c7c8ca"`);
        await queryRunner.query(`ALTER TABLE "alternative_proposals" DROP CONSTRAINT "FK_25de4b6e84c9c6d6d944e289b59"`);
        await queryRunner.query(`ALTER TABLE "appointment_requests" DROP CONSTRAINT "FK_3442260d88fc8e0196ee7d16cba"`);
        await queryRunner.query(`ALTER TABLE "appointment_requests" DROP CONSTRAINT "FK_9fe74c3992bc0598e4d63535422"`);
        await queryRunner.query(`ALTER TABLE "faculty" DROP CONSTRAINT "FK_008d2d8e1cfff7ed33b6c4029bf"`);
        await queryRunner.query(`ALTER TABLE "faculty" DROP CONSTRAINT "FK_8bfeeeb1ddee46f095f5181f8cc"`);
        await queryRunner.query(`DROP TABLE "availability"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TABLE "alternative_proposals"`);
        await queryRunner.query(`DROP TABLE "appointment_requests"`);
        await queryRunner.query(`DROP TABLE "faculty"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "departments"`);
    }

}
