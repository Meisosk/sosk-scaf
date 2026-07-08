import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getSessionId } from "../lib/session";

export function useTrackPageView(path: string) {
  useEffect(() => {
    supabase
      .from("page_views")
      .insert({
        path,
        referrer: document.referrer || null,
        session_id: getSessionId(),
      })
      .then(({ error }) => {
        if (error) console.error("Failed to track page view:", error);
      });
  }, [path]);
}
