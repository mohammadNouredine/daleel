/**
 * Extracts the database name from a MongoDB connection URI.
 * Preserves exact casing (e.g. "Daleel" vs "daleel").
 */
export function getDatabaseNameFromUri(uri: string): string {
  const withoutOptions = uri.split('?')[0] ?? uri;
  const segments = withoutOptions.split('/').filter(Boolean);

  // mongodb+srv://host/db  OR  mongodb://host:port/db
  const dbSegment = segments[segments.length - 1];

  if (!dbSegment || dbSegment.includes('@') || dbSegment.includes(':')) {
    return 'test';
  }

  return dbSegment;
}
