import { BadRequestException } from '@nestjs/common';

const LEBANON_LAT_MIN = 33.0;
const LEBANON_LAT_MAX = 34.75;
const LEBANON_LNG_MIN = 35.0;
const LEBANON_LNG_MAX = 36.65;

export function assertCoordinatesInLebanon(lat: number, lng: number): void {
  if (
    lat < LEBANON_LAT_MIN ||
    lat > LEBANON_LAT_MAX ||
    lng < LEBANON_LNG_MIN ||
    lng > LEBANON_LNG_MAX
  ) {
    throw new BadRequestException(
      'Coordinates must be within Lebanon. Pick a point on the map or search for a Lebanese address.',
    );
  }
}
