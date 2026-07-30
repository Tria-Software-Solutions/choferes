/** Frontend User type — mirrors @choferes/shared with additional settings field */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  temporalPassword?: string;
  isActive: boolean;
  avatar?: string;
  settings?: Record<string, unknown>;
  roles?: Array<{
    id: number;
    name: string;
    permissions?: Array<{ id: number; name: string }>;
  }>;
  roleId?: number;
  roleName?: string;
  createdAt?: string;
  updatedAt?: string;
}
