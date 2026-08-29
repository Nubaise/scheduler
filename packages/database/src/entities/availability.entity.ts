import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Faculty } from './faculty.entity.js';

@Index(['facultyId', 'startsAt'])
@Check('"starts_at" < "ends_at"')
@Entity({ name: 'availability' })
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'faculty_id' })
  faculty!: Faculty;

  @Column({ name: 'faculty_id', type: 'uuid' })
  facultyId!: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({ type: 'varchar', length: 20 })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}