import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getSessionId } from "../lib/session";

export function useTrackEvent() {
  return useCallback(
    (eventName: string, path: string, metadata?: Record<string, unknown>) => {
      supabase
        .from("events")
        .insert({
          event_name: eventName,
          path,
          session_id: getSessionId(),
          metadata: metadata ?? null,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to track event:", error);
        });
    },
    []
  );
}
