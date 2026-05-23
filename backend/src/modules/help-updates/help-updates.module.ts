import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HelpUpdate, HelpUpdateSchema } from './schemas/help-update.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HelpUpdate.name, schema: HelpUpdateSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class HelpUpdatesModule {}
