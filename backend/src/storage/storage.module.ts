import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createStorageProvider } from './providers/storage-provider.factory';
import { StorageService } from './storage.service';
import { STORAGE_PROVIDER } from './storage.types';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: (configService: ConfigService) =>
        createStorageProvider(configService),
      inject: [ConfigService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
