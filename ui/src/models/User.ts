import { Role } from "./Role";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  temporalPassword?: string;
  isActive: boolean;
  roles?: Role[];
  roleId?: number;
  roleName?: string;
}
