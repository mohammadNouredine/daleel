import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  hasPropertyPermission,
  type PropertyPermissionKey,
} from '../../common/permissions';
import {
  ListingContactMethod,
  LocationVisibility,
  PropertyListingStatus,
  UserRole,
} from '../../common/enums';
import type { DaleelUser } from '../users/schemas/user.types';
import { toObjectId } from '../../common/utils/object-id.util';
import { StorageService } from '../../storage/storage.service';
import { UsersService } from '../users/users.service';
import type { CreatePropertyListingDto } from './dto/create-property-listing.dto';
import type { CreatePropertyReportDto } from './dto/create-property-report.dto';
import type { ListAdminPropertyListingsQueryDto } from './dto/list-admin-property-listings-query.dto';
import type { ListPropertyListingsQueryDto } from './dto/list-property-listings-query.dto';
import type { RejectPropertyListingDto } from './dto/reject-property-listing.dto';
import type { UpdatePropertyListingDto } from './dto/update-property-listing.dto';
import {
  LISTING_EXPIRY_DAYS,
  MAX_PROPERTY_IMAGES,
  SOFT_DELETE_RETENTION_DAYS,
} from './property-listings.constants';
import {
  mapPropertyListingToResponse,
  type PropertyListingResponse,
} from './property-listings.mapper';
import { Amenity, type AmenityDocument } from './schemas/amenity.schema';
import {
  PropertyFavorite,
  type PropertyFavoriteDocument,
} from './schemas/property-favorite.schema';
import {
  PropertyListing,
  type ListingImage,
  type ListingLocation,
  type PropertyListingDocument,
} from './schemas/property-listing.schema';
import {
  PropertyReport,
  type PropertyReportDocument,
} from './schemas/property-report.schema';
import { buildPropertyListingFilter } from './utils/property-listing-filters.util';
import { applyListingTypePricingRules } from './utils/listing-type.util';
import { assertCoordinatesInLebanon } from './utils/lebanon-coordinates.util';
import {
  buildAdminPropertyListingFilter,
  countAdminPropertyListingSummary,
  type AdminPropertyListingSummary,
} from './utils/admin-property-listing-filters.util';
import { paginatePropertyListings } from './utils/property-listing-pagination.util';
import type { ListingLocationDto } from './dto/listing-location.dto';

export type PropertyListingLocationFacetGovernorate = {
  value: string;
  count: number;
};

export type PropertyListingLocationFacetCity = {
  value: string;
  governorate: string;
  count: number;
};

export type PropertyListingLocationFacetsResponse = {
  governorates: PropertyListingLocationFacetGovernorate[];
  cities: PropertyListingLocationFacetCity[];
};

export type PropertyListingPaginatedResponse = {
  items: PropertyListingResponse[];
  nextLastId: string | null;
};

export type AdminPropertyListingsResponse = PropertyListingPaginatedResponse & {
  summary: AdminPropertyListingSummary;
};

export type AmenityResponse = {
  _id: string;
  code: string;
  isActive: boolean;
  sortOrder: number;
};

@Injectable()
export class PropertyListingsService {
  constructor(
    @InjectModel(PropertyListing.name)
    private readonly propertyListingModel: Model<PropertyListingDocument>,
    @InjectModel(Amenity.name)
    private readonly amenityModel: Model<AmenityDocument>,
    @InjectModel(PropertyFavorite.name)
    private readonly propertyFavoriteModel: Model<PropertyFavoriteDocument>,
    @InjectModel(PropertyReport.name)
    private readonly propertyReportModel: Model<PropertyReportDocument>,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  async listPublic(
    query: ListPropertyListingsQueryDto,
  ): Promise<PropertyListingPaginatedResponse> {
    const filter = buildPropertyListingFilter(query, { publicFeed: true });
    return paginatePropertyListings(
      this.propertyListingModel,
      filter,
      query.limit,
      (doc) => mapPropertyListingToResponse(doc),
    );
  }

  async listMine(
    userId: string,
    query: ListPropertyListingsQueryDto,
  ): Promise<PropertyListingPaginatedResponse> {
    const filter = buildPropertyListingFilter(query, { ownerId: userId });
    return paginatePropertyListings(
      this.propertyListingModel,
      filter,
      query.limit,
      (doc) =>
        mapPropertyListingToResponse(doc, {
          isOwner: true,
        }),
    );
  }

  async listForAdmin(
    userId: string,
    query: ListAdminPropertyListingsQueryDto,
  ): Promise<AdminPropertyListingsResponse> {
    await this.assertPropertyPermission(userId, 'canViewProperties');

    const filter = buildAdminPropertyListingFilter(query);
    const [page, summary] = await Promise.all([
      paginatePropertyListings(
        this.propertyListingModel,
        filter,
        query.limit,
        (doc) => mapPropertyListingToResponse(doc, { isAdmin: true }),
      ),
      countAdminPropertyListingSummary(this.propertyListingModel),
    ]);

    return { ...page, summary };
  }

  async listPendingModeration(userId: string): Promise<PropertyListingResponse[]> {
    await this.assertPropertyPermission(userId, 'canApproveProperty');

    const docs = await this.propertyListingModel
      .find({
        status: PropertyListingStatus.PENDING_APPROVAL,
        deletedAt: null,
      })
      .sort({ createdAt: 1 })
      .exec();

    return docs.map((doc) =>
      mapPropertyListingToResponse(doc, { isAdmin: true }),
    );
  }

  async findById(
    id: string,
    viewerId?: string,
  ): Promise<PropertyListingResponse> {
    const doc = await this.findDocumentOrThrow(id);
    const isOwner = viewerId ? doc.ownerId.toHexString() === viewerId : false;
    const canViewAll = viewerId
      ? await this.userHasPropertyPermission(viewerId, 'canViewProperties')
      : false;

    if (doc.deletedAt) {
      if (!canViewAll) {
        throw new NotFoundException('Property listing not found');
      }
      return mapPropertyListingToResponse(doc, {
        isOwner,
        isAdmin: canViewAll,
      });
    }

    const isPubliclyVisible =
      doc.status === PropertyListingStatus.APPROVED;

    if (!isPubliclyVisible && !isOwner && !canViewAll) {
      throw new NotFoundException('Property listing not found');
    }

    return mapPropertyListingToResponse(doc, {
      isOwner,
      isAdmin: canViewAll,
    });
  }

  async create(
    userId: string,
    dto: CreatePropertyListingDto,
    uploadedUrls: string[] = [],
  ): Promise<PropertyListingResponse> {
    await this.assertUserExists(userId);
    await this.validateAmenityIds(dto.amenityIds);

    const images = this.buildImages(dto, uploadedUrls);
    const user = await this.usersService.findById(userId);
    const autoApprove =
      !dto.saveAsDraft && user?.role === UserRole.ADMIN;

    const status = dto.saveAsDraft
      ? PropertyListingStatus.DRAFT
      : autoApprove
        ? PropertyListingStatus.APPROVED
        : PropertyListingStatus.PENDING_APPROVAL;

    const approvalMeta = autoApprove
      ? this.buildApprovalMetadata(userId)
      : {};

    const payload = applyListingTypePricingRules(dto);

    const doc = await this.propertyListingModel.create({
      ownerId: toObjectId(userId),
      status,
      ...approvalMeta,
      listingType: payload.listingType,
      propertyType: dto.propertyType,
      title: dto.title.trim(),
      description: dto.description.trim(),
      images,
      coverImage: dto.coverImage?.trim() || images[0]?.url,
      maxOccupancy: dto.maxOccupancy,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      livingRooms: dto.livingRooms,
      parkingSpaces: dto.parkingSpaces,
      floorNumber: dto.floorNumber,
      buildingFloors: dto.buildingFloors,
      area: dto.area,
      areaUnit: dto.areaUnit,
      furnishingStatus: payload.furnishingStatus,
      price: payload.price,
      currency: payload.currency,
      pricePeriod: payload.pricePeriod,
      requiredAdvanceMonths: payload.requiredAdvanceMonths,
      securityDeposit: payload.securityDeposit,
      officeDeposit: payload.officeDeposit,
      commissionAmount: payload.commissionAmount,
      isPriceNegotiable: payload.isPriceNegotiable ?? false,
      isEmergencyShelter: payload.isEmergencyShelter ?? false,
      acceptFamilies: dto.acceptFamilies ?? false,
      acceptChildren: dto.acceptChildren ?? false,
      acceptPets: dto.acceptPets ?? false,
      womenOnly: dto.womenOnly ?? false,
      menOnly: dto.menOnly ?? false,
      availableBeds: dto.availableBeds,
      totalBeds: dto.totalBeds,
      amenityIds: (dto.amenityIds ?? []).map((id) => toObjectId(id)),
      location: this.resolveLocation(dto.location, !dto.saveAsDraft),
      isAvailable: dto.isAvailable ?? true,
      availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
      availableUntil: dto.availableUntil
        ? new Date(dto.availableUntil)
        : undefined,
      contactMethod: dto.contactMethod ?? ListingContactMethod.PLATFORM_ONLY,
      contactPhone: dto.contactPhone?.trim(),
      contactWhatsapp: dto.contactWhatsapp?.trim(),
      deletedAt: null,
    });

    return mapPropertyListingToResponse(doc, { isOwner: true });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdatePropertyListingDto,
    uploadedUrls: string[] = [],
  ): Promise<PropertyListingResponse> {
    const doc = await this.findDocumentOrThrow(id);
    if (doc.deletedAt) {
      throw new NotFoundException('Property listing not found');
    }
    await this.assertCanEdit(doc, userId);

    if (dto.amenityIds) {
      await this.validateAmenityIds(dto.amenityIds);
    }

    const oldUrls = (doc.images ?? []).map((image) => image.url);
    const images = this.buildImages(dto, uploadedUrls);
    const newUrlSet = new Set(images.map((image) => image.url));
    const removedUrls = oldUrls.filter((url) => !newUrlSet.has(url));
    await this.storageService.deleteByUrls(removedUrls);

    const wasApproved = doc.status === PropertyListingStatus.APPROVED;
    const payload = applyListingTypePricingRules(dto);

    doc.listingType = payload.listingType;
    doc.propertyType = dto.propertyType;
    doc.title = dto.title.trim();
    doc.description = dto.description.trim();
    doc.images = images;
    doc.coverImage = dto.coverImage?.trim() || images[0]?.url;
    doc.maxOccupancy = dto.maxOccupancy;
    doc.bedrooms = dto.bedrooms;
    doc.bathrooms = dto.bathrooms;
    doc.livingRooms = dto.livingRooms;
    doc.parkingSpaces = dto.parkingSpaces;
    doc.floorNumber = dto.floorNumber;
    doc.buildingFloors = dto.buildingFloors;
    doc.area = dto.area;
    doc.areaUnit = dto.areaUnit;
    doc.furnishingStatus = payload.furnishingStatus;
    doc.price = payload.price;
    doc.currency = payload.currency;
    doc.pricePeriod = payload.pricePeriod;
    doc.requiredAdvanceMonths = payload.requiredAdvanceMonths;
    doc.securityDeposit = payload.securityDeposit;
    doc.officeDeposit = payload.officeDeposit;
    doc.commissionAmount = payload.commissionAmount;
    doc.isPriceNegotiable = payload.isPriceNegotiable ?? false;
    doc.isEmergencyShelter = dto.isEmergencyShelter ?? doc.isEmergencyShelter;
    doc.acceptFamilies = dto.acceptFamilies ?? doc.acceptFamilies;
    doc.acceptChildren = dto.acceptChildren ?? doc.acceptChildren;
    doc.acceptPets = dto.acceptPets ?? doc.acceptPets;
    doc.womenOnly = dto.womenOnly ?? doc.womenOnly;
    doc.menOnly = dto.menOnly ?? doc.menOnly;
    doc.availableBeds = dto.availableBeds;
    doc.totalBeds = dto.totalBeds;
    if (dto.amenityIds) {
      doc.amenityIds = dto.amenityIds.map((amenityId) => toObjectId(amenityId));
    }
    doc.location = this.resolveLocation(dto.location, !dto.saveAsDraft);
    if (dto.isAvailable !== undefined) {
      doc.isAvailable = dto.isAvailable;
    }
    doc.availableFrom = dto.availableFrom
      ? new Date(dto.availableFrom)
      : undefined;
    doc.availableUntil = dto.availableUntil
      ? new Date(dto.availableUntil)
      : undefined;
    doc.contactMethod = dto.contactMethod ?? doc.contactMethod;
    doc.contactPhone = dto.contactPhone?.trim();
    doc.contactWhatsapp = dto.contactWhatsapp?.trim();

    const isOwner = doc.ownerId.toHexString() === userId;
    const canEditAsAdmin = await this.userHasPropertyPermission(
      userId,
      'canEditProperty',
    );
    const isArchived = doc.status === PropertyListingStatus.ARCHIVED;

    if (!isArchived) {
      if (dto.saveAsDraft) {
        doc.status = PropertyListingStatus.DRAFT;
      } else if (canEditAsAdmin && !isOwner) {
        doc.status = PropertyListingStatus.APPROVED;
        doc.rejectionReason = undefined;
        if (!wasApproved || !doc.publishedAt) {
          Object.assign(doc, this.buildApprovalMetadata(userId));
        }
      } else {
        doc.status = PropertyListingStatus.PENDING_APPROVAL;
        doc.publishedAt = undefined;
        doc.expiresAt = undefined;
        doc.rejectionReason = undefined;
      }
    }

    await doc.save();
    return mapPropertyListingToResponse(doc, {
      isOwner: doc.ownerId.toHexString() === userId,
      isAdmin: canEditAsAdmin,
    });
  }

  async hide(id: string, userId: string): Promise<PropertyListingResponse> {
    const doc = await this.findDocumentOrThrow(id);
    if (doc.deletedAt) {
      throw new NotFoundException('Property listing not found');
    }
    await this.assertCanHide(doc, userId);
    const isOwner = doc.ownerId.toHexString() === userId;

    if (doc.status === PropertyListingStatus.ARCHIVED) {
      return mapPropertyListingToResponse(doc, { isOwner, isAdmin: !isOwner });
    }

    if (doc.status === PropertyListingStatus.DELETED) {
      throw new BadRequestException('Deleted listings cannot be hidden');
    }

    doc.archivedFromStatus = doc.status;
    doc.status = PropertyListingStatus.ARCHIVED;
    doc.archivedAt = new Date();
    await doc.save();

    return mapPropertyListingToResponse(doc, {
      isOwner,
      isAdmin: !isOwner,
    });
  }

  async unhide(id: string, userId: string): Promise<PropertyListingResponse> {
    const doc = await this.findDocumentOrThrow(id);
    if (doc.deletedAt) {
      throw new NotFoundException('Property listing not found');
    }
    await this.assertCanHide(doc, userId);
    const isOwner = doc.ownerId.toHexString() === userId;

    if (doc.status !== PropertyListingStatus.ARCHIVED) {
      throw new BadRequestException('Only hidden listings can be restored');
    }

    doc.status =
      doc.archivedFromStatus ??
      (doc.publishedAt
        ? PropertyListingStatus.APPROVED
        : PropertyListingStatus.PENDING_APPROVAL);
    doc.archivedFromStatus = undefined;
    doc.archivedAt = undefined;
    await doc.save();

    return mapPropertyListingToResponse(doc, {
      isOwner,
      isAdmin: !isOwner,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const doc = await this.findDocumentOrThrow(id);
    if (doc.deletedAt) {
      throw new NotFoundException('Property listing not found');
    }
    await this.assertCanDelete(doc, userId);

    doc.deletedAt = new Date();
    doc.status = PropertyListingStatus.DELETED;
    doc.archivedFromStatus = undefined;
    doc.archivedAt = undefined;
    await doc.save();
  }

  async permanentRemove(id: string, userId: string): Promise<{ message: string }> {
    const doc = await this.findDocumentOrThrow(id);
    await this.assertCanPermanentlyDelete(doc, userId);
    await this.purgePropertyListingDocument(doc);
    return { message: 'Property listing permanently deleted' };
  }

  async purgeSoftDeletedPropertyListingsOlderThan(
    retentionDays: number = SOFT_DELETE_RETENTION_DAYS,
  ): Promise<{ purgedCount: number }> {
    const days =
      Number.isFinite(retentionDays) && retentionDays > 0
        ? Math.floor(retentionDays)
        : SOFT_DELETE_RETENTION_DAYS;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const docs = await this.propertyListingModel
      .find({
        deletedAt: { $ne: null, $lte: cutoff },
      })
      .exec();

    if (!docs.length) {
      return { purgedCount: 0 };
    }

    for (const doc of docs) {
      await this.purgePropertyListingDocument(doc);
    }

    return { purgedCount: docs.length };
  }

  async listHiddenForAdmin(userId: string): Promise<PropertyListingResponse[]> {
    await this.assertPropertyPermission(userId, 'canViewProperties');

    const docs = await this.propertyListingModel
      .find({
        $or: [
          { status: PropertyListingStatus.ARCHIVED, deletedAt: null },
          { status: PropertyListingStatus.DELETED },
        ],
      })
      .sort({ updatedAt: -1 })
      .limit(100)
      .exec();

    return docs.map((doc) =>
      mapPropertyListingToResponse(doc, { isAdmin: true }),
    );
  }

  async approve(id: string, adminId: string): Promise<PropertyListingResponse> {
    await this.assertPropertyPermission(adminId, 'canApproveProperty');
    const doc = await this.findDocumentOrThrow(id);

    if (doc.status !== PropertyListingStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending listings can be approved');
    }

    Object.assign(doc, this.buildApprovalMetadata(adminId));
    doc.status = PropertyListingStatus.APPROVED;
    doc.rejectionReason = undefined;

    await doc.save();
    return mapPropertyListingToResponse(doc, { isAdmin: true });
  }

  async reject(
    id: string,
    adminId: string,
    dto: RejectPropertyListingDto,
  ): Promise<PropertyListingResponse> {
    await this.assertPropertyPermission(adminId, 'canRejectProperty');
    const doc = await this.findDocumentOrThrow(id);

    if (doc.status !== PropertyListingStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending listings can be rejected');
    }

    doc.status = PropertyListingStatus.REJECTED;
    doc.rejectionReason = dto.rejectionReason.trim();
    doc.reviewedBy = toObjectId(adminId);
    doc.reviewedAt = new Date();

    await doc.save();
    return mapPropertyListingToResponse(doc, { isAdmin: true });
  }

  async addFavorite(userId: string, propertyId: string): Promise<{ favorited: true }> {
    await this.assertUserExists(userId);
    await this.findDocumentOrThrow(propertyId);

    const existing = await this.propertyFavoriteModel.findOne({
      userId: toObjectId(userId),
      propertyId: toObjectId(propertyId),
    });

    if (!existing) {
      await this.propertyFavoriteModel.create({
        userId: toObjectId(userId),
        propertyId: toObjectId(propertyId),
      });
    }

    return { favorited: true };
  }

  async removeFavorite(
    userId: string,
    propertyId: string,
  ): Promise<{ favorited: false }> {
    await this.propertyFavoriteModel.deleteOne({
      userId: toObjectId(userId),
      propertyId: toObjectId(propertyId),
    });
    return { favorited: false };
  }

  async createReport(
    userId: string,
    dto: CreatePropertyReportDto,
  ): Promise<{ _id: string }> {
    await this.assertUserExists(userId);
    await this.findDocumentOrThrow(dto.propertyId);

    try {
      const doc = await this.propertyReportModel.create({
        propertyId: toObjectId(dto.propertyId),
        reportedBy: toObjectId(userId),
        reason: dto.reason.trim(),
        description: dto.description?.trim(),
      });
      return { _id: doc._id.toHexString() };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new ConflictException('You have already reported this listing');
      }
      throw error;
    }
  }

  async listAmenities(): Promise<AmenityResponse[]> {
    const docs = await this.amenityModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, code: 1 })
      .exec();

    return docs.map((doc) => ({
      _id: doc._id.toHexString(),
      code: doc.code,
      isActive: doc.isActive,
      sortOrder: doc.sortOrder,
    }));
  }

  parsePayloadJson(raw: string): CreatePropertyListingDto {
    try {
      return JSON.parse(raw) as CreatePropertyListingDto;
    } catch {
      throw new BadRequestException('Invalid payload JSON');
    }
  }

  async mapUploadedFiles(
    files: Express.Multer.File[] | undefined,
  ): Promise<string[]> {
    return this.storageService.uploadFilesFromMulter(
      files,
      'property-listings',
    );
  }

  private buildImages(
    dto: CreatePropertyListingDto,
    uploadedUrls: string[],
  ): ListingImage[] {
    const fromDto: ListingImage[] = (dto.images ?? []).map((img, index) => ({
      url: img.url,
      order: img.order ?? index,
    }));
    const fromExisting: ListingImage[] = (dto.existingImages ?? []).map(
      (url, index) => ({
        url,
        order: fromDto.length + index,
      }),
    );
    const fromUploads: ListingImage[] = uploadedUrls.map((url, index) => ({
      url,
      order: fromDto.length + fromExisting.length + index,
    }));

    return [...fromDto, ...fromExisting, ...fromUploads].slice(
      0,
      MAX_PROPERTY_IMAGES,
    );
  }

  async getLocationFacets(): Promise<PropertyListingLocationFacetsResponse> {
    const match = {
      deletedAt: null,
      status: PropertyListingStatus.APPROVED,
      isAvailable: true,
    };

    const [governorates, cities] = await Promise.all([
      this.propertyListingModel
        .aggregate<PropertyListingLocationFacetGovernorate>([
          {
            $match: {
              ...match,
              'location.governorate': { $exists: true, $nin: [null, ''] },
            },
          },
          { $group: { _id: '$location.governorate', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, value: '$_id', count: 1 } },
        ])
        .exec(),
      this.propertyListingModel
        .aggregate<PropertyListingLocationFacetCity>([
          {
            $match: {
              ...match,
              'location.governorate': { $exists: true, $nin: [null, ''] },
              'location.city': { $exists: true, $nin: [null, ''] },
            },
          },
          {
            $group: {
              _id: {
                governorate: '$location.governorate',
                city: '$location.city',
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.governorate': 1, '_id.city': 1 } },
          {
            $project: {
              _id: 0,
              governorate: '$_id.governorate',
              value: '$_id.city',
              count: 1,
            },
          },
        ])
        .exec(),
    ]);

    return { governorates, cities };
  }

  private resolveLocation(
    location: ListingLocationDto,
    requireFullLocation: boolean,
  ): ListingLocation {
    const country = location.country?.trim() || 'Lebanon';
    const governorate = location.governorate?.trim() ?? '';
    const city = location.city?.trim() ?? '';
    const formattedAddress = location.formattedAddress?.trim();
    const coordinates = location.coordinates
      ? {
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
        }
      : undefined;

    if (requireFullLocation) {
      if (!formattedAddress) {
        throw new BadRequestException(
          'Address is required. Search for an address or pick a point on the map.',
        );
      }
      if (!coordinates) {
        throw new BadRequestException(
          'Map location is required. Search for an address or pick a point on the map.',
        );
      }
      if (!governorate) {
        throw new BadRequestException(
          'Governorate could not be resolved from the address.',
        );
      }
      if (!city) {
        throw new BadRequestException(
          'City could not be resolved from the address.',
        );
      }
      assertCoordinatesInLebanon(coordinates.lat, coordinates.lng);
    }

    return {
      country,
      governorate,
      district: location.district?.trim() || undefined,
      city,
      formattedAddress,
      placeId: location.placeId?.trim() || undefined,
      street: location.street?.trim() || undefined,
      coordinates,
      locationVisibility:
        location.locationVisibility ?? LocationVisibility.APPROXIMATE,
    };
  }

  private async validateAmenityIds(ids?: string[]): Promise<void> {
    if (!ids?.length) {
      return;
    }

    const objectIds = ids.map((id) => toObjectId(id));
    const count = await this.amenityModel
      .countDocuments({ _id: { $in: objectIds }, isActive: true })
      .exec();

    if (count !== ids.length) {
      throw new BadRequestException('One or more amenity ids are invalid');
    }
  }

  private async findDocumentOrThrow(
    id: string,
  ): Promise<PropertyListingDocument> {
    let objectId;
    try {
      objectId = toObjectId(id);
    } catch {
      throw new NotFoundException('Property listing not found');
    }

    const doc = await this.propertyListingModel.findById(objectId).exec();
    if (!doc) {
      throw new NotFoundException('Property listing not found');
    }
    return doc;
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('User profile not found');
    }
  }

  private async assertCanEdit(
    doc: PropertyListingDocument,
    userId: string,
  ): Promise<void> {
    const isOwner = doc.ownerId.toHexString() === userId;
    if (isOwner) {
      return;
    }
    if (await this.userHasPropertyPermission(userId, 'canEditProperty')) {
      return;
    }
    throw new ForbiddenException('Not allowed to modify this listing');
  }

  private async assertCanHide(
    doc: PropertyListingDocument,
    userId: string,
  ): Promise<void> {
    const isOwner = doc.ownerId.toHexString() === userId;
    if (isOwner) {
      return;
    }
    if (await this.userHasPropertyPermission(userId, 'canHideProperty')) {
      return;
    }
    throw new ForbiddenException('Not allowed to hide this listing');
  }

  private async assertCanDelete(
    doc: PropertyListingDocument,
    userId: string,
  ): Promise<void> {
    const isOwner = doc.ownerId.toHexString() === userId;
    if (isOwner) {
      return;
    }
    if (await this.userHasPropertyPermission(userId, 'canDeleteProperty')) {
      return;
    }
    throw new ForbiddenException('Not allowed to delete this listing');
  }

  private async assertCanPermanentlyDelete(
    doc: PropertyListingDocument,
    userId: string,
  ): Promise<void> {
    const isOwner = doc.ownerId.toHexString() === userId;
    if (isOwner) {
      return;
    }
    if (
      await this.userHasPropertyPermission(userId, 'canPermanentlyDeleteProperty')
    ) {
      return;
    }
    throw new ForbiddenException('Not allowed to permanently delete this listing');
  }

  private async purgePropertyListingDocument(
    doc: PropertyListingDocument,
  ): Promise<void> {
    const imageUrls = (doc.images ?? []).map((image) => image.url);
    if (doc.coverImage && !imageUrls.includes(doc.coverImage)) {
      imageUrls.push(doc.coverImage);
    }
    await this.storageService.deleteByUrls(imageUrls);

    const propertyId = doc._id;
    await Promise.all([
      this.propertyFavoriteModel.deleteMany({ propertyId }),
      this.propertyReportModel.deleteMany({ propertyId }),
      this.propertyListingModel.deleteOne({ _id: propertyId }),
    ]);
  }

  private async getUserOrThrow(userId: string): Promise<DaleelUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('User profile not found');
    }
    return user;
  }

  private async userHasPropertyPermission(
    userId: string,
    action: PropertyPermissionKey,
  ): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    return hasPropertyPermission(user?.permissions, action);
  }

  private async assertPropertyPermission(
    userId: string,
    action: PropertyPermissionKey,
  ): Promise<void> {
    const user = await this.getUserOrThrow(userId);
    if (!hasPropertyPermission(user.permissions, action)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  private buildApprovalMetadata(reviewerId: string): {
    reviewedBy: ReturnType<typeof toObjectId>;
    reviewedAt: Date;
    publishedAt: Date;
    expiresAt: Date;
  } {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + LISTING_EXPIRY_DAYS);

    return {
      reviewedBy: toObjectId(reviewerId),
      reviewedAt: now,
      publishedAt: now,
      expiresAt,
    };
  }
}
