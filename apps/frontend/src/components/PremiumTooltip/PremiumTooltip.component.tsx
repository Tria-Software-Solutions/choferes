import React from "react";
import { Tooltip, TooltipProps, useTheme } from "@mui/material";

type PremiumTooltipProps = Omit<TooltipProps, "componentsProps" | "slotProps" | "arrow">;

const PremiumTooltip: React.FC<PremiumTooltipProps> = (props) => {
  const theme = useTheme();
  const { children, ...rest } = props;

  return (
    <Tooltip
      {...rest}
      arrow
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 8],
              },
            },
          ],
        },
        tooltip: {
          sx: {
            backgroundColor: theme.palette.grey[700],
            color: theme.palette.common.white,
            fontSize: "0.8rem",
            fontWeight: 400,
            padding: "6px 12px",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            letterSpacing: "0.01em",
            lineHeight: 1.4,
            maxWidth: 240,
            textAlign: "center",
            transition: "all 0.15s ease-out",
            opacity: 0.95,
            "& .MuiTooltip-arrow": {
              color: theme.palette.grey[700],
              width: 8,
              height: 8,
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default PremiumTooltip;
