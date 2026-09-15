/**
 * Server-side proxy to the PINK agent backend (FastAPI).
 *
 * The browser cannot call the backend directly: it serves no CORS headers, so
 * a cross-origin fetch is blocked before it leaves the page. These server
 * functions run same-origin, forward the caller's Supabase bearer token
 * (which the backend verifies) and return the backend's JSON untouched.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const PINK_API_URL = ((import.meta.env["VITE_PINK_API_URL"] as string | undefined) ?? "").replace(/\/$/, "");

type ProxyResult = { ok: true; status: number; body: unknown } | { ok: false; status: number; message: string };

async function callBackend(path: string, init: RequestInit): Promise<ProxyResult> {
  if (!PINK_API_URL) {
    return { ok: false, status: 0, message: "The agent backend is not connected yet." };
  }

  const authorization = getRequest().headers.get("authorization");
  if (!authorization) {
    return { ok: false, status: 401, message: "You need to be signed in to talk to the agent." };
  }

  let response: Response;
  try {
    response = await fetch(`${PINK_API_URL}${path}`, {
      ...init,
      headers: { "content-type": "application/json", authorization, ...(init.headers ?? {}) },
    });
  } catch {
    return { ok: false, status: 0, message: "The agent backend could not be reached." };
  }

  const text = await response.text();
  if (!response.ok) {
    let message = text || `Request failed (${response.status})`;
    try {
      const parsed = JSON.parse(text) as { detail?: string };
      if (parsed.detail) message = parsed.detail;
    } catch {
      /* keep the raw body */
    }
    return { ok: false, status: response.status, message };
  }

  return { ok: true, status: response.status, body: text ? JSON.parse(text) : null };
}

/** POST /v1/chat — queues an agent run and returns { job_id, status, plan }. */
export const startChatFn = createServerFn({ method: "POST" })
  .inputValidator((input: { prompt: string; messages?: unknown[]; connectors?: string[] }) => input)
  .handler(({ data }) =>
    callBackend("/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        prompt: data.prompt,
        messages: data.messages ?? [],
        connectors: data.connectors ?? [],
      }),
    }),
  );

/** GET /v1/chat/{job_id} — polls a queued run. */
export const getJobFn = createServerFn({ method: "POST" })
  .inputValidator((input: { jobId: string }) => input)
  .handler(({ data }) => callBackend(`/v1/chat/${encodeURIComponent(data.jobId)}`, { method: "GET" }));

/** GET /healthz — backend liveness. */
export const healthFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend("/healthz", { method: "GET" }),
);
