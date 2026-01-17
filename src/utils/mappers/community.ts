import type { ICommunity } from "../../interfaces/entities/Community";
import { EEntityType } from "../../interfaces/entityType";

export function itemToCommunity(
  item: Record<string, any>,
): Omit<ICommunity, "password"> {
  if (item.type === EEntityType.MEMBER) {
    return {
      id: item.communityId,
      name: item.communityName,
      slug: item.communitySlug,
      banner: item.communityBanner,
    } as ICommunity;
  }

  if (!item || item.type !== EEntityType.COMMUNITY) {
    throw new Error("Error converting item to Community");
  }

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    membersCount: item.membersCount,
    ownerId: item.ownerId,
    type: item.type,
    banner: item.banner,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
