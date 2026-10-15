import React from "react";
import { Box, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { dotWave } from "./loaderStyles";

export type LoaderSize = "xs" | "sm" | "md" | "lg";

const SIZE_PX: Record<LoaderSize, number> = {
  xs: 16,
  sm: 20,
  md: 32,
  lg: 72,
};

export interface DotsLoaderProps {
  size?: LoaderSize;
  /**
   * Color de los puntos. Por defecto usa el acento del tema; dentro de botones
   * conviene pasar `currentColor` para heredar el color del texto.
   */
  color?: string;
  /** Texto accesible. Si se omite, el loader es decorativo (`aria-hidden`). */
  label?: string;
  sx?: SxProps<Theme>;
}

/**
 * Loader de tres puntos que crecen y se desvanecen en cascada. CSS puro (con las
 * `keyframes` de emotion), sin dependencias, y coloreado con los tokens del
 * tema. Respeta `prefers-reduced-motion`.
 */
export const DotsLoader: React.FC<DotsLoaderProps> = ({
  size = "md",
  color,
  label,
  sx,
}) => {
  const { colors } = useTheme().tokens;

  const px = SIZE_PX[size];
  const dot = px / 4;
  const gap = px / 8;
  const fill = color ?? colors.accent;

  const dotBase: SxProps<Theme> = {
    width: dot,
    height: dot,
    borderRadius: "50%",
    backgroundColor: fill,
    willChange: "transform, opacity",
  };

  return (
    <Box
      role={label ? "progressbar" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      sx={[
        {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: `${gap}px`,
          height: px,
          lineHeight: 0,
          color: fill,
          "& .dots-orb-a": { animation: `${dotWave} 1.2s ease-in-out infinite` },
          "& .dots-orb-b": {
            animation: `${dotWave} 1.2s ease-in-out infinite`,
            animationDelay: "0.15s",
          },
          "& .dots-orb-c": {
            animation: `${dotWave} 1.2s ease-in-out infinite`,
            animationDelay: "0.3s",
          },
          "@media (prefers-reduced-motion: reduce)": {
            "& .dots-orb": { animation: "none" },
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box className="dots-orb dots-orb-a" sx={dotBase} />
      <Box className="dots-orb dots-orb-b" sx={dotBase} />
      <Box className="dots-orb dots-orb-c" sx={dotBase} />
    </Box>
  );
};
