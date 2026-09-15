/**
 * Client for the PINK agent backend (FastAPI). The backend queues an agent run
 * and returns a job id; the frontend persists conversations, messages and tasks
 * in Supabase and polls the job until it resolves.
 */
import { supabase } from "@/integrations/supabase/client";

export const PINK_API_URL = ((import.meta.env["VITE_PINK_API_URL"] as string | undefined) ?? "").replace(/\/$/, "");

export const isApiConfigured = PINK_API_URL.length > 0;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isApiConfigured) {
    throw new ApiError(0, "The agent backend is not connected yet.");
  }
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  let response: Response;
  try {
    response = await fetch(`${PINK_API_URL}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, "The agent backend could not be reached from the browser.");
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
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
export function startChat(input: { prompt: string; messages?: ApiHistoryMessage[]; connectors?: string[] }) {
  return request<StartChatResponse>("/v1/chat", {
    method: "POST",
    body: JSON.stringify({
      prompt: input.prompt,
      messages: input.messages ?? [],
      connectors: input.connectors ?? [],
    }),
  });
}

/** GET /v1/chat/{job_id} — polls a queued run. */
export function getJob(jobId: string) {
  return request<JobStatusResponse>(`/v1/chat/${jobId}`);
}

/** GET /healthz */
export function apiHealth() {
  return request<{ status: string }>("/healthz");
}
