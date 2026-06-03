import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import type {
  StorageProvider,
  StoredFile,
  UploadFileInput,
} from '../storage.types';

@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  private readonly logger = new Logger(CloudinaryStorageProvider.name);
  private readonly cloudName: string;
  private readonly folderPrefix: string;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('storage.cloudinary.cloudName');
    const apiKey = this.configService.get<string>('storage.cloudinary.apiKey');
    const apiSecret = this.configService.get<string>(
      'storage.cloudinary.apiSecret',
    );

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    this.cloudName = cloudName;
    this.folderPrefix =
      this.configService.get<string>('storage.cloudinary.folderPrefix') ??
      'daleel';

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadFile(input: UploadFileInput): Promise<StoredFile> {
    const [stored] = await this.uploadFiles([input]);
    return stored;
  }

  async uploadFiles(inputs: UploadFileInput[]): Promise<StoredFile[]> {
    if (!inputs.length) {
      return [];
    }

    return Promise.all(inputs.map((input) => this.uploadOne(input)));
  }

  async deleteFile(key: string): Promise<void> {
    await this.deleteFiles([key]);
  }

  async deleteFiles(keys: string[]): Promise<void> {
    const uniqueKeys = [...new Set(keys.filter(Boolean))];
    if (!uniqueKeys.length) {
      return;
    }

    await Promise.all(
      uniqueKeys.map(async (key) => {
        try {
          const result = await cloudinary.uploader.destroy(key, {
            resource_type: 'image',
          });
          if (result.result !== 'ok' && result.result !== 'not found') {
            this.logger.warn(
              `Unexpected Cloudinary delete result for ${key}: ${result.result}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to delete Cloudinary asset ${key}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }),
    );
  }

  isManagedUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.endsWith('res.cloudinary.com')) {
        return false;
      }
      const segments = parsed.pathname.split('/').filter(Boolean);
      return segments[0] === this.cloudName;
    } catch {
      return false;
    }
  }

  extractKeyFromUrl(url: string): string | null {
    if (!this.isManagedUrl(url)) {
      return null;
    }

    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const uploadIdx = segments.indexOf('upload');
      if (uploadIdx === -1) {
        return null;
      }

      let rest = segments.slice(uploadIdx + 1);
      while (
        rest.length > 0 &&
        (/^v\d+$/.test(rest[0]) || rest[0].includes(','))
      ) {
        rest = rest.slice(1);
      }

      if (!rest.length) {
        return null;
      }

      const fileSegment = rest[rest.length - 1];
      const folderSegments = rest.slice(0, -1);
      const idWithoutExt = fileSegment.replace(/\.[^.]+$/, '');
      return folderSegments.length
        ? `${folderSegments.join('/')}/${idWithoutExt}`
        : idWithoutExt;
    } catch {
      return null;
    }
  }

  private uploadOne(input: UploadFileInput): Promise<StoredFile> {
    const publicId = randomUUID();
    const folder = `${this.folderPrefix}/${input.folder}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result?.secure_url || !result.public_id) {
            reject(
              new InternalServerErrorException(
                error?.message ?? 'Image upload failed',
              ),
            );
            return;
          }

          resolve({
            url: result.secure_url,
            key: result.public_id,
          });
        },
      );

      uploadStream.on('error', (error) => {
        reject(
          new BadRequestException(
            error instanceof Error ? error.message : 'Image upload failed',
          ),
        );
      });

      uploadStream.end(input.buffer);
    });
  }
}
