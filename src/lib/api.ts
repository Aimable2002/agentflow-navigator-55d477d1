/**
 * Client for the PINK agent backend (FastAPI).
 *
 * Calls go through this app's own server (src/lib/pink.functions.ts), which
 * forwards them to the backend with the signed-in user's bearer token. That
 * avoids the browser's cross-origin restrictions, since the backend serves no
 * CORS headers of its own.
 *
 * Endpoints, as published by the backend's OpenAPI document:
 *   POST /v1/chat            -> { job_id, status, plan }
 *   GET  /v1/chat/{job_id}   -> { status, data?, error? }
 *   GET  /healthz            -> { status }
 *
 * The frontend persists conversations, messages and tasks in Supabase and
 * polls the job until it resolves.
 */
import {
  cancelJobFn,
  getJobFn,
  signalMonitorActivateFn,
  signalMonitorPauseFn,
  signalMonitorSaveFn,
  signalMonitorSignalsFn,
  signalMonitorStatusFn,
  healthFn,
  PINK_API_URL,
  startChatFn,
  telegramChatsFn,
  telegramDisconnectFn,
  telegramStartFn,
  telegramStatusFn,
  telegramTwoFaFn,
  telegramVerifyFn,
  tradingAgentActivateFn,
  tradingAgentGenerateFn,
  tradingAgentPauseFn,
  tradingAgentSaveFn,
  tradingAgentSignalsFn,
  tradingAgentStatusFn,
  whatsappDisconnectFn,
  whatsappSaveCredentialsFn,
  whatsappSendTestFn,
  whatsappStatusFn,
} from "@/lib/pink.functions";

export { PINK_API_URL };

export const isApiConfigured = PINK_API_URL.length > 0;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ProxyResult =
  | { ok: true; status: number; body: Record<string, unknown> | null }
  | { ok: false; status: number; message: string };

function unwrap<T>(result: ProxyResult): T {
  if (!result.ok) throw new ApiError(result.status, result.message);
  return (result.body ?? {}) as T;
}

export type ChatPlan = { tier?: "small" | "medium" | "best"; difficulty?: number; reason?: string };
export type ChatMode = "chat" | "agent";

export type StartChatResponse = {
  job_id: string;
  status: string;
  plan?: string | ChatPlan;
};

export type AgentStep = { connector: string; action: string; detail?: string };

export type JobStatusResponse = {
  status: "pending" | "done" | "failed" | string;
  data?: {
    final_message?: string;
    message?: string;
    content?: string;
    tier?: "small" | "medium" | "best";
    steps?: AgentStep[];
  };
  error?: string;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function terminalStatus(value: unknown): JobStatusResponse["status"] {
  const status = String(value ?? "").toLowerCase();
  if (["done", "completed", "complete", "success", "succeeded"].includes(status)) return "done";
  if (["failed", "failure", "error", "errored"].includes(status)) return "failed";
  if (["cancelled", "canceled", "revoked"].includes(status)) return "cancelled";
  return "pending";
}

export type ApiHistoryMessage = { role: "user" | "assistant" | "system"; content: string };

/** POST /v1/chat — queues an agent run. */
export async function startChat(input: {
  prompt: string;
  messages?: ApiHistoryMessage[];
  connectors?: string[];
  mode: ChatMode;
}) {
  const result = await startChatFn({
    data: {
      prompt: input.prompt,
      messages: input.messages ?? [],
      connectors: input.connectors ?? [],
      mode: input.mode,
    },
  });
  return unwrap<StartChatResponse>(result as ProxyResult);
}

/** GET /v1/chat/{job_id} — polls a queued run. */
export async function getJob(jobId: string) {
  const result = await getJobFn({ data: { jobId } });
  const body = unwrap<Record<string, unknown>>(result as ProxyResult);
  const payload = record(body["data"] ?? body["result"]);
  const message = [
    payload["final_message"],
    payload["message"],
    payload["content"],
    body["final_message"],
    body["message"],
    body["content"],
  ].find((value): value is string => typeof value === "string" && value.length > 0);
  const data: JobStatusResponse["data"] = {
    ...(message ? { final_message: message } : {}),
    ...(payload["tier"] === "small" || payload["tier"] === "medium" || payload["tier"] === "best"
      ? { tier: payload["tier"] }
      : {}),
    ...(Array.isArray(payload["steps"]) ? { steps: payload["steps"] as AgentStep[] } : {}),
  };

  return {
    status: terminalStatus(body["status"] ?? body["state"] ?? payload["status"]),
    ...(Object.keys(data).length ? { data } : {}),
    ...(typeof body["error"] === "string" ? { error: body["error"] } : {}),
  } satisfies JobStatusResponse;
}

/** POST /v1/chat/{job_id}/cancel — requests cancellation of a queued run. */
export async function cancelJob(jobId: string) {
  const result = await cancelJobFn({ data: { jobId } });
  return unwrap<Record<string, unknown>>(result as ProxyResult);
}

/** GET /healthz */
export async function apiHealth() {
  const result = await healthFn();
  return unwrap<{ status: string }>(result as ProxyResult);
}

/* ------------------------------------------------------------- telegram */

export type TelegramStatus = {
  connected: boolean;
  phone?: string;
  monitored_chats?: unknown[];
  last_error?: string;
};

export type TelegramStep = { step: "code" | "password" | "ready" };

export const telegramStatus = async () => unwrap<TelegramStatus>((await telegramStatusFn()) as ProxyResult);

export const telegramStart = async (phone: string) =>
  unwrap<TelegramStep>((await telegramStartFn({ data: { phone } })) as ProxyResult);

export const telegramVerify = async (code: string) =>
  unwrap<TelegramStep>((await telegramVerifyFn({ data: { code } })) as ProxyResult);

export const telegramTwoFa = async (password: string) =>
  unwrap<TelegramStep>((await telegramTwoFaFn({ data: { password } })) as ProxyResult);

export const telegramDisconnect = async () =>
  unwrap<{ connected: boolean }>((await telegramDisconnectFn()) as ProxyResult);

/* ------------------------------------------------------------- whatsapp */

export type WhatsAppStatus = { connected: boolean; phone_number_id?: string; alert_recipient?: string };

export const whatsappStatus = async () => unwrap<WhatsAppStatus>((await whatsappStatusFn()) as ProxyResult);

export const whatsappSaveCredentials = async (input: {
  access_token: string;
  phone_number_id: string;
  business_account_id: string;
  alert_recipient: string;
}) => unwrap<{ connected: boolean }>((await whatsappSaveCredentialsFn({ data: input })) as ProxyResult);

export const whatsappDisconnect = async () =>
  unwrap<{ connected: boolean }>((await whatsappDisconnectFn()) as ProxyResult);

export const whatsappSendTest = async (message?: string) =>
  unwrap<{ result: string }>(
    (await whatsappSendTestFn({ data: { message: message ?? "This is a test alert." } })) as ProxyResult,
  );
/* ------------------------------------------------- agent services */

export type TelegramChat = {
  id: string | number;
  name: string;
  is_group?: boolean;
  is_channel?: boolean;
  unread_count?: number;
};

export type SignalMonitorConfig = {
  monitored_chats: string[];
  min_confidence: number;
  alert_chat: string;
};

export type SignalMonitorStatus = {
  status: "active" | "paused" | string;
  config: SignalMonitorConfig;
  paused_reason?: string;
};

export type Signal = {
  id: string;
  channel: string;
  raw_text: string;
  confidence_score: number;
  model_reasoning?: string;
  alerted: boolean;
  alert_error?: string | null;
  created_at: string;
};

export const telegramChats = async () =>
  unwrap<{ chats: TelegramChat[] }>((await telegramChatsFn()) as ProxyResult);

export const signalMonitorStatus = async () =>
  unwrap<SignalMonitorStatus>((await signalMonitorStatusFn()) as ProxyResult);

export const signalMonitorSave = async (config: SignalMonitorConfig) =>
  unwrap<Record<string, unknown>>((await signalMonitorSaveFn({ data: config })) as ProxyResult);

export const signalMonitorActivate = async () =>
  unwrap<Record<string, unknown>>((await signalMonitorActivateFn()) as ProxyResult);

export const signalMonitorPause = async () =>
  unwrap<Record<string, unknown>>((await signalMonitorPauseFn()) as ProxyResult);

export const signalMonitorSignals = async () =>
  unwrap<{ signals: Signal[] }>((await signalMonitorSignalsFn()) as ProxyResult);

/* ------------------------------------------------- trading agent */

export type TradingAgentConfig = {
  pair: string | null;
  timeframe: string | null;
  forecast_model: string;
};

export type TradingAgentStatus = {
  status: "active" | "paused" | string;
  config: TradingAgentConfig;
  paused_reason?: string;
};

export type TradingSignal = {
  id: string;
  pair: string;
  timeframe: string;
  forecast_model?: string;
  direction: "long" | "short" | "neutral" | string;
  confidence: number | null;
  created_at: string;
};

export const tradingAgentStatus = async () =>
  unwrap<TradingAgentStatus>((await tradingAgentStatusFn()) as ProxyResult);

export const tradingAgentSave = async (config: TradingAgentConfig) =>
  unwrap<Record<string, unknown>>((await tradingAgentSaveFn({ data: config })) as ProxyResult);

export const tradingAgentActivate = async () =>
  unwrap<Record<string, unknown>>((await tradingAgentActivateFn()) as ProxyResult);

export const tradingAgentPause = async () =>
  unwrap<Record<string, unknown>>((await tradingAgentPauseFn()) as ProxyResult);

export const tradingAgentGenerate = async (config: TradingAgentConfig) =>
  unwrap<{ job_id: string; status: string }>((await tradingAgentGenerateFn({ data: config })) as ProxyResult);

export const tradingAgentSignals = async () =>
  unwrap<{ signals: TradingSignal[] }>((await tradingAgentSignalsFn()) as ProxyResult);
