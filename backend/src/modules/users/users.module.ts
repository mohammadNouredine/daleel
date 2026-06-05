import { Module } from '@nestjs/common';
import { StorageModule } from '../../storage/storage.module';
import { AdminSeedService } from './admin-seed.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [StorageModule],
  controllers: [UsersController],
  providers: [UsersService, AdminSeedService],
  exports: [UsersService],
})
export class UsersModule {}
