import { Permission } from "./Permission";

export interface Role {
  id: number;
  name: string;
  description?: string;
  /**
   * Puesto de empleado al que sigue este rol (ver POSITION_ROLE_NAMES). Lo
   * tienen los roles que nacen de un puesto; esos roles no se renombran ni se
   * borran, porque la cuenta de cada empleado con ese puesto los recibe.
   */
  positionKey?: string | null;
  permissions?: Permission[];
  permissionIds?: number[];
  permissionNames?: string[];
}
