import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Branch } from "./Branch";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 200, nullable: false })
  name: string;

  @Column({ type: "int", nullable: false })
  amount: number;

  @Column({ type: "varchar", length: 200, nullable: false })
  description: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  url_cover: string;

  @ManyToOne(() => Branch, (branch) => branch.products, { onDelete: "CASCADE" })
  @JoinColumn({ name: "branch_id" }) 
  branch: Branch;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;
}
