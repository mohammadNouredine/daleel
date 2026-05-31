import {
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Session, AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { UploadsService } from './uploads.service';
import { MAX_PROOF_IMAGES } from './uploads.constants';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('proof-images')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Upload proof images for help requests' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    schema: {
      properties: {
        urls: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', MAX_PROOF_IMAGES, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads/proof-images');
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
    }),
  )
  uploadProofImages(
    @Session() session: UserSession | null,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const urls = (files ?? []).map(
      (file) => `/api/v1/uploads/files/${file.filename}`,
    );

    return { urls };
  }

  @Get('files/:filename')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Serve an uploaded proof image' })
  getFile(@Param('filename') filename: string): StreamableFile {
    const stream = this.uploadsService.resolveFileStream(filename);
    return new StreamableFile(stream);
  }
}
