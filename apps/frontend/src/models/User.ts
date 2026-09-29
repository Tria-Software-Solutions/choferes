import { Permission } from "@choferes/shared";

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
    permissions?: Permission[];
  }>;
  roleId?: number;
  roleName?: string;
  /** Empleado (Planilla) vinculado a la cuenta, si existe. */
  employeeId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}
