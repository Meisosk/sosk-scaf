import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Skeleton } from "@mui/material";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <Skeleton />;
  if (!session) return <Navigate to="/signin" replace />;

  return <>{children}</>;
}
