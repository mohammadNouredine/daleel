import { Controller, Get, NotFoundException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { sanitizeUser } from '../../common/utils/sanitize-user';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns session data plus user profile from `users` (referenced by `_id`).',
  })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid session token' })
  @ApiNotFoundResponse({ description: 'User profile not found' })
  async getMe(@Session() session: UserSession) {
    const profile = await this.usersService.findById(session.user.id);

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return {
      session: {
        user: session.user,
        session: session.session,
      },
      profile: sanitizeUser(profile),
    };
  }
}
