import { Role } from "./Role";

export interface User {
  id: number; 
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  Roles: Role[]; 
  roleName: string;
}