import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmenityCode } from '../../common/enums';
import { Amenity, type AmenityDocument } from './schemas/amenity.schema';

@Injectable()
export class AmenitySeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AmenitySeedService.name);

  constructor(
    @InjectModel(Amenity.name)
    private readonly amenityModel: Model<AmenityDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const codes = Object.values(AmenityCode);

    await Promise.all(
      codes.map((code, index) =>
        this.amenityModel.updateOne(
          { code },
          {
            $setOnInsert: {
              code,
              isActive: true,
              sortOrder: index,
            },
          },
          { upsert: true },
        ),
      ),
    );

    this.logger.log(`Amenity seed upsert complete (${codes.length} codes).`);
  }
}
