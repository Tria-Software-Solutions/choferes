import React from "react";
import { NAV_ICONS, NAV_ICON_FALLBACK } from "../../constants/navIcons.constants";

export interface NavIconProps {
  /** Menu label (the `APPBAR_MENU` key) that identifies the destination. */
  label: string;
  size?: number;
  stroke?: number;
}

/**
 * Renders the navigation icon bound to a menu label, so the top bar, the
 * mobile drawer and the quick-access dock can never drift apart.
 */
const NavIcon: React.FC<NavIconProps> = ({ label, size = 22, stroke = 1.5 }) => {
  const Icon = NAV_ICONS[label] ?? NAV_ICON_FALLBACK;
  return <Icon size={size} stroke={stroke} />;
};

export default NavIcon;
