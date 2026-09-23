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
  healthFn,
  PINK_API_URL,
  signalMonitorActivateFn,
  signalMonitorPauseFn,
  signalMonitorSaveFn,
  signalMonitorSignalsFn,
  signalMonitorStatusFn,
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
import { cleanAgentText } from "@/lib/format";

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
  const rawMessage = [
    payload["final_message"],
    payload["message"],
    payload["content"],
    body["final_message"],
    body["message"],
    body["content"],
  ].find((value): value is string => typeof value === "string" && value.length > 0);
  const message = rawMessage ? cleanAgentText(rawMessage) : undefined;
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
  phone?: string | null;
  monitored_chats?: string[] | null;
  last_error?: string | null;
};

export type TelegramStep = { step: "code" | "password" | "ready" };

export const telegramStatus = async () =>
  unwrap<TelegramStatus>((await telegramStatusFn()) as ProxyResult);

export const telegramStart = async (phone: string) =>
  unwrap<TelegramStep>((await telegramStartFn({ data: { phone } })) as ProxyResult);

export const telegramVerify = async (code: string) =>
  unwrap<TelegramStep>((await telegramVerifyFn({ data: { code } })) as ProxyResult);

export const telegramTwoFa = async (password: string) =>
  unwrap<TelegramStep>((await telegramTwoFaFn({ data: { password } })) as ProxyResult);

export const telegramDisconnect = async () =>
  unwrap<{ connected: boolean }>((await telegramDisconnectFn()) as ProxyResult);

/* ------------------------------------------------------------- whatsapp */

export type WhatsAppStatus = {
  connected: boolean;
  phone_number_id?: string;
  alert_recipient?: string;
};

export const whatsappStatus = async () =>
  unwrap<WhatsAppStatus>((await whatsappStatusFn()) as ProxyResult);

export const whatsappSaveCredentials = async (input: {
  access_token: string;
  phone_number_id: string;
  business_account_id: string;
  alert_recipient: string;
}) =>
  unwrap<{ connected: boolean }>((await whatsappSaveCredentialsFn({ data: input })) as ProxyResult);

export const whatsappDisconnect = async () =>
  unwrap<{ connected: boolean }>((await whatsappDisconnectFn()) as ProxyResult);

export const whatsappSendTest = async (message?: string) =>
  unwrap<{ result: string }>(
    (await whatsappSendTestFn({
      data: { message: message ?? "This is a test alert." },
    })) as ProxyResult,
  );

/* ------------------------------------------------- agent services */

export type TelegramChat = {
  id: string | number;
  name: string;
  is_group?: boolean;
  is_channel?: boolean;
  unread_count?: number;
};

export type TelegramSignalType = "forex" | "binary_option";
export type TelegramDirection = "buy" | "sell" | "call" | "put";
export type TelegramParseStatus = "pending" | "parsed" | "rejected";

export type TelegramSignal = {
  id: string;
  created_at: string;
  source: "telegram";
  channel: string | null;
  raw_text: string;
  signal_type: TelegramSignalType | null;
  symbol: string | null;
  direction: TelegramDirection | null;
  entry: number | null;
  take_profits: number[];
  stop_loss: number | null;
  expiry_minutes: number | null;
  normalized_signal: {
    is_signal?: boolean;
    signal_type?: TelegramSignalType;
    symbol?: string;
    direction?: TelegramDirection;
    entry?: number | null;
    take_profits?: number[];
    stop_loss?: number | null;
    expiry_minutes?: number | null;
    reasoning?: string;
    parse_status?: TelegramParseStatus;
  };
  parse_status: TelegramParseStatus;
  model_reasoning: string | null;
  alerted?: boolean;
  alert_error?: string | null;
};

function normalizeTelegramSignal(value: unknown, index: number): TelegramSignal {
  const row = (value && typeof value === "object" && !Array.isArray(value) ? value : {}) as Record<
    string,
    unknown
  >;
  const nested =
    row["normalized_signal"] &&
    typeof row["normalized_signal"] === "object" &&
    !Array.isArray(row["normalized_signal"])
      ? (row["normalized_signal"] as Record<string, unknown>)
      : {};
  const takeProfits = Array.isArray(row["take_profits"])
    ? row["take_profits"]
    : Array.isArray(nested["take_profits"])
      ? nested["take_profits"]
      : [];

  return {
    id: typeof row["id"] === "string" ? row["id"] : `signal-${index}`,
    created_at: typeof row["created_at"] === "string" ? row["created_at"] : "",
    source: "telegram",
    channel: typeof row["channel"] === "string" ? row["channel"] : null,
    raw_text: typeof row["raw_text"] === "string" ? row["raw_text"] : "",
    signal_type: (row["signal_type"] ?? nested["signal_type"] ?? null) as TelegramSignalType | null,
    symbol: (row["symbol"] ?? nested["symbol"] ?? null) as string | null,
    direction: (row["direction"] ?? nested["direction"] ?? null) as TelegramDirection | null,
    entry: (row["entry"] ?? nested["entry"] ?? null) as number | null,
    take_profits: takeProfits as number[],
    stop_loss: (row["stop_loss"] ?? nested["stop_loss"] ?? null) as number | null,
    expiry_minutes: (row["expiry_minutes"] ?? nested["expiry_minutes"] ?? null) as number | null,
    normalized_signal: nested,
    parse_status: (row["parse_status"] ??
      nested["parse_status"] ??
      "pending") as TelegramParseStatus,
    model_reasoning: (row["model_reasoning"] ?? nested["reasoning"] ?? null) as string | null,
    alerted: row["alerted"] === true,
    alert_error: (row["alert_error"] ?? null) as string | null,
  };
}

export type SignalMonitorConfig = {
  monitored_chats: string[];
  alert_chat: string;
};

export type SignalMonitorStatus = {
  status: "active" | "paused" | string;
  config: SignalMonitorConfig;
  paused_reason?: string;
};

export type Signal = TelegramSignal;

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
  (async () => {
    const body = unwrap<{ signals?: unknown }>((await signalMonitorSignalsFn()) as ProxyResult);
    const rows = Array.isArray(body.signals) ? body.signals : [];
    return { signals: rows.map(normalizeTelegramSignal) };
  })();

export type TradingConnector = "mt5" | "ctrader";

export type TradingAgentConfig = {
  pair: string | null;
  timeframe: string | null;
  connector: TradingConnector;
  candle_tool: string;
  forecast_models: string[];
};

export type TradingSignalModelForecast = {
  model: string;
  direction: "long" | "short" | "neutral";
  confidence: number;
  entry: number | null;
  take_profits: number[];
  stop_loss: number | null;
  raw: Record<string, unknown>;
};

export type TradingSignal = {
  id: string;
  created_at: string;
  pair: string;
  timeframe: string;
  forecast_model: string;
  direction: "long" | "short" | "neutral";
  confidence: number;
  raw_forecast: Record<string, unknown>;
  signal: {
    symbol: string;
    signal_type: "forex";
    direction: "long" | "short" | "neutral";
    entry: number | null;
    take_profits: number[];
    stop_loss: number | null;
    timeframe: string;
    confidence: number;
    consensus: number;
  };
  model_forecasts: TradingSignalModelForecast[];
  outcome_status: "pending" | "won" | "lost" | "neutral" | "expired";
  outcome_direction: string | null;
  outcome_price: number | null;
  outcome_at: string | null;
};

export type TradingAgentStatus = {
  status: "active" | "paused" | string;
  config: TradingAgentConfig;
  paused_reason?: string;
};

export const tradingAgentStatus = async () =>
  unwrap<TradingAgentStatus>((await tradingAgentStatusFn()) as ProxyResult);

export const tradingAgentSave = async (config: TradingAgentConfig) =>
  unwrap<Record<string, unknown>>((await tradingAgentSaveFn({ data: config })) as ProxyResult);

export const tradingAgentActivate = async () =>
  unwrap<Record<string, unknown>>((await tradingAgentActivateFn()) as ProxyResult);

export const tradingAgentPause = async () =>
  unwrap<Record<string, unknown>>((await tradingAgentPauseFn()) as ProxyResult);

export const tradingAgentGenerate = async () =>
  unwrap<{ job_id: string; status: string }>((await tradingAgentGenerateFn()) as ProxyResult);

export const tradingAgentSignals = async () =>
  unwrap<{ signals: TradingSignal[] }>((await tradingAgentSignalsFn()) as ProxyResult);

/* ------------------------------------------------- mt5 ea execution */

import { eaClaimOrderFn, eaExecutionFn, eaOrdersFn } from "@/lib/pink.functions";
import type { TradeExecution, TradeOrder } from "@/lib/types";

/** GET /v1/ea/orders — orders still waiting for an EA to claim them. */
export const eaPendingOrders = async (limit = 50, clientId?: string) =>
  unwrap<{ orders: TradeOrder[] }>(
    (await eaOrdersFn({ data: { limit, ...(clientId ? { clientId } : {}) } })) as ProxyResult,
  );

export type ExecutionReceiptInput = Omit<
  TradeExecution,
  "id" | "order_id" | "user_id" | "executed_at" | "created_at"
>;

/** POST /v1/ea/orders/{order_id}/claim — reserve an order for one installation. */
export const eaClaimOrder = async (orderId: string, clientId: string) =>
  unwrap<{ order: TradeOrder }>(
    (await eaClaimOrderFn({ data: { orderId, clientId } })) as ProxyResult,
  );

/** POST /v1/ea/orders/{order_id}/execution — store the EA broker receipt. */
export const eaReportExecution = async (orderId: string, receipt: ExecutionReceiptInput) =>
  unwrap<{ execution: TradeExecution }>(
    (await eaExecutionFn({
      data: {
        orderId,
        receipt: receipt as unknown as Record<string, import("@/lib/pink.functions").Json>,
      },
    })) as ProxyResult,
  );
