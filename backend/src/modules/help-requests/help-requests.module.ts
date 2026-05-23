import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HelpRequest, HelpRequestSchema } from './schemas/help-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HelpRequest.name, schema: HelpRequestSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class HelpRequestsModule {}
