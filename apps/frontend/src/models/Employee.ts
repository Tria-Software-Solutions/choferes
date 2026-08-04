/** Frontend Employee type — mirrors @choferes/shared with avatar support */
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}
