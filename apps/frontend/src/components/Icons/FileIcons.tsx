import React from "react";
import { IconFileTypePdf, IconFileTypeXls } from "@tabler/icons-react";

interface IconProps {
  size?: number;
  className?: string;
}

export const PdfIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <IconFileTypePdf size={size} className={className} />
);

export const ExcelIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <IconFileTypeXls size={size} className={className} />
);
