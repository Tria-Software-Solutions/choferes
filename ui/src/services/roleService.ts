import { Role } from "../models/Role";
import api from "./api";

export const getRoles = async () => {
  const response = await api.get("/roles");
  return response.data;
};

export const getRoleById = async (id: number) => {
  const response = await api.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (newRole: Omit<Role, "id">) => {
  const response = await api.post("/roles", newRole);
  return response.data;
};

export const deleteRole = async (id: number) => {
  await api.delete(`/roles/${id}`);
};
