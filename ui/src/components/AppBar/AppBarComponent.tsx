import React from "react";
import MenuComponent from "../Menu/MenuComponent";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import logo from "../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";

interface Link {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  subLinks?: Link[];
  onClick?: () => void; 
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
  const navigate = useNavigate();
  const menuItems = links.map((link) => ({
    text: link.label,
    onClick: link.onClick 
      ? link.onClick
      : () => {
          if (link.path) {
            window.location.href = link.path;
          }
        },
    icon: link.icon as React.ReactElement | undefined,
    subMenuItems: link.subLinks?.map((subLink) => ({
      text: subLink.label,
      onClick: subLink.onClick 
        ? subLink.onClick
        : () => {
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
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => navigate("/")}
          >
            {icon}
          </IconButton>
        )}
        <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "28px",
              height: "auto",
              marginRight: "10px",
            }}
          />
        </Box>
        <Typography
          variant="h5"
          sx={{ flexGrow: 1, fontFamily: "'Protest Guerrilla', sans-serif" }}
        >
          <Box
            sx={{ cursor: "pointer", display: "inline-block" }}
            onClick={() => navigate("/")}
          >
            {title}
          </Box>
        </Typography>
        <MenuComponent icon={<MenuRoundedIcon />} menuItems={menuItems} />
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
