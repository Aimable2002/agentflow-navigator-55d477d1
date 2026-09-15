import { createClient } from "@supabase/supabase-js";

/**
 * PINK talks to its own Supabase project (auth, conversations, tasks,
 * connector records, usage). Values come from .env so the project can be
 * swapped without touching code; the literals below are the current
 * project's publishable values and are safe to ship in the client bundle.
 */
export const SUPABASE_URL =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ?? "https://vnnspuyxxqvcdeafzyoe.supabase.co";

export const SUPABASE_ANON_KEY =
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubnNwdXl4eHF2Y2RlYWZ6eW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzOTU4MDUsImV4cCI6MjEwNDk3MTgwNX0.lv-Nz2fDZlc17yk_6MBhlvdok-NWGXlp689Bd_vR3SA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "pink-auth",
  },
});
