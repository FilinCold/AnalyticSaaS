/** Manual analyze cooldown per Research (DECISIONS MVP rate limit). */
export const MANUAL_COOLDOWN_MS = 5 * 60 * 1000;

/** Calendar days before scheduled refresh (BACKGROUND_JOBS / Flow A2). */
export const SCHEDULE_REFRESH_DAYS = 3;

/** Inngest cron: daily 03:00 UTC. */
export const SCHEDULE_REFRESH_CRON = '0 3 * * *';
