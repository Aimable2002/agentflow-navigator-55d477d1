/**
 * Attaches the signed-in user's Supabase access token to every server function
 * call, so the server-side agent proxy can forward it to the FastAPI backend.
 */
import { createMiddleware } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";

export const attachPinkAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return next({
    ...(token ? { headers: { authorization: `Bearer ${token}` } } : {}),
  });
});
