import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { getRecipientAccess, resolveNotificationUrl } from "../utils/notificationRoute";

/** Navega al destino de una notificación respetando el acceso de quien la abre. */
export function useNotificationNavigation(): (actionUrl?: string | null) => void {
  const navigate = useNavigate();
  const { currentUser, userPermissions } = useAuthContext();

  return useCallback(
    (actionUrl) => {
      const target = resolveNotificationUrl(
        actionUrl,
        getRecipientAccess(userPermissions, currentUser),
      );
      if (target) navigate(target);
    },
    [navigate, currentUser, userPermissions],
  );
}
