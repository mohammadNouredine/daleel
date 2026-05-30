import { ApiProperty } from '@nestjs/swagger';

export class ReferenceOptionDto {
  @ApiProperty({ example: 'MATERIAL' })
  value: string;

  @ApiProperty({ example: 'Material' })
  label: string;
}

export class HelpRequestOptionsResponseDto {
  @ApiProperty({ enum: ['en', 'ar'], example: 'en' })
  locale: string;

  @ApiProperty({ type: [ReferenceOptionDto] })
  helpTypes: ReferenceOptionDto[];

  @ApiProperty({ type: [ReferenceOptionDto] })
  subCategories: ReferenceOptionDto[];
}
