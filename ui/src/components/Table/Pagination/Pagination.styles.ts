export const containerStyles = (
  isSmallScreen: boolean,
): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  whiteSpace: "nowrap",
  padding: isSmallScreen ? "0" : "10px",
});

export const pageTextStyles: React.CSSProperties = {
  minWidth: "80px",
  textAlign: "center",
};
