import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import type { TablerIcon } from "@tabler/icons-react";
import UserAvatar from "../../../components/UserAvatar/UserAvatar.component";
import MobileListRow from "../../../components/MobileShell/MobileListRow.component";

export interface SettingsHubItem {
  id: string;
  label: string;
  icon: TablerIcon;
  group: string;
}

interface SettingsHubProps {
  items: SettingsHubItem[];
  groups: string[];
  user: { firstName?: string; lastName?: string; username?: string; avatar?: string | null } | null;
  onOpen: (id: string) => void;
}

// Configuración en teléfonos: lista agrupada tipo "Ajustes" de iOS. Cada fila
// abre su sección en una pantalla propia con botón atrás.
const SettingsHub: React.FC<SettingsHubProps> = ({ items, groups, user, onOpen }) => {
  const { colors, borders } = useTheme().tokens;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 2 }}>
      {user && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.75,
            p: 2,
            borderRadius: "14px",
            border: borders.paper,
            backgroundColor: colors.surface,
          }}
        >
          <UserAvatar user={user} size={56} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.0625rem" }} noWrap>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: colors.textMuted }} noWrap>
              @{user.username}
            </Typography>
          </Box>
        </Box>
      )}

      {groups
        .filter((group) => items.some((item) => item.group === group))
        .map((group) => (
          <Box key={group}>
            <Typography
              sx={{
                px: 1.5,
                mb: 0.75,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: colors.textMuted,
              }}
            >
              {group}
            </Typography>
            <Box
              sx={{
                overflow: "hidden",
                borderRadius: "14px",
                border: borders.paper,
                "& > *:last-child [role=button], & > *:last-child": { borderBottom: "none" },
              }}
            >
              {items
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <MobileListRow
                      key={item.id}
                      title={item.label}
                      onClick={() => onOpen(item.id)}
                      leading={
                        <Box
                          aria-hidden
                          sx={{
                            width: 32,
                            height: 32,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "9px",
                            color: colors.accent,
                            backgroundColor: colors.accentSoft,
                          }}
                        >
                          <Icon size={18} stroke={1.8} />
                        </Box>
                      }
                    />
                  );
                })}
            </Box>
          </Box>
        ))}
    </Box>
  );
};

export default SettingsHub;
