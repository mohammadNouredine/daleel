import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { HelpRequestsController } from './help-requests.controller';
import { HelpRequestsService } from './help-requests.service';
import { HelpRequestPolicy } from './policies/help-request.policy';
import { HelpRequest, HelpRequestSchema } from './schemas/help-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HelpRequest.name, schema: HelpRequestSchema },
    ]),
    UsersModule,
  ],
  controllers: [HelpRequestsController],
  providers: [HelpRequestsService, HelpRequestPolicy],
  exports: [MongooseModule, HelpRequestsService],
})
export class HelpRequestsModule {}
