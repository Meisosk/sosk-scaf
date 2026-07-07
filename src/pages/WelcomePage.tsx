import { Box, Typography } from "@mui/material";
import Footer from "../components/Footer";

function WelcomePage() {
  return (
    <Box>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "calc(100vh - 25px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" sx={{ color: "primary.main" }}>
          Welcome to sosk-scaf!
        </Typography>
      </Box>
      <Footer />
    </Box>
  );
}

export default WelcomePage;
