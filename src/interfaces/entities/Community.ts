import type { EEntityType } from "../entityType";

export interface ICommunity {
  id: string;
  name: string;
  slug: string;
  banner?: string;
  membersCount: number;
  ownerId: string;
  type: EEntityType.COMMUNITY;
  createdAt: string;
  updatedAt?: string;
}
