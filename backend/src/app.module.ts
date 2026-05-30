import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { HelpRequestsModule } from './modules/help-requests/help-requests.module';
import { HelpUpdatesModule } from './modules/help-updates/help-updates.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: '2mb' },
        urlencoded: { limit: '2mb', extended: true },
      },
    }),
    UsersModule,
    ReferenceModule,
    HelpRequestsModule,
    HelpUpdatesModule,
    ReportsModule,
  ],
})
export class AppModule {}
