import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDriversTable1708365600003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "drivers",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "full_address", type: "varchar", length: "255", isNullable: true },
          { name: "document", type: "varchar", length: "30", isNullable: false },
          { name: "user_id", type: "int", isNullable: false }, // 🔹 Garantindo a FK correta
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      })
    );

    await queryRunner.createForeignKey(
      "drivers",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("drivers");
  }
}
