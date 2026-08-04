import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { Employee } from "../../models/Employee";
import { getEmployeeColor } from "../../utils/employeeColors";
import { getAvatarSrc } from "../../utils/avatar";
import { getInitials } from "../../utils/string";

interface EmployeeAvatarProps {
  employee: Pick<Employee, "id" | "firstName" | "lastName" | "avatar">;
  size?: number;
  fontSize?: string;
  sx?: SxProps<Theme>;
}

/**
 * Reusable employee avatar: shows the employee's photo (stored in the DB as a
 * base64 data URL) when available, otherwise falls back to initials on the
 * employee color — exactly the current default look.
 */
export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  employee,
  size = 32,
  fontSize,
  sx,
}) => {
  const src = getAvatarSrc(employee.avatar);
  const initials = getInitials(employee.firstName, employee.lastName);
  const empColor = getEmployeeColor(employee.id);

  if (src) {
    // MUI renders children as fallback when the image fails to load, so a
    // broken/corrupt stored data URL degrades gracefully to initials instead
    // of showing the broken-image icon.
    return (
      <Avatar
        src={src}
        alt={`${employee.firstName} ${employee.lastName}`}
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          bgcolor: empColor,
          ...sx,
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: fontSize || `${Math.max(8, Math.round(size * 0.38))}px`, fontWeight: 700, color: "#fff", lineHeight: 1 }}
        >
          {initials}
        </Typography>
      </Avatar>
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: empColor,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: fontSize || `${Math.max(8, Math.round(size * 0.38))}px`,
        fontWeight: 700,
        lineHeight: 1,
        ...sx,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: "inherit",
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1,
        }}
      >
        {initials}
      </Typography>
    </Box>
  );
};

export default EmployeeAvatar;
