import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { BulletinsModule } from './bulletins/bulletins.module';
import { CategoriesModule } from './categories/categories.module';
import { ChannelsModule } from './channels/channels.module';
import { JwtAuthGuard, RolesGuard } from './common/guards';
import { DB_CONFIG } from './database';
import { FaqsModule } from './faqs/faqs.module';
import { FormsModule } from './forms/forms.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PhrasesModule } from './phrases/phrases.module';
import { RealtimeModule } from './realtime/realtime.module';
import { SatisfactionsModule } from './satisfactions/satisfactions.module';
import { SettingsModule } from './settings/settings.module';
import { StatsModule } from './stats/stats.module';
import { SystemModule } from './system/system.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(DB_CONFIG),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'ticket-system-dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    TicketsModule,
    FaqsModule,
    BulletinsModule,
    PhrasesModule,
    StatsModule,
    AiModule,
    RealtimeModule,
    NotificationsModule,
    ChannelsModule,
    SatisfactionsModule,
    FormsModule,
    SettingsModule,
    SystemModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
