import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type UserRole = 'customer' | 'staff' | 'manager';
export type TicketStatus = 'pending' | 'processing' | 'waiting' | 'closed';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 64 })
  account: string;

  @Column({ length: 128, select: false })
  password: string;

  @Column({ length: 64 })
  name: string;

  @Column({ length: 32, nullable: true })
  phone: string | null;

  @Column({ length: 128, nullable: true })
  company: string | null;

  @Column({ type: 'enum', enum: ['customer', 'staff', 'manager'], default: 'customer' })
  role: UserRole;

  @Column({ type: 'int', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  name: string;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'int', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 32 })
  no: string;

  @Column({ length: 128 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number | null;

  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customerId: number | null;

  @Column({ name: 'staff_id', type: 'int', nullable: true })
  staffId: number | null;

  @Column({ type: 'enum', enum: ['pending', 'processing', 'waiting', 'closed'], default: 'pending' })
  status: TicketStatus;

  @Column({ type: 'enum', enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' })
  priority: 'low' | 'normal' | 'high' | 'urgent';

  @Column({ name: 'field_values', type: 'text', nullable: true })
  fieldValues: string | null;

  @Column({ length: 16, default: 'web' })
  channel: string;

  @Column({ name: 'sla_response_at', type: 'datetime', nullable: true })
  slaResponseAt: Date | null;

  @Column({ name: 'sla_resolve_at', type: 'datetime', nullable: true })
  slaResolveAt: Date | null;

  @Column({ name: 'closed_at', type: 'datetime', nullable: true })
  closedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_id', type: 'int' })
  ticketId: number;

  @Column({ name: 'sender_id', type: 'int', nullable: true })
  senderId: number | null;

  @Column({ name: 'sender_type', type: 'enum', enum: ['customer', 'staff', 'system'], default: 'customer' })
  senderType: 'customer' | 'staff' | 'system';

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('ticket_logs')
export class TicketLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_id', type: 'int' })
  ticketId: number;

  @Column({ name: 'operator_id', type: 'int', nullable: true })
  operatorId: number | null;

  @Column({ length: 32 })
  action: string;

  @Column({ type: 'text', nullable: true })
  detail: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 128 })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'int', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('bulletins')
export class Bulletin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 128 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('phrases')
export class Phrase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'int', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('form_fields')
export class FormField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  label: string;

  @Column({ length: 32 })
  type: string;

  @Column({ type: 'int', default: 0 })
  required: number;

  @Column({ type: 'text', nullable: true })
  options: string | null;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'int', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('satisfactions')
export class Satisfaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_id', type: 'int', unique: true })
  ticketId: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ length: 32 })
  type: string;

  @Column({ length: 128 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ length: 16, default: 'inapp' })
  channel: string;

  @Column({ length: 128, nullable: true })
  link: string | null;

  @Column({ type: 'int', default: 0 })
  isRead: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, unique: true })
  type: string;

  @Column({ length: 64 })
  name: string;

  @Column({ type: 'int', default: 1 })
  enabled: number;

  @Column({ type: 'text', nullable: true })
  config: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('sla_policies')
export class SlaPolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 16, unique: true })
  priority: string;

  @Column({ type: 'int', default: 8 })
  responseHours: number;

  @Column({ type: 'int', default: 24 })
  resolveHours: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
