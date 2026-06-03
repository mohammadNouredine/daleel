import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MAX_IMAGE_FILE_SIZE_BYTES } from '../storage.constants';

export function createImageUploadInterceptor(maxCount: number) {
  return FilesInterceptor('files', maxCount, {
    storage: memoryStorage(),
    limits: { fileSize: MAX_IMAGE_FILE_SIZE_BYTES },
  });
}
