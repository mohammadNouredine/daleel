import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentSession, CurrentUserId, RequireAuth } from '../../common/auth';
import { sanitizeUser } from '../../common/utils/sanitize-user';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UpdateUserPermissionsDto } from './dto/user-permissions.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@RequireAuth()
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
  async getMe(@CurrentSession() session: UserSession) {
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

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid session token' })
  async updateMe(
    @CurrentSession() session: UserSession,
    @Body() dto: UpdateMyProfileDto,
  ) {
    const profile = await this.usersService.updateOwnProfile(
      session.user.id,
      dto,
    );

    return {
      session: {
        user: session.user,
        session: session.session,
      },
      profile,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List users (admin)' })
  list(@CurrentUserId() userId: string, @Query() query: ListUsersQueryDto) {
    return this.usersService.listForAdmin(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id (admin)' })
  findOne(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.usersService.findByIdForAdmin(userId, id);
  }

  @Patch(':id/permissions')
  @ApiOperation({ summary: 'Update user permissions (admin)' })
  updatePermissions(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserPermissionsDto,
  ) {
    return this.usersService.updatePermissionsForAdmin(userId, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile (admin)' })
  update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateForAdmin(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (admin)' })
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.usersService.deleteForAdmin(userId, id);
  }
}
