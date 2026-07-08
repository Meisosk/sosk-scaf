import {
  Box,
  Typography,
  Chip,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function PermissionBanner() {
  const {
    session,
    effectiveUser,
    viewAsAnonymous,
    setViewAsAnonymous,
    signOut,
  } = useAuth();

  const navigate = useNavigate();

  return session ? (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: 2,
        py: 1,
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          display: "flex",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {effectiveUser ? (
            <>
              <Chip
                label={effectiveUser.role}
                size="small"
                color="primary"
                variant="outlined"
              />
              {effectiveUser.email && (
                <Typography variant="body2" color="text.secondary">
                  {effectiveUser.email}
                </Typography>
              )}
            </>
          ) : (
            <Chip label="anonymous" size="small" variant="outlined" />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={viewAsAnonymous}
                onChange={(e) => setViewAsAnonymous(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                View as anonymous
              </Typography>
            }
          />

          <Button
            size="small"
            variant="contained"
            sx={{ fontWeight: 700 }}
            onClick={() => navigate("/admin")}
          >
            Admin page
          </Button>

          <Button size="small" variant="outlined" onClick={signOut}>
            Sign out
          </Button>
        </Box>
      </Box>
    </Box>
  ) : null;
}

export default PermissionBanner;
