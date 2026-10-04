import React, { useMemo, useState } from "react";
import { splitMobileTabs } from "@choferes/shared";
import { useAuthContext } from "../../context/AuthContext";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import { useVisibleNavLinks } from "../../hooks/useVisibleNavLinks";
import { useLocation } from "react-router-dom";
import { APPBAR_MENU, ROUTES } from "../../constants/constants";
import MobileTabBar from "./MobileTabBar.component";
import MobileTopBar from "./MobileTopBar.component";
import MoreSheet from "./MoreSheet.component";
import { ScreenTitleProvider } from "./MobileScreenTitle";

interface MobileShellProps {
  children: React.ReactNode;
}

// Marco de la aplicación para teléfonos y tablets: barra superior, contenido y
// barra de pestañas inferior. La navegación (permisos, orden de "Accesos
// rápidos") es la misma que la de la web; solo cambia cómo se presenta.
const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const { currentUser } = useAuthContext();
  const { pathname } = useLocation();
  const { links, userLinks } = useAppNavigation();
  const visible = useVisibleNavLinks(links);
  // Configuración vive en "Más" (sección de cuenta), no como pestaña.
  const sections = useMemo(() => visible.filter((l) => l.label !== APPBAR_MENU.PROFILE), [visible]);
  const [moreOpen, setMoreOpen] = useState(false);

  const { tabs, more } = useMemo(() => splitMobileTabs(sections), [sections]);
  const isOn = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const moreActive = more.some((l) => isOn(l.path)) || isOn(ROUTES.PROFILE);

  return (
    <ScreenTitleProvider>
      <MobileTopBar destinations={links} />
      {children}
      <MobileTabBar
        tabs={tabs}
        moreActive={moreActive}
        moreOpen={moreOpen}
        onMore={() => setMoreOpen(true)}
      />
      <MoreSheet
        open={moreOpen}
        onOpen={() => setMoreOpen(true)}
        onClose={() => setMoreOpen(false)}
        links={more}
        userLinks={userLinks}
        currentUser={currentUser}
      />
    </ScreenTitleProvider>
  );
};

export default MobileShell;
