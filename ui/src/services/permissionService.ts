import { Permission } from "../models/Permission";
import api from "./api";

export const fetchPermissions = async () => {
  const response = await api.get("/permissions");
  return response.data;
};

export const addPermission = async (newPermission: Permission) => {
  const response = await api.post("/permissions", newPermission);
  return response.data;
};

export const getPermissionById = async (id: number) => {
  const response = await api.get(`/permissions/${id}`);
  return response.data;
};
