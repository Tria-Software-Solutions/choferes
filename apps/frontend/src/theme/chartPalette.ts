// Categorical palette for charts (donuts, legends, series). Harmonised with the
// indigo accent: cool hues first, warm ones last, tuned per mode for contrast.
const LIGHT = ["#4f46e5", "#0ea5e9", "#14b8a6", "#8b5cf6", "#f59e0b", "#ec4899", "#64748b", "#84cc16"];
const DARK = ["#818cf8", "#38bdf8", "#2dd4bf", "#a78bfa", "#fbbf24", "#f472b6", "#94a3b8", "#a3e635"];

export const getChartPalette = (mode: "light" | "dark"): string[] => (mode === "dark" ? DARK : LIGHT);
