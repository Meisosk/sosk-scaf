import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function requireAuth(req, res, next) {
  const token = (req.headers.authorization ?? "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user)
    return res.status(401).json({ error: "Invalid token" });

  req.user = data.user;
  next();
}

app.get("/api/admin/ping", requireAuth, (req, res) => {
  res.json({ message: `Hello ${req.user.email}` });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Admin API listening on :${port}`));
