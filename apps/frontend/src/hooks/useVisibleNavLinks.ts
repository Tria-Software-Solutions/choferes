import { useEffect, useMemo, useRef } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useMenuPreferences } from "./useMenuPreferences";
import * as UserService from "../services/userService";

interface Labeled {
  label: string;
}

// Secciones visibles y en el orden que el usuario eligió en Configuración →
// Accesos rápidos. También sincroniza esa preferencia con su cuenta, así que
// debe montarse en la barra que esté activa (web o móvil).
export const useVisibleNavLinks = <T extends Labeled>(links: T[]): T[] => {
  const { currentUser } = useAuthContext();
  const linkKeys = useMemo(() => links.map((l) => l.label), [links]);
  const { preferences, itemOrder, isMenuVisible } = useMenuPreferences(linkKeys);

  const dockSyncRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!currentUser?.id) return undefined;
    clearTimeout(dockSyncRef.current);
    dockSyncRef.current = setTimeout(() => {
      UserService.updateUserSettings(currentUser.id, {
        dock: { preferences, order: itemOrder },
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(dockSyncRef.current);
  }, [preferences, itemOrder, currentUser?.id]);

  return useMemo(() => {
    const ordered = [...links].sort(
      (a, b) => itemOrder.indexOf(a.label) - itemOrder.indexOf(b.label),
    );
    return ordered.filter((link) => isMenuVisible(link.label));
  }, [links, itemOrder, isMenuVisible]);
};
