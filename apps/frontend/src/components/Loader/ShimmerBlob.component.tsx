import React from "react";
import { Box, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { blobMorph, shimmerSweep } from "./loaderStyles";

export interface ShimmerBlobProps {
  width?: number | string;
  height?: number | string;
  /** Radio base del bloque (px). Se ignora si `blob` está activo. */
  radius?: number | string;
  /** Silueta orgánica (morph de bordes) en vez de un rectángulo redondeado. */
  blob?: boolean;
  /** Duración del barrido en segundos. */
  speed?: number;
  sx?: SxProps<Theme>;
}

/**
 * Bloque de esqueleto con barrido de brillo, coloreado con los tokens del tema.
 * Sirve para reservar el espacio de tarjetas/bloques mientras cargan. Con
 * `blob` toma una silueta orgánica que respira (morph), ideal para "blobs" de
 * carga llamativos. Respeta `prefers-reduced-motion`.
 */
export const ShimmerBlob: React.FC<ShimmerBlobProps> = ({
  width = "100%",
  height = 16,
  radius = 12,
  blob = false,
  speed = 1.6,
  sx,
}) => {
  const { colors } = useTheme().tokens;

  const base = colors.hover;
  const highlight = colors.hoverStrong;
  const gradient = `linear-gradient(100deg, ${base} 30%, ${highlight} 50%, ${base} 70%)`;

  return (
    <Box
      aria-hidden
      sx={[
        {
          width,
          height,
          borderRadius: blob ? "46% 54% 58% 42% / 48% 44% 56% 52%" : `${radius}px`,
          backgroundColor: base,
          backgroundImage: gradient,
          backgroundSize: "220% 100%",
          backgroundRepeat: "no-repeat",
          animation: `${shimmerSweep} ${speed}s linear infinite${
            blob ? `, ${blobMorph} ${speed * 2}s ease-in-out infinite` : ""
          }`,
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
};
