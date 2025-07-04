import React, { useState } from "react";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  SvgIconProps,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  iconButtonStyles,
  textButtonStyles,
  buttonStyles,
  menuPaperStyles,
  menuItemStyles,
  subMenuPaperStyles,
  listItemTextStyles
} from "./MenuComponent.styles";

export interface MenuItemProps {
  text: string;
  onClick?: () => void;
  icon?: React.ReactElement<SvgIconProps> | React.ReactElement;
  subMenuItems?: MenuItemProps[];
}

interface MenuComponentProps {
  buttonType: "icon" | "text" | "button";
  icon?: React.ReactElement<SvgIconProps> | React.ReactElement;
  text?: string;
  menuItems: MenuItemProps[];
}

// MenuComponent renders a button (icon, text, or standard) that opens a menu with optional submenus.
// Props:
// - buttonType: type of button to trigger the menu (icon, text, or button)
// - icon: icon to display if buttonType is 'icon'
// - text: text to display if buttonType is 'text' or 'button'
// - menuItems: array of menu item objects (text, onClick, icon, subMenuItems)
const MenuComponent: React.FC<MenuComponentProps> = ({
  buttonType,
  icon,
  text,
  menuItems,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Anchor for main menu
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  ); // Anchor for submenu
  const open = Boolean(anchorEl); // Main menu open state
  const openSubMenu = Boolean(subMenuAnchorEl); // Submenu open state

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Opens the main menu
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    // Closes both main and submenu
    setAnchorEl(null);
    setSubMenuAnchorEl(null);
  };

  const handleSubMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    // Opens the submenu
    setSubMenuAnchorEl(event.currentTarget);
  };

  return (
    <div>
      {buttonType === "icon" ? (
        <IconButton
          color="inherit"
          sx={iconButtonStyles(theme)}
          aria-controls={open ? "generic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          {icon}
        </IconButton>
      ) : buttonType === "text" ? (
        <Button
          sx={textButtonStyles(theme)}
          aria-controls={open ? "generic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          {text}
        </Button>
      ) : (
        <Button
          sx={buttonStyles(theme)}
          aria-controls={open ? "generic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          {text}
        </Button>
      )}
      <Menu
        id="generic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: menuPaperStyles(theme),
        }}
      >
        {menuItems.map((item, index) => (
          <div key={index}>
            <MenuItem
              onClick={(e) => {
                if (item.onClick) item.onClick();
                if (!item.subMenuItems) handleClose();
              }}
              onMouseEnter={item.subMenuItems ? handleSubMenuClick : undefined}
              sx={menuItemStyles}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  sx: listItemTextStyles,
                }}
              />
              {item.subMenuItems && (
                <IconButton onClick={handleSubMenuClick}></IconButton>
              )}
            </MenuItem>

            {item.subMenuItems && (
              <Menu
                anchorEl={subMenuAnchorEl}
                open={openSubMenu}
                onClose={handleClose}
                PaperProps={{
                  sx: subMenuPaperStyles(theme),
                }}
              >
                {item.subMenuItems.map((subItem, subIndex) => (
                  <MenuItem
                    key={subIndex}
                    onClick={subItem.onClick}
                    sx={menuItemStyles}
                  >
                    {subItem.icon && (
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                    )}
                    <ListItemText
                      primary={subItem.text}
                      primaryTypographyProps={{
                        sx: listItemTextStyles,
                      }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            )}

            {index < menuItems.length - 1 && <Divider />}
          </div>
        ))}
      </Menu>
    </div>
  );
};

export default MenuComponent;
