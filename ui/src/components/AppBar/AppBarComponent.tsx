import React from "react";
import MenuComponent from "../Menu/MenuComponent";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import logo from "../../assets/images/logo.png";

interface Link {
  label: string;
  path?: string;
  icon?: React.ReactElement;
  subLinks?: Link[];
  onClick?: () => void;
}

interface AppBarComponentProps {
  icon?: React.ReactNode;
  title: string;
  userLinks?: Link[];
  links: Link[];
}

const AppBarComponent: React.FC<AppBarComponentProps> = ({
  icon,
  title,
  userLinks = [],
  links,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const mapLinksToMenuItems = (
    linkList: Link[]
  ): {
    text: string;
    onClick?: () => void;
    icon?: React.ReactElement;
    subMenuItems?: any;
  }[] =>
    linkList.map(({ label, path, icon, subLinks, onClick }) => ({
      text: label,
      onClick: onClick || (path ? () => navigate(path) : undefined),
      icon,
      subMenuItems: subLinks ? mapLinksToMenuItems(subLinks) : undefined,
    }));

  const menuItems = mapLinksToMenuItems(links);
  const menuUserItems = mapLinksToMenuItems(userLinks);

  return (
    <AppBar position="static">
      <Toolbar variant="regular">
        {icon && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => navigate("/roles")}
          >
            {icon}
          </IconButton>
        )}
        <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/roles")}>
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
            onClick={() => navigate("/roles")}
          >
            {title}
          </Box>
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {currentUser && (
            <>
              <MenuComponent
                buttonType="text"
                text={`${currentUser?.firstName} ${currentUser?.lastName}`}
                menuItems={menuUserItems}
              />
              <MenuComponent
                buttonType="icon"
                icon={<MenuRoundedIcon />}
                menuItems={menuItems}
              />
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
