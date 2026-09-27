import React, { useState } from "react";
import { Button, IconButton, Menu, MenuItem, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { IconChevronDown, IconDownload } from "@tabler/icons-react";

export interface ExportAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface ExportMenuProps {
  actions: ExportAction[];
  disabled?: boolean;
  label?: string;
}

// Standard "Exportar" control for every list page: a quiet outlined button
// (icon-only on phones) opening a menu with the available formats.
const ExportMenu: React.FC<ExportMenuProps> = ({ actions, disabled = false, label = "Exportar" }) => {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  if (actions.length === 0) return null;

  const open = (event: React.MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);

  return (
    <>
      {isPhone ? (
        <Tooltip title={label}>
          <span>
            <IconButton
              onClick={open}
              disabled={disabled}
              aria-label={label}
              aria-haspopup="menu"
              sx={{ border: theme.tokens.borders.paper, width: 38, height: 38 }}
            >
              <IconDownload size={17} stroke={1.75} />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          onClick={open}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          startIcon={<IconDownload size={16} stroke={1.75} />}
          endIcon={<IconChevronDown size={15} stroke={1.75} />}
        >
          {label}
        </Button>
      )}
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 0.75 } } }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.label}
            onClick={() => {
              setAnchor(null);
              action.onClick();
            }}
          >
            {action.icon}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ExportMenu;
