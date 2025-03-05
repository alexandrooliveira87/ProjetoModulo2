
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMovementsTableYYYYMMDDHHMMSS implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "movements",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "destination_branch_id", type: "int", isNullable: false },
          { name: "product_id", type: "int", isNullable: false },
          { name: "driver_id", type: "int", isNullable: true },
          { name: "quantity", type: "int", isNullable: false },
          {
            name: "status",
            type: "enum",
            enum: ["PENDING", "IN_PROGRESS", "FINISHED"],
            default: "'PENDING'",
          },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      })
    );

    // 🔹 Criando chaves estrangeiras
    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        columnNames: ["destination_branch_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "branches",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        columnNames: ["product_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "products",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        columnNames: ["driver_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "drivers",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("movements");
  }
}
