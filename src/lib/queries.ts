/**
 * All app data comes from Supabase (own-rows-only via RLS) and the agent
 * backend. No mock data anywhere.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getJob, startChat, type AgentStep } from "@/lib/api";
import { useSession } from "@/lib/auth";
import type {
  ApiKey,
  CatalogConnector,
  ConnectorScope,
  ConnectorView,
  Conversation,
  Invoice,
  McpConnection,
  McpTransport,
  Message,
  NotificationPreferences,
  Profile,
  Task,
  TaskLog,
  Tier,
  UsageEvent,
} from "@/lib/types";

function assertOk<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? null) as T;
}

/* ----------------------------------------------------------------- profile */

export function useProfile() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () =>
      assertOk(await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle()) as Profile | null,
  });
}

export function useUpdateProfile() {
  const { user } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const res = await supabase.from("profiles").update(patch).eq("user_id", user!.id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

/* -------------------------------------------------------------- connectors */

export function useConnectorCatalog() {
  return useQuery({
    queryKey: ["connector-catalog"],
    queryFn: async () =>
      (assertOk(
        await supabase.from("connector_catalog").select("*").eq("is_active", true).order("sort_order"),
      ) ?? []) as CatalogConnector[],
  });
}

/** Catalogue merged with the signed-in user's connections. */
export function useConnectors() {
  const { user } = useSession();
  const catalog = useConnectorCatalog();

  const connections = useQuery({
    queryKey: ["mcp-connections", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (assertOk(await supabase.from("mcp_connections").select("*").eq("user_id", user!.id)) ??
        []) as McpConnection[],
  });

  const data = useMemo<ConnectorView[]>(() => {
    const rows = catalog.data ?? [];
    const byId = new Map((connections.data ?? []).map((c) => [c.connector_id, c]));
    return rows.map((c) => {
      const connection = byId.get(c.id) ?? null;
      const connected = !!connection && connection.status !== "disconnected";
      return {
        ...c,
        connection,
        connected,
        status: connection?.status ?? "disconnected",
        transport: connection?.transport ?? c.default_transport,
        scopes: (connection?.scopes?.length ? connection.scopes : c.scopes) as ConnectorScope[],
      };
    });
  }, [catalog.data, connections.data]);

  return {
    data,
    isLoading: catalog.isLoading || connections.isLoading,
    error: catalog.error ?? connections.error,
  };
}

export function useConnector(connectorId: string) {
  const { data, isLoading, error } = useConnectors();
  return { data: data.find((c) => c.id === connectorId) ?? null, isLoading, error };
}

export type ConnectionInput = {
  connector_id: string;
  transport: McpTransport;
  server_url?: string | null;
  auth_header_name?: string | null;
  auth_token?: string | null;
  command?: string | null;
  args?: string[];
  account_label?: string | null;
  scopes?: ConnectorScope[];
  status?: McpConnection["status"];
};

export function useSaveConnection() {
  const { user } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ConnectionInput) => {
      const row = {
        user_id: user!.id,
        connector_id: input.connector_id,
        transport: input.transport,
        server_url: input.server_url ?? null,
        auth_header_name: input.auth_header_name ?? "Authorization",
        command: input.command ?? null,
        args: input.args ?? [],
        account_label: input.account_label ?? null,
        scopes: input.scopes ?? [],
        status: input.status ?? "connected",
        last_sync_at: new Date().toISOString(),
        ...(input.auth_token ? { auth_token: input.auth_token } : {}),
      };
      const res = await supabase.from("mcp_connections").upsert(row, { onConflict: "user_id,connector_id" });
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["mcp-connections"] }),
  });
}

export function useDisconnectConnector() {
  const { user } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connectorId: string) => {
      const res = await supabase
        .from("mcp_connections")
        .delete()
        .eq("user_id", user!.id)
        .eq("connector_id", connectorId);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["mcp-connections"] }),
  });
}

/* ----------------------------------------------------------- conversations */

export function useConversations() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (assertOk(
        await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", user!.id)
          .order("updated_at", { ascending: false }),
      ) ?? []) as Conversation[],
  });
}

export function useConversation(conversationId: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["conversation", conversationId, user?.id],
    enabled: !!user && !!conversationId,
    queryFn: async () => {
      const conversation = assertOk(
        await supabase.from("conversations").select("*").eq("id", conversationId).maybeSingle(),
      ) as Conversation | null;
      const messages = (assertOk(
        await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true }),
      ) ?? []) as Message[];
      return { conversation, messages };
    },
  });
}

/* ------------------------------------------------------------------- tasks */

export function useTasks() {
  const { user } = useSession();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["tasks", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (assertOk(
        await supabase.from("tasks").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      ) ?? []) as Task[],
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`tasks-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        void qc.invalidateQueries({ queryKey: ["tasks"] });
      })
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [user, qc]);

  return query;
}

export function useTask(taskId: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["task", taskId, user?.id],
    enabled: !!user && !!taskId,
    refetchInterval: 5000,
    queryFn: async () => {
      const task = assertOk(await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle()) as Task | null;
      const logs = (assertOk(
        await supabase.from("task_logs").select("*").eq("task_id", taskId).order("created_at", { ascending: true }),
      ) ?? []) as TaskLog[];
      return { task, logs };
    },
  });
}

export function useCancelTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await supabase
        .from("tasks")
        .update({ status: "cancelled", finished_at: new Date().toISOString() })
        .eq("id", taskId);
      if (res.error) throw new Error(res.error.message);
      await supabase.from("task_logs").insert({ task_id: taskId, level: "warn", message: "Cancelled by user." });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["task"] });
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/* -------------------------------------------------------- agent chat turns */

async function logTask(taskId: string, level: TaskLog["level"], message: string) {
  await supabase.from("task_logs").insert({ task_id: taskId, level, message });
}

/**
 * One agent turn: persist the user message, queue the run on the backend,
 * track it as a task, then persist the agent reply when the job resolves.
 */
export function useSendMessage() {
  const { user } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { prompt: string; conversationId?: string | null; connectors: string[] }) => {
      if (!user) throw new Error("You need to be signed in.");
      let conversationId = input.conversationId ?? null;

      if (!conversationId) {
        const created = assertOk(
          await supabase
            .from("conversations")
            .insert({
              user_id: user.id,
              title: input.prompt.slice(0, 70),
              preview: input.prompt.slice(0, 160),
              connectors_used: input.connectors,
            })
            .select("id")
            .single(),
        ) as { id: string };
        conversationId = created.id;
      }

      const history = (assertOk(
        await supabase
          .from("messages")
          .select("role, content")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true }),
      ) ?? []) as { role: string; content: string }[];

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "user",
        content: input.prompt,
      });

      const queued = await startChat({
        prompt: input.prompt,
        messages: history.map((m) => ({
          role: m.role === "agent" ? ("assistant" as const) : (m.role as "user" | "system"),
          content: m.content,
        })),
        connectors: input.connectors,
      });

      const task = assertOk(
        await supabase
          .from("tasks")
          .insert({
            user_id: user.id,
            conversation_id: conversationId,
            job_id: queued.job_id,
            title: input.prompt.slice(0, 70),
            connector_id: input.connectors[0] ?? null,
            tier: typeof queued.plan === "object" && queued.plan?.tier ? queued.plan.tier : "medium",
            status: "running",
            progress: 10,
            started_at: new Date().toISOString(),
          })
          .select("*")
          .single(),
      ) as Task;

      await logTask(task.id, "info", `Queued on the agent backend as job ${queued.job_id}.`);
      return { conversationId, task };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["conversations"] });
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/** Polls a queued job and writes the result back into the conversation + task. */
export function useJobWatcher() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [watching, setWatching] = useState<{ jobId: string; taskId: string; conversationId: string }[]>([]);

  const watch = useCallback((entry: { jobId: string; taskId: string; conversationId: string }) => {
    setWatching((w) => (w.some((x) => x.jobId === entry.jobId) ? w : [...w, entry]));
  }, []);

  useEffect(() => {
    if (!watching.length || !user) return;
    let cancelled = false;

    const tick = async () => {
      for (const entry of watching) {
        try {
          const job = await getJob(entry.jobId);
          if (job.status === "pending" || cancelled) continue;

          if (job.status === "done") {
            const content = job.data?.content ?? job.data?.output ?? "The agent finished but returned no text.";
            const steps: AgentStep[] = job.data?.steps ?? [];
            const tier: Tier = job.data?.tier ?? "medium";
            await supabase.from("messages").insert({
              conversation_id: entry.conversationId,
              user_id: user.id,
              role: "agent",
              content,
              tier,
              steps,
              task_id: entry.taskId,
            });
            await supabase
              .from("tasks")
              .update({
                status: "completed",
                progress: 100,
                output: content,
                summary: content.slice(0, 200),
                finished_at: new Date().toISOString(),
              })
              .eq("id", entry.taskId);
            await logTask(entry.taskId, "done", "Agent run completed.");
          } else {
            const message = job.error ?? "The agent run failed.";
            await supabase.from("messages").insert({
              conversation_id: entry.conversationId,
              user_id: user.id,
              role: "system",
              content: message,
              task_id: entry.taskId,
            });
            await supabase
              .from("tasks")
              .update({ status: "failed", error: message, finished_at: new Date().toISOString() })
              .eq("id", entry.taskId);
            await logTask(entry.taskId, "error", message);
          }

          setWatching((w) => w.filter((x) => x.jobId !== entry.jobId));
          void qc.invalidateQueries({ queryKey: ["conversation"] });
          void qc.invalidateQueries({ queryKey: ["tasks"] });
          void qc.invalidateQueries({ queryKey: ["task"] });
        } catch {
          /* backend unreachable — keep the task running and retry on the next tick */
        }
      }
    };

    const id = setInterval(() => void tick(), 3000);
    void tick();
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [watching, user, qc]);

  return { watch, pending: watching.length };
}

/* ------------------------------------------------------------------- usage */

export function useUsageEvents() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["usage-events", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (assertOk(
        await supabase
          .from("usage_events")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(2000),
      ) ?? []) as UsageEvent[],
  });
}

/* --------------------------------------------------------------- api keys */

export function useApiKeys() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["api-keys", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (assertOk(
        await supabase
          .from("api_keys")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
      ) ?? []) as ApiKey[],
  });
}

function randomKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function useCreateApiKey() {
  const { user } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { label: string; scope: string }) => {
      const secret = `pink_sk_${randomKey()}`;
      const res = await supabase.from("api_keys").insert({
        user_id: user!.id,
        label: input.label,
        scope: input.scope,
        prefix: secret.slice(0, 16),
        key_hash: await sha256(secret),
      });
      if (res.error) throw new Error(res.error.message);
      return secret;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

/* --------------------------------------------------------------- invoices */

export function useInvoices() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["invoices", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (assertOk(
        await supabase.from("invoices").select("*").eq("user_id", user!.id).order("issued_at", { ascending: false }),
      ) ?? []) as Invoice[],
  });
}

/* ---------------------------------------------------- notification prefs */

export function useNotificationPreferences() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["notification-prefs", user?.id],
    enabled: !!user,
    queryFn: async () =>
      assertOk(
        await supabase.from("notification_preferences").select("*").eq("user_id", user!.id).maybeSingle(),
      ) as NotificationPreferences | null,
  });
}

export function useUpdateNotificationPreferences() {
  const { user } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<NotificationPreferences>) => {
      const res = await supabase
        .from("notification_preferences")
        .upsert({ user_id: user!.id, ...patch }, { onConflict: "user_id" });
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notification-prefs"] }),
  });
}
