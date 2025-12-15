import type { EEntityType } from "../entityType";

export interface IAccount {
  id: string;
  name: string;
  email: string;
  picture?: string;
  type: EEntityType.ACCOUNT;
  password: string;
  createdAt: string;
  updatedAt?: string;
}
