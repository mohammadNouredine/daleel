import {
  HelpRequestSort,
  PriorityLevel,
} from '../../../common/enums';
import type { HelpRequestSortQueryDto } from '../dto/help-request-sort-query.dto';
import type { HelpRequestDocument } from '../schemas/help-request.schema';

const PRIORITY_RANK: Record<PriorityLevel, number> = {
  [PriorityLevel.CRITICAL]: 4,
  [PriorityLevel.HIGH]: 3,
  [PriorityLevel.MEDIUM]: 2,
  [PriorityLevel.LOW]: 1,
};

function getCreatedAtMs(doc: HelpRequestDocument): number {
  const createdAt = doc.get('createdAt') as Date | undefined;
  return createdAt?.getTime() ?? 0;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getRequestDistanceKm(
  doc: HelpRequestDocument,
  origin: { lat: number; lng: number },
): number | null {
  const coords = doc.location?.coordinates;
  if (
    coords?.lat == null ||
    coords?.lng == null ||
    Number.isNaN(coords.lat) ||
    Number.isNaN(coords.lng)
  ) {
    return null;
  }

  return haversineKm(origin.lat, origin.lng, coords.lat, coords.lng);
}

export function resolveHelpRequestSort(
  query: HelpRequestSortQueryDto,
): HelpRequestSort {
  const sort = query.sort ?? HelpRequestSort.LATEST;

  if (sort === HelpRequestSort.NEAREST) {
    if (query.lat == null || query.lng == null) {
      return HelpRequestSort.LATEST;
    }
  }

  return sort;
}

export function sortHelpRequestDocuments(
  docs: HelpRequestDocument[],
  query: HelpRequestSortQueryDto,
): HelpRequestDocument[] {
  const sort = resolveHelpRequestSort(query);
  const sorted = [...docs];

  if (sort === HelpRequestSort.LATEST) {
    return sorted.sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));
  }

  if (sort === HelpRequestSort.PRIORITY) {
    return sorted.sort((a, b) => {
      const rankDiff =
        PRIORITY_RANK[b.priorityLevel] - PRIORITY_RANK[a.priorityLevel];
      if (rankDiff !== 0) return rankDiff;
      return getCreatedAtMs(b) - getCreatedAtMs(a);
    });
  }

  const origin = { lat: query.lat!, lng: query.lng! };

  return sorted.sort((a, b) => {
    const distA = getRequestDistanceKm(a, origin);
    const distB = getRequestDistanceKm(b, origin);

    if (distA === null && distB === null) {
      return getCreatedAtMs(b) - getCreatedAtMs(a);
    }
    if (distA === null) return 1;
    if (distB === null) return -1;
    if (distA !== distB) return distA - distB;
    return getCreatedAtMs(b) - getCreatedAtMs(a);
  });
}
