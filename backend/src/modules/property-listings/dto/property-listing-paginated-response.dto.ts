import { ApiProperty } from '@nestjs/swagger';

export class PropertyListingPaginatedResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items: unknown[];

  @ApiProperty({
    nullable: true,
    description: 'Cursor for next page; pass as lastId query param',
  })
  nextLastId: string | null;
}
