import { Permission } from "./Permission";

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  permissionIds?: number[];
  permissionNames?: string[];
}
