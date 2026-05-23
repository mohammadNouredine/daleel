import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mongoDatabaseName } from '../../database/mongo-client';
import { auth } from '../../auth/auth';
import { UserRole } from '../../common/enums';
import {
  AdminSeedAction,
  classifySignUpError,
  normalizeAdminEmail,
} from './admin-seed.utils';
import { UsersService } from './users.service';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.configService.get<string>('admin.email');
    const password = this.configService.get<string>('admin.password');
    const fullName =
      this.configService.get<string>('admin.fullName') ?? 'Daleel Admin';

    if (!email || !password) {
      this.logger.warn(
        'ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed',
      );
      return;
    }

    const normalizedEmail = normalizeAdminEmail(email);

    try {
      const result = await this.ensureAdminUser(
        normalizedEmail,
        password,
        fullName,
      );
      this.logger.log(`[${result.action}] ${result.message}`);
    } catch (error) {
      const classified = classifySignUpError(error);
      this.logger.error(
        `Admin seed failed [${classified.code}]: ${classified.message}`,
      );

      if (classified.dbCaseMismatch) {
        this.logger.error(
          `Database "${mongoDatabaseName}" — align MONGODB_URI with Atlas.`,
        );
      }
    }
  }

  private async ensureAdminUser(
    email: string,
    password: string,
    fullName: string,
  ) {
    const existing = await this.usersService.findByEmail(email);

    if (existing?.role === UserRole.ADMIN) {
      return {
        action: AdminSeedAction.NONE,
        email,
        message: `Admin already configured for ${email}`,
      };
    }

    if (existing) {
      await this.usersService.promoteToAdmin(existing._id);
      return {
        action: AdminSeedAction.PROMOTED_EXISTING,
        email,
        message: `Promoted existing user ${email} to admin`,
      };
    }

    let userId: string | undefined;

    try {
      const signUpResult = await auth.api.signUpEmail({
        body: { email, password, name: fullName },
      });
      userId = signUpResult.user?.id;
    } catch (error) {
      const classified = classifySignUpError(error);

      if (classified.dbCaseMismatch) {
        throw new Error(
          `Database name case mismatch. Using "${mongoDatabaseName}".`,
        );
      }

      if (classified.userAlreadyExists) {
        const user = await this.usersService.findByEmail(email);
        if (user) {
          await this.usersService.promoteToAdmin(user._id);
          return {
            action: AdminSeedAction.PROMOTED_EXISTING,
            email,
            message: `User ${email} already existed — promoted to admin`,
          };
        }
      }

      throw error;
    }

    if (!userId) {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new Error(
          `Sign-up succeeded but user not found in "${mongoDatabaseName}.users".`,
        );
      }
      userId = user._id;
    }

    await this.usersService.promoteToAdmin(userId);
    return {
      action: AdminSeedAction.CREATED,
      email,
      message: `Created admin user ${email}`,
    };
  }
}
