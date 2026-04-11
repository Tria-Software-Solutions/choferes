export const containerStyles = (
  isSmallScreen: boolean,
): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  whiteSpace: "nowrap",
  padding: isSmallScreen ? "0" : "4px",
});

export const pageTextStyles: React.CSSProperties = {
  minWidth: "80px",
  textAlign: "center",
};
