import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Branch } from "./Branch";
import { Product } from "./Product";
import { Driver } from "./Driver";

@Entity("movements")
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "destination_branch_id" })
  destination_branch: Branch;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: "driver_id" })
  driver: Driver;

  @Column({ type: "int", nullable: false })
  quantity: number;

  @Column({
    type: "enum",
    enum: ["PENDING", "IN_PROGRESS", "FINISHED"],
    default: "PENDING",
  })
  status: "PENDING" | "IN_PROGRESS" | "FINISHED";

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;
}
