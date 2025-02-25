import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

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

  @Column({ type: "varchar", length: 150, nullable: false, select: false }) // 🔹 Adicione "select: false"
  password_hash: string;

  @Column({ type: "boolean", default: true })
  status: boolean;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;
}
