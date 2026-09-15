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
import { getJobFn, healthFn, PINK_API_URL, startChatFn } from "@/lib/pink.functions";

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

export type StartChatResponse = {
  job_id: string;
  status: string;
  plan?: string | ChatPlan;
};

export type AgentStep = { connector: string; action: string; detail?: string };

export type JobStatusResponse = {
  status: "pending" | "done" | "failed" | string;
  data?: {
    content?: string;
    output?: string;
    tier?: "small" | "medium" | "best";
    steps?: AgentStep[];
  };
  error?: string;
};

export type ApiHistoryMessage = { role: "user" | "assistant" | "system"; content: string };

/** POST /v1/chat — queues an agent run. */
export async function startChat(input: {
  prompt: string;
  messages?: ApiHistoryMessage[];
  connectors?: string[];
}) {
  const result = await startChatFn({
    data: {
      prompt: input.prompt,
      messages: input.messages ?? [],
      connectors: input.connectors ?? [],
    },
  });
  return unwrap<StartChatResponse>(result as ProxyResult);
}

/** GET /v1/chat/{job_id} — polls a queued run. */
export async function getJob(jobId: string) {
  const result = await getJobFn({ data: { jobId } });
  return unwrap<JobStatusResponse>(result as ProxyResult);
}

/** GET /healthz */
export async function apiHealth() {
  const result = await healthFn();
  return unwrap<{ status: string }>(result as ProxyResult);
}
