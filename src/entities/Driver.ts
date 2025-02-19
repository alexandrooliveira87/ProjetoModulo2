import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("drivers")
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  full_address: string;

  @Column({ type: "varchar", length: 30, nullable: false })
  document: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;
}
