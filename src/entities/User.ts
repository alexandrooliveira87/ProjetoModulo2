import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Driver } from "./Driver";
import { Branch } from "./Branch";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 200, nullable: false })
  name: string;

  @Column({ type: "enum", enum: ["DRIVER", "BRANCH", "ADMIN"], nullable: false })
  profile: "DRIVER" | "BRANCH" | "ADMIN";

  @Column({ type: "varchar", length: 150, unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 150, nullable: false, select: false }) 
  password_hash: string;

  @Column({ type: "boolean", default: true })
  status: boolean;

  // 🔹 Relacionamento com a tabela de Motoristas (Opcional)
  @OneToOne(() => Driver, (driver) => driver.user, { nullable: true })
  driver?: Driver;

  // 🔹 Relacionamento com a tabela de Filiais (Opcional)
  @OneToOne(() => Branch, (branch) => branch.user, { nullable: true })
  branch?: Branch;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;
}
