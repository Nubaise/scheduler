import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppointmentRequest } from './appointment-request.entity.js';
import { Faculty } from './faculty.entity.js';
import { User } from './user.entity.js';

@Check('"starts_at" < "ends_at"')
@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => AppointmentRequest)
  @JoinColumn({ name: 'appointment_request_id' })
  appointmentRequest!: AppointmentRequest;

  @Column({ name: 'appointment_request_id', type: 'uuid'})
  appointmentRequestId!: string;

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

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({ type: 'varchar', length: 30 })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}