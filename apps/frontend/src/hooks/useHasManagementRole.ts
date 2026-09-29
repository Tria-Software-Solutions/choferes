import { useMemo } from "react";
import { hasManagementRole } from "@choferes/shared";
import { useAuthContext } from "../context/AuthContext";

/**
 * Doble candado de las pantallas de administración de roles: el usuario debe
 * tener un rol de gestión (Gerencia/Administrativo) además del permiso. Un
 * permiso heredado de un rol operativo no habilita la página.
 */
export function useHasManagementRole(): boolean {
  const { currentUser } = useAuthContext();

  return useMemo(() => hasManagementRole(currentUser), [currentUser]);
}
