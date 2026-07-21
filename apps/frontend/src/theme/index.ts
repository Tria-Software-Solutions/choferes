import { lightTheme } from "./light";
import { darkTheme } from "./dark";
import { highContrastTheme } from "./highContrast";

export { lightTheme, darkTheme, highContrastTheme };

// Default export for backward compatibility
const theme = lightTheme;
export default theme;
