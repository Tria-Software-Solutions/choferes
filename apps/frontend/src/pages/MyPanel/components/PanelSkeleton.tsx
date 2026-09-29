import React from "react";
import { Box, Skeleton } from "@mui/material";

const block = { borderRadius: "14px" } as const;

// Esqueleto de "Resumen" mientras carga: reserva el espacio del resultado para
// que la página no salte cuando llegan los datos.
export const PanelSkeleton: React.FC = () => (
  <Box aria-busy="true" aria-label="Cargando tu panel" role="status" sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 } }}>
    <Skeleton variant="rounded" height={176} sx={{ ...block, borderRadius: "16px" }} />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: { xs: 1, sm: 1.25 } }}>
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} variant="rounded" height={112} sx={{ borderRadius: "12px" }} />
      ))}
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: { xs: 1.5, md: 2 } }}>
      <Skeleton variant="rounded" height={280} sx={block} />
      <Skeleton variant="rounded" height={280} sx={block} />
    </Box>
  </Box>
);
