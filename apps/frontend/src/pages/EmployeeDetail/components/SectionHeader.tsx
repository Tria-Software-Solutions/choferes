import React, { ReactNode } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
  sectionDescStyles,
  sectionDividerStyles,
  sectionHeaderIconStyles,
  sectionHeaderRowStyles,
  sectionHeaderStyles,
  sectionTitleStyles,
} from "../styles";

interface SectionHeaderProps {
  /** Icon rendered at 20px in the accent color. */
  icon: ReactNode;
  title: string;
  /** Short sentence rendered under the title, as in Configuraciones. */
  description?: string;
  /** Hairline divider under the header. Disable for stacked compact cards. */
  divider?: boolean;
  /** Right-aligned actions/metrics rendered next to the title. */
  actions?: ReactNode;
  sx?: Record<string, unknown>;
}

// Section header shared by every Employee Detail card: primary icon + h6
// title, optional caption, optional hairline divider and optional right slot.
// Mirrors the header used across the Configuraciones page.
const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  description,
  divider = true,
  actions,
  sx,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ ...sectionHeaderStyles, ...sx }}>
      <Box sx={sectionHeaderRowStyles}>
        <Box sx={sectionHeaderIconStyles(theme)}>{icon}</Box>
        {/* Title and description share a column so a wrapped description
            stays aligned with the title; its 240px basis makes the actions
            wrap below on narrow cards instead of squeezing the text. */}
        <Box sx={{ minWidth: 0, flex: { xs: "1 1 0", md: "1 1 240px" } }}>
          <Typography variant="h6" sx={sectionTitleStyles}>
            {title}
          </Typography>
          {description && (
            <Typography variant="caption" component="p" sx={sectionDescStyles}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", flexWrap: { xs: "nowrap", md: "wrap" }, gap: 2 }}>
            {actions}
          </Box>
        )}
      </Box>
      {divider && <Box sx={sectionDividerStyles(theme)} />}
    </Box>
  );
};

export default SectionHeader;
