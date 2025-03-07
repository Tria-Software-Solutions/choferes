import { Permission } from "./Permission";

export interface Role {
  id: number; 
  name: string;
  Permissions: Permission[]; 
  permissionName: string[];
}
