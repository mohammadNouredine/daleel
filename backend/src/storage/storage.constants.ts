export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export type AcceptedImageMimeType = (typeof ACCEPTED_IMAGE_MIME_TYPES)[number];

/** Max single image upload size (10 MB). */
export const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
