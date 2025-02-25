import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1708365600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "name", type: "varchar", length: "200", isNullable: false },
          { name: "profile", type: "enum", enum: ["DRIVER", "BRANCH", "ADMIN"], isNullable: false },
          { name: "email", type: "varchar", length: "150", isUnique: true, isNullable: false },
          { name: "password_hash", type: "varchar", length: "150", isNullable: false },
          { name: "status", type: "boolean", default: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
