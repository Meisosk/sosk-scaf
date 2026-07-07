import { Box, Typography } from "@mui/material";

function App() {
  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" color="primary.main">
        Hello, sosk-scaf
      </Typography>
    </Box>
  );
}

export default App;
