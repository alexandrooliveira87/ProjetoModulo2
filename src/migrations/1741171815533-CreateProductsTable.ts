import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProductsTableYYYYMMDDHHMMSS implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "name", type: "varchar", length: "200", isNullable: false },
          { name: "amount", type: "int", isNullable: false },
          { name: "description", type: "varchar", length: "200", isNullable: false },
          { name: "url_cover", type: "varchar", length: "200", isNullable: true },
          { name: "branch_id", type: "int", isNullable: false },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
        foreignKeys: [
          {
            columnNames: ["branch_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "branches",
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("products");
  }
}
