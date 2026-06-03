import { ConfigService } from '@nestjs/config';
import { CloudinaryStorageProvider } from './cloudinary.storage-provider';
import type { StorageProvider } from '../storage.types';

export function createStorageProvider(
  configService: ConfigService,
): StorageProvider {
  const provider = configService.get<string>('storage.provider') ?? 'cloudinary';

  switch (provider) {
    case 'cloudinary':
      return new CloudinaryStorageProvider(configService);
    default:
      throw new Error(
        `Unsupported storage provider "${provider}". Set STORAGE_PROVIDER=cloudinary.`,
      );
  }
}
