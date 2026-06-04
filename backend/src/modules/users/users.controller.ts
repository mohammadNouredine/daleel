import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
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
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPermissionsDto } from './dto/user-permissions.dto';
import { UsersService } from './users.service';

function requireUserId(session: UserSession | null): string {
  if (!session?.user?.id) {
    throw new UnauthorizedException('Authentication required');
  }
  return session.user.id;
}

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

  @Get()
  @ApiOperation({ summary: 'List users (admin)' })
  list(@Session() session: UserSession, @Query() query: ListUsersQueryDto) {
    const userId = requireUserId(session);
    return this.usersService.listForAdmin(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id (admin)' })
  findOne(@Session() session: UserSession, @Param('id') id: string) {
    const userId = requireUserId(session);
    return this.usersService.findByIdForAdmin(userId, id);
  }

  @Patch(':id/permissions')
  @ApiOperation({ summary: 'Update user permissions (admin)' })
  updatePermissions(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: UpdateUserPermissionsDto,
  ) {
    const userId = requireUserId(session);
    return this.usersService.updatePermissionsForAdmin(userId, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile (admin)' })
  update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const userId = requireUserId(session);
    return this.usersService.updateForAdmin(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (admin)' })
  remove(@Session() session: UserSession, @Param('id') id: string) {
    const userId = requireUserId(session);
    return this.usersService.deleteForAdmin(userId, id);
  }
}
