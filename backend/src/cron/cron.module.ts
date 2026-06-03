import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PropertyListingsModule } from '../modules/property-listings/property-listings.module';
import { AppCronJobsService } from './app-cron-jobs.service';

@Module({
  imports: [ScheduleModule.forRoot(), PropertyListingsModule],
  providers: [AppCronJobsService],
})
export class CronModule {}
