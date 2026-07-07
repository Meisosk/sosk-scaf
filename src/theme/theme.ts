import { createTheme } from "@mui/material/styles";
import { palette } from "./palette";

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: palette,
});
