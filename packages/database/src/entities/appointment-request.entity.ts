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
import { User } from './user.entity.js';

@Index(['facultyId', 'status'])
@Index(['studentId', 'status'])
@Check('"requested_start" < "requested_end"')
@Entity({ name: 'appointment_requests' })
export class AppointmentRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'faculty_id' })
  faculty!: Faculty;

  @Column({ name: 'faculty_id', type: 'uuid' })
  facultyId!: string;

  @Column({ name: 'requested_start', type: 'timestamptz' })
  requestedStart!: Date;

  @Column({ name: 'requested_end', type: 'timestamptz' })
  requestedEnd!: Date;

  @Column({ type: 'varchar', length: 30 })
  status!: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}