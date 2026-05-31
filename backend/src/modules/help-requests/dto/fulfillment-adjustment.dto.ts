import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, Min } from 'class-validator';

export class FulfillmentAdjustmentDto {
  @ApiProperty({ enum: ['add', 'remove', 'set'] })
  @IsIn(['add', 'remove', 'set'])
  adjustmentType: 'add' | 'remove' | 'set';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;
}
