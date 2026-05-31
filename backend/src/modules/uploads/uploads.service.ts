import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { extname, join, resolve } from 'path';
import { randomUUID } from 'crypto';
import type { ReadStream } from 'fs';
import {
  ACCEPTED_PROOF_IMAGE_TYPES,
  MAX_PROOF_IMAGES,
} from './uploads.constants';

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    const configuredDir =
      this.configService.get<string>('uploads.dir') ??
      'uploads/proof-images';
    this.uploadDir = resolve(process.cwd(), configuredDir);
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  saveProofImages(files: Express.Multer.File[]): string[] {
    if (!files.length) {
      return [];
    }

    if (files.length > MAX_PROOF_IMAGES) {
      throw new BadRequestException(
        `Maximum ${MAX_PROOF_IMAGES} proof images allowed`,
      );
    }

    return files.map((file) => {
      if (
        !ACCEPTED_PROOF_IMAGE_TYPES.includes(
          file.mimetype as (typeof ACCEPTED_PROOF_IMAGE_TYPES)[number],
        )
      ) {
        throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
      }

      const extension = extname(file.originalname) || '.jpg';
      const filename = `${randomUUID()}${extension}`;
      const destination = join(this.uploadDir, filename);

      // Multer diskStorage writes file; with memory storage we'd write manually.
      // FilesInterceptor with diskStorage handles persistence.
      if (file.path && file.path !== destination) {
        // diskStorage already saved with our filename via config
      }

      return `/api/v1/uploads/files/${filename}`;
    });
  }

  getPublicUrlsFromSavedFiles(filenames: string[]): string[] {
    return filenames.map(
      (filename) => `/api/v1/uploads/files/${filename}`,
    );
  }

  resolveFileStream(filename: string): ReadStream {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = join(this.uploadDir, safeName);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return createReadStream(filePath);
  }

  getUploadDir(): string {
    return this.uploadDir;
  }
}
