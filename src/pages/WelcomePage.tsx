import { Box, Button, Typography } from "@mui/material";
import Footer from "../components/Footer";
import { useTrackPageView } from "../hooks/useTrackPageView";
import { useTrackEvent } from "../hooks/useTrackEvent";

function WelcomePage() {
  useTrackPageView("/");
  const trackEvent = useTrackEvent();

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
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h4" sx={{ color: "primary.main" }}>
            Welcome to sosk-scaf!
          </Typography>

          <Button
            onClick={() =>
              trackEvent("cta_click", "/", { label: "Get Started" })
            }
          >
            Get Started
          </Button>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

export default WelcomePage;
