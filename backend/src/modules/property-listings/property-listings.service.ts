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
  ListingContactMethod,
  LocationVisibility,
  PropertyListingStatus,
  UserRole,
} from '../../common/enums';
import { toObjectId } from '../../common/utils/object-id.util';
import { UsersService } from '../users/users.service';
import type { CreatePropertyListingDto } from './dto/create-property-listing.dto';
import type { CreatePropertyReportDto } from './dto/create-property-report.dto';
import type { ListPropertyListingsQueryDto } from './dto/list-property-listings-query.dto';
import type { RejectPropertyListingDto } from './dto/reject-property-listing.dto';
import type { UpdatePropertyListingDto } from './dto/update-property-listing.dto';
import {
  LISTING_EXPIRY_DAYS,
  MAX_PROPERTY_IMAGES,
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

  async listPendingModeration(userId: string): Promise<PropertyListingResponse[]> {
    await this.assertAdmin(userId);

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
    if (doc.deletedAt) {
      throw new NotFoundException('Property listing not found');
    }

    const isOwner = viewerId ? doc.ownerId.toHexString() === viewerId : false;
    const isAdmin = viewerId ? await this.isAdmin(viewerId) : false;
    const isApproved = doc.status === PropertyListingStatus.APPROVED;

    if (!isApproved && !isOwner && !isAdmin) {
      throw new NotFoundException('Property listing not found');
    }

    return mapPropertyListingToResponse(doc, { isOwner, isAdmin });
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

    const images = this.buildImages(dto, uploadedUrls);
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

    const isAdmin = await this.isAdmin(userId);

    if (dto.saveAsDraft) {
      doc.status = PropertyListingStatus.DRAFT;
    } else if (isAdmin) {
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

    await doc.save();
    return mapPropertyListingToResponse(doc, {
      isOwner: doc.ownerId.toHexString() === userId,
      isAdmin,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const doc = await this.findDocumentOrThrow(id);
    if (doc.deletedAt) {
      throw new NotFoundException('Property listing not found');
    }
    await this.assertCanEdit(doc, userId);
    doc.deletedAt = new Date();
    doc.status = PropertyListingStatus.DELETED;
    await doc.save();
  }

  async approve(id: string, adminId: string): Promise<PropertyListingResponse> {
    await this.assertAdmin(adminId);
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
    await this.assertAdmin(adminId);
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

  mapUploadedFiles(files: Express.Multer.File[] | undefined): string[] {
    return (files ?? []).map(
      (file) => `/api/v1/uploads/files/${file.filename}`,
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
    const isAdmin = await this.isAdmin(userId);
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not allowed to modify this listing');
    }
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    return user?.role === UserRole.ADMIN;
  }

  private async assertAdmin(userId: string): Promise<void> {
    if (!(await this.isAdmin(userId))) {
      throw new ForbiddenException('Admin access required');
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
