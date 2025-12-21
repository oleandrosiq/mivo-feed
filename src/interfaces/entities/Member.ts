import type { EEntityType } from "../entityType";

export interface IMember {
  accountId: string;
  communityId: string;
  type: EEntityType.MEMBER;
  memberName: string;
  memberPicture: string;
  communitySlug: string;
  communityName: string;
  communityBanner: string;
  createdAt: string;
  updatedAt?: string;
}
