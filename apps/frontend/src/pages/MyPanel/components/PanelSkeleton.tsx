import React from "react";
import { Box } from "@mui/material";
import { ShimmerBlob } from "../../../components/Loader";

// Esqueleto de "Resumen" mientras carga: reserva el espacio del resultado para
// que la página no salte cuando llegan los datos. Los bloques usan un barrido
// de brillo (con los tokens del tema) en lugar del spinner plano.
export const PanelSkeleton: React.FC = () => (
  <Box
    aria-busy="true"
    aria-label="Cargando tu panel"
    role="status"
    sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 } }}
  >
    <ShimmerBlob height={176} radius={16} speed={1.8} />
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: { xs: 1, sm: 1.25 },
      }}
    >
      {[0, 1, 2, 3].map((item) => (
        <ShimmerBlob key={item} height={112} radius={12} speed={1.8} />
      ))}
    </Box>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
        gap: { xs: 1.5, md: 2 },
      }}
    >
      <ShimmerBlob height={280} radius={14} speed={1.8} />
      <ShimmerBlob height={280} radius={14} speed={1.8} />
    </Box>
  </Box>
);
