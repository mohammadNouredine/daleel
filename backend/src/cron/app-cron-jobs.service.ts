import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PropertyListingsService } from '../modules/property-listings/property-listings.service';
import { EACH_DAY_AT_12_00_AM } from './cron-schedules';

/**
 * All scheduled tasks for the application live in this file only.
 * Add new jobs here with a numbered comment block (schedule, description, handler).
 */
@Injectable()
export class AppCronJobsService {
  private readonly logger = new Logger(AppCronJobsService.name);

  constructor(
    private readonly propertyListingsService: PropertyListingsService,
    private readonly configService: ConfigService,
  ) {}

  // @Cron 1
  // description: Permanently remove property listings that were soft-deleted 30+ days ago (database and Cloudinary assets).
  // time: EACH_DAY_AT_12_00_AM
  @Cron(EACH_DAY_AT_12_00_AM)
  async deleteOldDeletedProperties(): Promise<void> {
    const retentionDays = this.configService.get<number>(
      'propertyListings.softDeleteRetentionDays',
    );

    try {
      const { purgedCount } =
        await this.propertyListingsService.purgeSoftDeletedPropertyListingsOlderThan(
          retentionDays,
        );

      if (purgedCount > 0) {
        this.logger.log(
          `Purged ${purgedCount} soft-deleted property listing(s) older than ${retentionDays ?? 30} day(s).`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to purge old soft-deleted property listings',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
