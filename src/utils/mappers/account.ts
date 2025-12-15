import type { IAccount } from "../../interfaces/entities/Accout";
import { EEntityType } from "../../interfaces/entityType";

export function itemToAccount(
  item: Record<string, any>
): Omit<IAccount, "password"> {
  if (!item || item.type !== EEntityType.ACCOUNT) {
    throw new Error("Error converting item to Account");
  }

  return {
    id: item.id,
    name: item.name,
    email: item.email,
    type: item.type,
    picture: item.picture,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
