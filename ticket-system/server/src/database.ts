import { DataSource, DataSourceOptions } from 'typeorm';
import { Bulletin, Category, Channel, Faq, FormField, Message, Notification, Phrase, Satisfaction, Setting, SlaPolicy, Ticket, TicketLog, User } from './entities';

export const DB_CONFIG: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ticket_system',
  entities: [User, Category, Ticket, Message, TicketLog, Faq, Bulletin, Phrase, FormField, Satisfaction, Notification, Channel, SlaPolicy, Setting],
  synchronize: true,
  charset: 'utf8mb4',
};

export const AppDataSource = new DataSource(DB_CONFIG);
