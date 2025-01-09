import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuComponent from "../Menu/MenuComponent";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import logo from '../../assets/images/logo.png'; 

interface Link {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  subLinks?: Link[];
}

interface AppBarComponentProps {
  icon?: React.ReactNode;
  title: string;
  links: Link[];
}

const AppBarComponent: React.FC<AppBarComponentProps> = ({
  icon,
  title,
  links,
}) => {
  const menuItems = links.map((link) => ({
    text: link.label,
    onClick: () => {
      if (link.path) {
        window.location.href = link.path;
      }
    },
    icon: link.icon as React.ReactElement | undefined,
    subMenuItems: link.subLinks?.map((subLink) => ({
      text: subLink.label,
      onClick: () => {
        if (subLink.path) {
          window.location.href = subLink.path;
        }
      },
      icon: subLink.icon as React.ReactElement | undefined,
    })),
  }));

  return (
    <AppBar position="static">
      <Toolbar variant="regular">
        {icon && (
          <IconButton edge="start" color="inherit" aria-label="menu">
            {icon}
          </IconButton>
        )}
        <img
          src={logo}
          alt="Logo"
          style={{
            width: '28px',
            height: 'auto', 
            marginRight: '10px', 
          }}
        />
        <Typography
          variant="h5"
          sx={{ flexGrow: 1, fontFamily: "'Protest Guerrilla', sans-serif" }}
        >
          {title}
        </Typography>
        <MenuComponent icon={<MenuRoundedIcon />} menuItems={menuItems} />
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
