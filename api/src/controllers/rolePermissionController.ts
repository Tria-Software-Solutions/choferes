import { Request, Response } from 'express';
import * as rolePermissionService from '../services/rolePermissionService';

export const assignPermission = async (req: Request, res: Response) => {
  const { roleId, permissionId } = req.body;

  try {
    const rolePermission = await rolePermissionService.assignPermissionToRole(roleId, permissionId);
    res.status(201).json(rolePermission);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning RolePermission', error });
  }
};

export const getPermissions = async (req: Request, res: Response) => {
  const { roleId } = req.params;

  try {
    const permissions = await rolePermissionService.getPermissionsByRole(Number(roleId));
    res.status(200).json(permissions);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching RolePermission', error });
  }
};

export const removePermission = async (req: Request, res: Response) => {
  const { roleId, permissionId } = req.body;

  try {
    await rolePermissionService.removePermissionFromRole(roleId, permissionId);
    res.status(200).json({ message: 'RolePermission deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting RolePermission', error });
  }
};
