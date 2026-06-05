import {
  Controller,
  Post,
  BadRequestException,
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
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { StorageService } from '../../storage/storage.service';
import { createImageUploadInterceptor } from '../../storage/multer/create-image-upload.interceptor';
import { MAX_PROOF_IMAGES } from './uploads.constants';

const MAX_PROFILE_IMAGES = 1;

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly storageService: StorageService) {}

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
  @UseInterceptors(createImageUploadInterceptor(MAX_PROOF_IMAGES))
  async uploadProofImages(
    @Session() session: UserSession | null,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const urls = await this.storageService.uploadFilesFromMulter(
      files,
      'proof-images',
    );

    return { urls };
  }

  @Post('profile-image')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Upload profile image for current user' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    schema: {
      properties: {
        url: { type: 'string' },
      },
    },
  })
  @UseInterceptors(createImageUploadInterceptor(MAX_PROFILE_IMAGES))
  async uploadProfileImage(
    @Session() session: UserSession | null,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const urls = await this.storageService.uploadFilesFromMulter(
      files,
      'profile-images',
    );

    if (!urls.length) {
      throw new BadRequestException('No image file provided');
    }

    return { url: urls[0] };
  }
}
