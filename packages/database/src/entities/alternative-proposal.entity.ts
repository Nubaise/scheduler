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
import { AppointmentRequest } from './appointment-request.entity.js';
import { User } from './user.entity.js';

@Index(['appointmentRequestId'])
@Check('"proposed_start" < "proposed_end"')
@Entity({ name: 'alternative_proposals' })
export class AlternativeProposal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => AppointmentRequest)
  @JoinColumn({ name: 'appointment_request_id' })
  appointmentRequest!: AppointmentRequest;

  @Column({ name: 'appointment_request_id', type: 'uuid' })
  appointmentRequestId!: string;

  @Column({ name: 'proposed_start', type: 'timestamptz' })
  proposedStart!: Date;

  @Column({ name: 'proposed_end', type: 'timestamptz' })
  proposedEnd!: Date;

  @Column({ type: 'varchar', length: 30 })
  status!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}