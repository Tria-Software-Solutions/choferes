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
} from "@mui/material";

interface MenuItemProps {
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

const MenuComponent: React.FC<MenuComponentProps> = ({
  buttonType,
  icon,
  text,
  menuItems,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const open = Boolean(anchorEl);
  const openSubMenu = Boolean(subMenuAnchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSubMenuAnchorEl(null);
  };

  const handleSubMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setSubMenuAnchorEl(event.currentTarget);
  };

  return (
    <div>
      {buttonType === "icon" ? (
        <IconButton
          color="inherit"
          sx={{
            height: "40px",
            border: "0.5px solid #f0f2f5",
            borderRadius: "6px",
          }}
          aria-controls={open ? "generic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          {icon}
        </IconButton>
      ) : buttonType === "text" ? (
        <Button
          sx={{
            height: "40px",
          }}
          aria-controls={open ? "generic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          {text}
        </Button>
      ) : (
        <Button
          sx={{
            height: "40px",
            border: "0.5px solid #f0f2f5",
            borderRadius: "6px",
          }}
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
          sx: {
            mt: 1.5,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          },
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
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.text} />
              {item.subMenuItems && (
                <IconButton onClick={handleSubMenuClick}></IconButton>
              )}
            </MenuItem>

            {item.subMenuItems && (
              <Menu
                anchorEl={subMenuAnchorEl}
                open={openSubMenu}
                onClose={handleClose}
              >
                {item.subMenuItems.map((subItem, subIndex) => (
                  <MenuItem key={subIndex} onClick={subItem.onClick}>
                    {subItem.icon && (
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                    )}
                    <ListItemText primary={subItem.text} />
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
