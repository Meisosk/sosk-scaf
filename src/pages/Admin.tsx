import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  useTheme,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { groupViewsByDay } from "../lib/analytics";

interface PageViewRow {
  path: string;
  referrer: string | null;
  session_id: string | null;
  created_at: string;
}

interface EventRow {
  event_name: string;
  path: string;
  created_at: string;
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const [views, setViews] = useState<PageViewRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from("page_views")
        .select("path, referrer, session_id, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("event_name, path, created_at")
        .order("created_at", { ascending: false }),
    ]).then(([viewsRes, eventsRes]) => {
      if (viewsRes.error) console.error(viewsRes.error);
      else setViews(viewsRes.data ?? []);

      if (eventsRes.error) console.error(eventsRes.error);
      else setEvents(eventsRes.data ?? []);

      setLoading(false);
    });
  }, []);

  const totalsByPath = views.reduce<Record<string, number>>((acc, v) => {
    acc[v.path] = (acc[v.path] ?? 0) + 1;
    return acc;
  }, {});

  const uniqueSessions = new Set(views.map((v) => v.session_id).filter(Boolean))
    .size;

  const last24h = views.filter(
    (v) => Date.now() - new Date(v.created_at).getTime() < 24 * 60 * 60 * 1000
  ).length;

  const referrerCounts = views.reduce<Record<string, number>>((acc, v) => {
    let source = "Direct";
    if (v.referrer) {
      try {
        source = new URL(v.referrer).hostname;
      } catch {
        source = "Direct";
      }
    }
    acc[source] = (acc[source] ?? 0) + 1;
    return acc;
  }, {});

  const eventCounts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.event_name] = (acc[e.event_name] ?? 0) + 1;
    return acc;
  }, {});

  const dailyViews = groupViewsByDay(views);
  const referrerChartData = Object.entries(referrerCounts).map(
    ([name, value]) => ({ name, value })
  );
  const pathChartData = Object.entries(totalsByPath).map(([name, value]) => ({
    name,
    value,
  }));

  // Pull chart colors from the active theme so charts follow palette.ts automatically
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 10, px: 2 }}>
      <Typography variant="h5">Admin</Typography>
      <Typography>Signed in as {user?.email}</Typography>

      {loading ? (
        <Typography>Loading analytics...</Typography>
      ) : (
        <>
          {/* Summary cards */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={4}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4">{views.length}</Typography>
                <Typography color="text.secondary">Total views</Typography>
              </Paper>
            </Grid>
            <Grid size={4}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4">{uniqueSessions}</Typography>
                <Typography color="text.secondary">Unique sessions</Typography>
              </Paper>
            </Grid>
            <Grid size={4}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4">{last24h}</Typography>
                <Typography color="text.secondary">Last 24h</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Views over time */}
          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Views over time
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyViews}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                />
                <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                <YAxis
                  allowDecimals={false}
                  stroke={theme.palette.text.secondary}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Views by page */}
            <Grid size={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Views by page
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={pathChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.divider}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke={theme.palette.text.secondary}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.text.primary,
                      }}
                    />
                    <Bar dataKey="value" fill={theme.palette.secondary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Referrer breakdown */}
            <Grid size={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Referrers
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={referrerChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {referrerChartData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={chartColors[i % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.text.primary,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Events table */}
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6">Events</Typography>
            {Object.keys(eventCounts).length === 0 ? (
              <Typography color="text.secondary">
                No events tracked yet.
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                    }}
                  >
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: 600,
                      }}
                    >
                      Event
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: 600,
                      }}
                    >
                      Count
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(eventCounts).map(([name, count], i) => (
                    <TableRow
                      key={name}
                      sx={{
                        backgroundColor:
                          i % 2 === 0
                            ? "transparent"
                            : theme.palette.action.hover,
                        "&:hover": {
                          backgroundColor: theme.palette.action.selected,
                        },
                      }}
                    >
                      <TableCell sx={{ borderColor: theme.palette.divider }}>
                        {name}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderColor: theme.palette.divider }}
                      >
                        {count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </>
      )}

      <button onClick={signOut} style={{ marginTop: 24 }}>
        Sign out
      </button>
    </Box>
  );
}
