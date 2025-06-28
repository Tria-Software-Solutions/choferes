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
  const theme = useTheme();
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
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              transform: 'translateY(-1px)',
            },
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
            color: theme.palette.primary.contrastText,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              transform: 'translateY(-1px)',
            },
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
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              transform: 'translateY(-1px)',
            },
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
            boxShadow: theme.shadows[8],
            border: `1px solid ${theme.palette.divider}`,
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
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  sx: { fontWeight: 500 }
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
                  sx: {
                    boxShadow: theme.shadows[8],
                    border: `1px solid ${theme.palette.divider}`,
                  },
                }}
              >
                {item.subMenuItems.map((subItem, subIndex) => (
                  <MenuItem 
                    key={subIndex} 
                    onClick={subItem.onClick}
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    {subItem.icon && (
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                    )}
                    <ListItemText 
                      primary={subItem.text}
                      primaryTypographyProps={{
                        sx: { fontWeight: 500 }
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
