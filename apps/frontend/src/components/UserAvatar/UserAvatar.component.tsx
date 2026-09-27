import React from "react";
import { Avatar } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { getAvatarSrc } from "../../utils/avatar";

interface UserAvatarProps {
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    avatar?: string | null;
  } | null;
  /** Diameter in px. */
  size?: number;
  /** Overrides the stored avatar (e.g. an unsaved upload preview). */
  src?: string | null;
  sx?: SxProps<Theme>;
}

export const getUserInitials = (user?: UserAvatarProps["user"]): string => {
  if (!user) return "?";
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  return initials || user.username?.[0]?.toUpperCase() || "?";
};

// The signed-in user's avatar, identical everywhere (top bar, account menu,
// mobile drawer, Configuración): the photo when there is one, otherwise the
// theme's tinted initials. MUI falls back to the initials if the image fails.
export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 32, src, sx }) => (
  <Avatar
    src={src ?? getAvatarSrc(user?.avatar)}
    alt={user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : undefined}
    sx={[
      { width: size, height: size, fontSize: `${Math.max(0.7, size / 40)}rem` },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
  >
    {getUserInitials(user)}
  </Avatar>
);

export default UserAvatar;
