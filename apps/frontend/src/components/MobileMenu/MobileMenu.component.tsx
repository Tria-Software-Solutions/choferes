import React, { useState } from "react";
import {
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { ChevronDown, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../../services/api";
import { APPBAR_MENU } from "../../constants/constants";
import logo from "../../assets/images/logo.png";
import {
  drawerPaperStyles,
  drawerHeaderStyles,
  drawerHeaderTitleStyles,
  drawerLogoStyles,
  drawerCloseButtonStyles,
  drawerUserCardStyles,
  drawerAvatarStyles,
  drawerSectionLabelStyles,
  drawerNavListStyles,
  drawerAccountListStyles,
  drawerNavRowStyles,
  drawerNavIconStyles,
  drawerNavTextStyles,
  drawerActionRowStyles,
  drawerActionIconStyles,
  drawerActionTextStyles,
  drawerDividerStyles,
  drawerFooterStyles,
} from "./MobileMenu.styles";

export interface MobileMenuLink {
  label: string;
  path?: string;
  icon?: React.ReactElement;
  subLinks?: MobileMenuLink[];
  onClick?: () => void;
}

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  navLinks: MobileMenuLink[];
  userLinks: MobileMenuLink[];
  currentUser: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string | null;
  } | null;
}

// Recursive nav item with expandable submenu support
const NavItem: React.FC<{
  link: MobileMenuLink;
  depth?: number;
  onNavigate: () => void;
}> = ({ link, depth = 0, onNavigate }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [subOpen, setSubOpen] = useState(false);

  const active = Boolean(link.path) && location.pathname === link.path;
  const hasSub = Boolean(link.subLinks && link.subLinks.length > 0);

  const handleClick = () => {
    if (hasSub) {
      setSubOpen((prev) => !prev);
      return;
    }
    onNavigate();
    if (link.onClick) {
      link.onClick();
    } else if (link.path) {
      navigate(link.path);
    }
  };

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        sx={drawerNavRowStyles(theme, active, depth)}
      >
        {link.icon && (
          <Box sx={drawerNavIconStyles(theme, active)}>
            {React.cloneElement(link.icon as React.ReactElement, {
              size: 18,
              strokeWidth: 1.8,
            })}
          </Box>
        )}
        <Typography sx={drawerNavTextStyles(theme, active)} noWrap>
          {link.label}
        </Typography>
        {hasSub && (
          <ChevronDown
            size={16}
            style={{
              transform: subOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
              color: theme.palette.text.secondary,
              flexShrink: 0,
            }}
          />
        )}
      </Box>
      {hasSub && (
        <Collapse in={subOpen} timeout={200}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
            {link.subLinks!.map((sub) => (
              <NavItem key={sub.label} link={sub} depth={depth + 1} onNavigate={onNavigate} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  );
};

// MobileMenuDrawer renders an optimized right-side drawer for small devices.
// Props:
// - open: whether the drawer is visible
// - onClose: callback to close the drawer
// - title: app title shown in the header
// - navLinks: main navigation links (dock pages)
// - userLinks: user account actions (settings, logout, etc.)
// - currentUser: user info displayed in the header card
const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  open,
  onClose,
  title,
  navLinks,
  userLinks,
  currentUser,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const appTitle = title === "Choferes de Alquiler" ? "Choferes" : title;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: drawerPaperStyles(theme) }}
    >
      {/* Header */}
      <Box sx={drawerHeaderStyles}>
        <Box sx={drawerHeaderTitleStyles}>
          <Box component="img" src={logo} alt="Logo" sx={drawerLogoStyles} />
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.04em" }}>
            {appTitle}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={drawerCloseButtonStyles} aria-label="Cerrar menú">
          <X size={20} />
        </IconButton>
      </Box>

      {/* User card */}
      {currentUser && (
        <Box sx={drawerUserCardStyles(theme)}>
          {currentUser.avatar ? (
            <Avatar src={`${API_URL}${currentUser.avatar}`} sx={drawerAvatarStyles} />
          ) : (
            <Avatar sx={drawerAvatarStyles}>
              {currentUser.firstName?.[0]}
              {currentUser.lastName?.[0]}
            </Avatar>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}
              noWrap
            >
              {currentUser.firstName} {currentUser.lastName}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }} noWrap>
              {currentUser.email}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <Typography sx={drawerSectionLabelStyles(theme)}>Navegación</Typography>
      <Box sx={drawerNavListStyles}>
        {navLinks.map((link) => (
          <NavItem key={link.label} link={link} onNavigate={onClose} />
        ))}
      </Box>

      {/* Account actions */}
      <Divider sx={drawerDividerStyles(theme)} />
      <Typography sx={drawerSectionLabelStyles(theme)}>Cuenta</Typography>
      <Box sx={drawerAccountListStyles}>
        {userLinks.map((link) => {
          const isLogout = link.label === APPBAR_MENU.LOGOUT;
          const handleClick = () => {
            onClose();
            if (link.onClick) {
              link.onClick();
            } else if (link.path) {
              navigate(link.path);
            }
          };
          return (
            <Box
              key={link.label}
              role="button"
              tabIndex={0}
              onClick={handleClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick();
                }
              }}
              sx={drawerActionRowStyles(theme, isLogout)}
            >
              {link.icon && (
                <Box sx={drawerActionIconStyles(theme, isLogout)}>
                  {React.cloneElement(link.icon as React.ReactElement, {
                    size: 18,
                    strokeWidth: 1.8,
                  })}
                </Box>
              )}
              <Typography sx={drawerActionTextStyles(theme, isLogout)} noWrap>
                {link.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={drawerFooterStyles(theme)}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          © {new Date().getFullYear()} {title === "Choferes de Alquiler" ? "Choferes de Alquiler" : title}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default React.memo(MobileMenuDrawer);
