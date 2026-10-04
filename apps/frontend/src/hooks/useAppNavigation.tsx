import React, { useMemo } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useAuth } from "./useAuth";
import { APPBAR_MENU, PERMISSION_CODES, ROUTES } from "../constants/constants";
import NavIcon from "../components/NavIcon/NavIcon.component";

export interface NavLink {
  label: string;
  icon: React.ReactElement;
  path: string;
  permission?: string;
}

export interface UserLink {
  label: string;
  icon: React.ReactElement;
  path?: string;
  onClick?: () => void;
}

const DESTINATIONS: Array<{ label: string; path: string; permission?: string }> = [
  { label: APPBAR_MENU.MY_PANEL, path: ROUTES.MY_PANEL, permission: PERMISSION_CODES.VIEW_MY_PANEL },
  { label: APPBAR_MENU.EMPLOYEES, path: ROUTES.EMPLOYEES, permission: PERMISSION_CODES.VIEW_EMPLOYEES },
  { label: APPBAR_MENU.SCHEDULES, path: ROUTES.SCHEDULES, permission: PERMISSION_CODES.VIEW_SCHEDULES },
  { label: APPBAR_MENU.ROLES, path: ROUTES.ROLES, permission: PERMISSION_CODES.VIEW_ROLES },
  { label: APPBAR_MENU.VEHICLES, path: ROUTES.VEHICLES, permission: PERMISSION_CODES.VIEW_VEHICLES },
  { label: APPBAR_MENU.DASHBOARD, path: ROUTES.DASHBOARD, permission: PERMISSION_CODES.VIEW_ADMIN },
  { label: APPBAR_MENU.DOCUMENTS, path: ROUTES.DOCUMENTS, permission: PERMISSION_CODES.VIEW_DOCUMENTS },
  { label: APPBAR_MENU.TASKS, path: ROUTES.TASKS, permission: PERMISSION_CODES.VIEW_TASKS },
  // Configuración no exige permiso: siempre visible.
  { label: APPBAR_MENU.PROFILE, path: ROUTES.PROFILE },
];

/** Secciones que el usuario puede ver, más las acciones de su cuenta. */
export const useAppNavigation = () => {
  const { userPermissions } = useAuthContext();
  const { logoutUser } = useAuth();

  const links = useMemo<NavLink[]>(
    () =>
      DESTINATIONS.filter(
        (item) =>
          !item.permission ||
          (Array.isArray(userPermissions) && userPermissions.includes(item.permission)),
      ).map((item) => ({ ...item, icon: <NavIcon label={item.label} /> })),
    [userPermissions],
  );

  const userLinks = useMemo<UserLink[]>(
    () => [
      { label: APPBAR_MENU.PROFILE, icon: <NavIcon label={APPBAR_MENU.PROFILE} size={20} />, path: ROUTES.PROFILE },
      { label: APPBAR_MENU.LOGOUT, icon: <NavIcon label={APPBAR_MENU.LOGOUT} size={20} />, onClick: logoutUser },
    ],
    [logoutUser],
  );

  return { links, userLinks };
};
