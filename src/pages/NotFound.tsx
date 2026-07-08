import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "4rem", fontWeight: 700 }}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        This page doesn't exist.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => navigate("/")}>
          Go home
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </Stack>
    </Box>
  );
}
