import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box sx={{ height: "25px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          borderTop: 1,
          borderColor: "secondary.main",
        }}
      >
        <Typography sx={{ color: "secondary.main", marginRight: "8px" }}>
          © 2026 Meir Soskil
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
