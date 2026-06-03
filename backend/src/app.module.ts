import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { HelpRequestsModule } from './modules/help-requests/help-requests.module';
import { HelpUpdatesModule } from './modules/help-updates/help-updates.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { PropertyListingsModule } from './modules/property-listings/property-listings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    StorageModule,
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: '2mb' },
        urlencoded: { limit: '2mb', extended: true },
      },
    }),
    UsersModule,
    ReferenceModule,
    UploadsModule,
    HelpRequestsModule,
    HelpUpdatesModule,
    ReportsModule,
    PropertyListingsModule,
  ],
})
export class AppModule {}
