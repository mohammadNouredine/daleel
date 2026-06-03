import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  type AcceptedImageMimeType,
} from './storage.constants';
import { STORAGE_PROVIDER } from './storage.types';
import type {
  StorageFolder,
  StorageProvider,
  StoredFile,
  UploadFileInput,
} from './storage.types';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly provider: StorageProvider,
  ) {}

  isManagedUrl(url: string): boolean {
    return this.provider.isManagedUrl(url);
  }

  async uploadFilesFromMulter(
    files: Express.Multer.File[] | undefined,
    folder: StorageFolder,
  ): Promise<string[]> {
    const stored = await this.uploadMulterFiles(files, folder);
    return stored.map((file) => file.url);
  }

  async uploadMulterFiles(
    files: Express.Multer.File[] | undefined,
    folder: StorageFolder,
  ): Promise<StoredFile[]> {
    const list = files ?? [];
    if (!list.length) {
      return [];
    }

    const inputs = list.map((file) => this.toUploadInput(file, folder));
    return this.uploadFiles(inputs);
  }

  async uploadFiles(inputs: UploadFileInput[]): Promise<StoredFile[]> {
    if (!inputs.length) {
      return [];
    }

    for (const input of inputs) {
      this.assertAcceptedMimeType(input.mimetype);
    }

    return this.provider.uploadFiles(inputs);
  }

  async replaceFile(
    oldUrl: string | undefined,
    input: UploadFileInput,
  ): Promise<StoredFile> {
    const stored = await this.uploadFiles([input]);
    if (oldUrl) {
      await this.deleteByUrls([oldUrl]);
    }
    return stored[0];
  }

  async deleteByUrls(urls: string[]): Promise<void> {
    const keys = urls
      .filter((url) => this.isManagedUrl(url))
      .map((url) => this.provider.extractKeyFromUrl(url))
      .filter((key): key is string => Boolean(key));

    if (!keys.length) {
      return;
    }

    await this.provider.deleteFiles(keys);
  }

  private toUploadInput(
    file: Express.Multer.File,
    folder: StorageFolder,
  ): UploadFileInput {
    if (!file.buffer?.length) {
      throw new BadRequestException('Uploaded file is empty');
    }

    return {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalName: file.originalname || 'image.jpg',
      folder,
    };
  }

  private assertAcceptedMimeType(mimetype: string): void {
    if (
      !ACCEPTED_IMAGE_MIME_TYPES.includes(mimetype as AcceptedImageMimeType)
    ) {
      throw new BadRequestException(`Unsupported file type: ${mimetype}`);
    }
  }
}
