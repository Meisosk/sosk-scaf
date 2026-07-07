import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: { palette: { primary: { main: "#2563eb" } } },
    dark: { palette: { primary: { main: "#60a5fa" } } },
  },
});
