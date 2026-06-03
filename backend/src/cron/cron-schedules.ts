/**
 * Human-readable cron expressions for {@link AppCronJobsService}.
 * Server uses the process timezone unless configured otherwise.
 */

/** Every day at 12:00 AM (midnight). */
export const EACH_DAY_AT_12_00_AM = '0 0 * * *';

/** Every 12 hours (00:00 and 12:00). */
export const EACH_12_HOURS = '0 */12 * * *';
