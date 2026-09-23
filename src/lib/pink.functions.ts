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

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

type ProxyResult =
  | { ok: true; status: number; body: Record<string, Json> | null }
  | { ok: false; status: number; message: string };

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
      const parsed = JSON.parse(text) as { detail?: unknown };
      if (typeof parsed.detail === "string") message = parsed.detail;
      else if (Array.isArray(parsed.detail)) message = "The backend rejected this request.";
    } catch {
      /* keep the raw body */
    }
    if (response.status >= 500) {
      message = "This isn't available from the agent backend yet — it returned a server error, so there is nothing to show.";
    }
    return { ok: false, status: response.status, message };
  }

  return { ok: true, status: response.status, body: text ? (JSON.parse(text) as Record<string, Json>) : null };
}

/** POST /v1/chat — queues an agent run and returns { job_id, status, plan }. */
export const startChatFn = createServerFn({ method: "POST" })
  .inputValidator((input: { prompt: string; messages?: unknown[]; connectors?: string[]; mode?: "chat" | "agent" }) => input)
  .handler(({ data }) =>
    callBackend("/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        prompt: data.prompt,
        messages: data.messages ?? [],
        connectors: data.connectors ?? [],
        mode: data.mode ?? "chat",
      }),
    }),
  );

/** GET /v1/chat/{job_id} — polls a queued run. */
export const getJobFn = createServerFn({ method: "POST" })
  .inputValidator((input: { jobId: string }) => input)
  .handler(({ data }) => callBackend(`/v1/chat/${encodeURIComponent(data.jobId)}`, { method: "GET" }));

/** POST /v1/chat/{job_id}/cancel — requests cancellation of a queued run. */
export const cancelJobFn = createServerFn({ method: "POST" })
  .inputValidator((input: { jobId: string }) => input)
  .handler(({ data }) => callBackend(`/v1/chat/${encodeURIComponent(data.jobId)}/cancel`, { method: "POST" }));

/** GET /healthz — backend liveness. */
export const healthFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend("/healthz", { method: "GET" }),
);

/* ------------------------------------------------------------- telegram */

export const telegramStatusFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend("/v1/telegram/status", { method: "GET" }),
);

export const telegramStartFn = createServerFn({ method: "POST" })
  .inputValidator((input: { phone: string }) => input)
  .handler(({ data }) =>
    callBackend("/v1/telegram/start", { method: "POST", body: JSON.stringify({ phone: data.phone }) }),
  );

export const telegramVerifyFn = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string }) => input)
  .handler(({ data }) =>
    callBackend("/v1/telegram/verify", { method: "POST", body: JSON.stringify({ code: data.code }) }),
  );

export const telegramTwoFaFn = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) => input)
  .handler(({ data }) =>
    callBackend("/v1/telegram/2fa", { method: "POST", body: JSON.stringify({ password: data.password }) }),
  );

export const telegramDisconnectFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend("/v1/telegram", { method: "DELETE" }),
);

/* ------------------------------------------------------------- whatsapp */

export const whatsappStatusFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend("/v1/whatsapp/status", { method: "GET" }),
);

export const whatsappSaveCredentialsFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { access_token: string; phone_number_id: string; business_account_id: string; alert_recipient: string }) =>
      input,
  )
  .handler(({ data }) => callBackend("/v1/whatsapp/credentials", { method: "PUT", body: JSON.stringify(data) }));

export const whatsappDisconnectFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend("/v1/whatsapp/credentials", { method: "DELETE" }),
);

export const whatsappSendTestFn = createServerFn({ method: "POST" })
  .inputValidator((input: { message?: string }) => input)
  .handler(({ data }) =>
    callBackend("/v1/whatsapp/test", { method: "POST", body: JSON.stringify({ message: data.message ?? "This is a test alert." }) }),
  );

/* ------------------------------------------------- agent services */

const TELEGRAM_SERVICE = "/v1/agent-services/telegram-signal-monitor";
const TRADING_SERVICE = "/v1/agent-services/trading-agent";

/** GET /v1/telegram/chats — chats the connected Telegram account can see. */
export const telegramChatsFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend("/v1/telegram/chats", { method: "GET" }),
);

/** GET the monitor's status + saved config. */
export const signalMonitorStatusFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend(TELEGRAM_SERVICE, { method: "GET" }),
);

/** PUT the monitor's config. */
export const signalMonitorSaveFn = createServerFn({ method: "POST" })
  .inputValidator((input: { monitored_chats: string[]; alert_chat: string }) => input)
  .handler(({ data }) => callBackend(TELEGRAM_SERVICE, { method: "PUT", body: JSON.stringify(data) }));

/** POST activate — 400 when no chats are selected. */
export const signalMonitorActivateFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend(`${TELEGRAM_SERVICE}/activate`, { method: "POST" }),
);

/** POST pause. */
export const signalMonitorPauseFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend(`${TELEGRAM_SERVICE}/pause`, { method: "POST" }),
);

/** GET the recent scored signals. */
export const signalMonitorSignalsFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend(`${TELEGRAM_SERVICE}/signals`, { method: "GET" }),
);

/** GET trading agent status + saved config. */
export const tradingAgentStatusFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend(TRADING_SERVICE, { method: "GET" }),
);

/** PUT the trading agent config. */
export const tradingAgentSaveFn = createServerFn({ method: "POST" })
  .inputValidator((input: { pair: string | null; timeframe: string | null; connector: "mt5" | "ctrader"; candle_tool: string; forecast_models: string[] }) => input)
  .handler(({ data }) => callBackend(TRADING_SERVICE, { method: "PUT", body: JSON.stringify(data) }));

/** POST activate. */
export const tradingAgentActivateFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend(`${TRADING_SERVICE}/activate`, { method: "POST" }),
);

/** POST pause. */
export const tradingAgentPauseFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend(`${TRADING_SERVICE}/pause`, { method: "POST" }),
);

/** POST queue a new market signal. */
export const tradingAgentGenerateFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend(`${TRADING_SERVICE}/generate`, { method: "POST" }),
);

/** GET recent trading signals. */
export const tradingAgentSignalsFn = createServerFn({ method: "POST" }).handler(() =>
  callBackend(`${TRADING_SERVICE}/signals`, { method: "GET" }),
);

/* ------------------------------------------------------- mt5 ea execution */

/** GET /v1/ea/orders — pending trade orders for the signed-in user. */
export const eaOrdersFn = createServerFn({ method: "POST" })
  .inputValidator((input: { limit?: number }) => input)
  .handler(({ data }) =>
    callBackend(`/v1/ea/orders?limit=${Math.min(Math.max(data.limit ?? 50, 1), 200)}`, { method: "GET" }),
  );
