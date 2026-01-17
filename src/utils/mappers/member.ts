import type { IMember } from "../../interfaces/entities/Member";
import { EEntityType } from "../../interfaces/entityType";

export function itemToMember(
  item: Record<string, any>,
): Omit<IMember, "password"> {
  if (!item || item.type !== EEntityType.MEMBER) {
    throw new Error("Error converting item to Member");
  }

  return {
    accountId: item.accountId,
    communityId: item.communityId,
    communitySlug: item.communitySlug,
    communityName: item.communityName,
    communityBanner: item.communityBanner,
    type: item.type,
    memberName: item.memberName,
    memberPicture: item.memberPicture,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
