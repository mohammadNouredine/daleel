import type { HelpRequestDocument, NeedLine } from './schemas/help-request.schema';

export type HelpRequestResponse = {
  _id: string;
  createdBy: string;
  title: string;
  description: string;
  helpType: string;
  subCategory: string;
  priorityLevel: string;
  needs: NeedLine[];
  beneficiariesCount?: number;
  location?: HelpRequestDocument['location'];
  status: string;
  visibility: string;
  approvalStatus: string;
  rejectionReason?: string;
  isVerified: boolean;
  media?: string[];
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
};

export function mapHelpRequestToResponse(
  doc: HelpRequestDocument,
): HelpRequestResponse {
  return {
    _id: doc._id.toHexString(),
    createdBy: doc.createdBy.toHexString(),
    title: doc.title,
    description: doc.description,
    helpType: doc.helpType,
    subCategory: doc.subCategory,
    priorityLevel: doc.priorityLevel,
    needs: doc.needs ?? [],
    beneficiariesCount: doc.beneficiariesCount,
    location: doc.location ?? undefined,
    status: doc.status,
    visibility: doc.visibility,
    approvalStatus: doc.approvalStatus,
    rejectionReason: doc.rejectionReason,
    isVerified: doc.isVerified,
    media: doc.media ?? [],
    contactPhone: doc.contactPhone,
    createdAt:
      (doc.get('createdAt') as Date | undefined)?.toISOString() ??
      new Date().toISOString(),
    updatedAt:
      (doc.get('updatedAt') as Date | undefined)?.toISOString() ??
      new Date().toISOString(),
  };
}
