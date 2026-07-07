import { Box, Button, Typography } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function Admin() {
  const { user, signOut } = useAuth();

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 10 }}>
      <Typography variant="h5">Admin</Typography>
      <Typography>Signed in as {user?.email}</Typography>
      <Button onClick={signOut}>Sign out</Button>
    </Box>
  );
}
