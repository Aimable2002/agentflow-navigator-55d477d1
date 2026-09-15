import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { InlineTaskCard, TierBadge } from "@/components/pink/primitives";
import { useConnectors, useConversation, useJobWatcher, useSendMessage, useTasks } from "@/lib/queries";
import { isApiConfigured } from "@/lib/api";
import { shortId, taskDuration } from "@/lib/format";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/chat")({
  head: () => ({
    meta: [
      { title: "Agent chat | PINK workspace" },
      {
        name: "description",
        content: "Talk to the PINK agent, watch it call your connected tools and follow background tasks inline.",
      },
      { property: "og:title", content: "PINK agent chat" },
      { property: "og:description", content: "One surface for conversation, tool actions and background execution." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { conversation?: string } => {
    const value = search["conversation"];
    return typeof value === "string" && value ? { conversation: value } : {};
  },
  component: Chat,
});

const suggestions = [
  "Backtest my mean-reversion EA on EURUSD M15 and file the results in Linear",
  "Why is CI red on release/1.8? Fix it and open a PR",
  "Reconcile last month in Xero and list what needs a decision",
  "Summarise the HubSpot pipeline and flag stalled deals",
];

type TaskMeta = { title: string; status: string; progress: number; meta: string } | undefined;

function Bubble({ m, taskMeta }: { m: Message; taskMeta: TaskMeta }) {
  if (m.role === "user") {
    return (
      <div className="flex gap-3">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-panel font-mono text-[11px] text-fog">
          YOU
        </span>
        <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-white/90">{m.content}</p>
      </div>
    );
  }

  if (m.role === "system") {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
        {m.content}
      </div>
    );
  }

  return (
    <div className="stream-in flex gap-3">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-pink font-mono text-[11px] font-semibold text-ink">
        P
      </span>
      <div className="min-w-0 max-w-2xl space-y-3">
        {m.tier && (
          <div className="flex items-center gap-2">
            <TierBadge tier={m.tier} />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">routed automatically</span>
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">{m.content}</p>
        {m.steps?.length > 0 && (
          <div className="space-y-2">
            {m.steps.map((s, i) => (
              <div key={`${s.connector}${s.action}${i}`} className="flex items-center gap-2 font-mono text-xs text-fog">
                <span className="size-1.5 rounded-full bg-mint" /> {s.connector} · {s.action}{" "}
                <span className="text-mute">{s.detail}</span>
              </div>
            ))}
          </div>
        )}
        {m.task_id && taskMeta && (
          <InlineTaskCard
            taskId={m.task_id}
            title={taskMeta.title}
            tier={m.tier ?? "medium"}
            status={taskMeta.status as never}
            progress={taskMeta.progress}
            meta={taskMeta.meta}
          />
        )}
      </div>
    </div>
  );
}

function Chat() {
  const { conversation: conversationId } = Route.useSearch();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  const { data } = useConversation(conversationId ?? "");
  const { data: tasks = [] } = useTasks();
  const { data: connectors = [] } = useConnectors();
  const sendMessage = useSendMessage();
  const { watch, pending } = useJobWatcher();

  const messages = data?.messages ?? [];
  const connected = connectors.filter((c) => c.connected);
  const running = tasks.filter((t) => t.status === "running" || t.status === "queued");

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sendMessage.isPending]);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || sendMessage.isPending) return;
    setDraft("");
    try {
      const result = await sendMessage.mutateAsync({
        prompt,
        conversationId: conversationId ?? null,
        connectors: connected.map((c) => c.id),
      });
      if (!conversationId) {
        void navigate({ to: "/app/chat", search: { conversation: result.conversationId }, replace: true });
      }
      watch({ jobId: result.task.job_id!, taskId: result.task.id, conversationId: result.conversationId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reach the agent.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:h-screen">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-4 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-semibold">
            {data?.conversation?.title ?? "New conversation"}
          </h1>
          <p className="font-mono text-[11px] text-mute">
            {conversationId ? `${shortId(conversationId, "CNV")} · ` : ""}
            {connected.length ? `connectors in scope: ${connected.map((c) => c.name).join(", ")}` : "no tools connected yet"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/app/conversations"
            className="rounded-md border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fog hover:text-white"
          >
            History
          </Link>
          <Link
            to="/app/tasks"
            className="rounded-md border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-violet hover:text-white"
          >
            {running.length} running
          </Link>
        </div>
      </div>

      {!isApiConfigured && (
        <div className="border-b border-amber/30 bg-amber/10 px-4 py-2.5 text-xs text-white/90 lg:px-8">
          The agent service address isn't configured yet, so new messages can't be sent.
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="rounded-lg border border-line bg-panel p-6">
              <h2 className="font-display text-lg font-semibold">Describe an outcome, not a prompt.</h2>
              <p className="mt-2 text-sm text-fog">
                The agent grades the request, picks a model tier and calls the tools you've connected. Long jobs move to
                background tasks and report back here.
              </p>
            </div>
          )}
          {messages.map((m) => {
            const task = m.task_id ? tasks.find((t) => t.id === m.task_id) : undefined;
            return (
              <Bubble
                key={m.id}
                m={m}
                taskMeta={
                  task
                    ? {
                        title: task.title,
                        status: task.status,
                        progress: task.progress,
                        meta: `${shortId(task.id)} · ${taskDuration(task)}`,
                      }
                    : undefined
                }
              />
            );
          })}
          {(sendMessage.isPending || pending > 0) && (
            <div className="flex items-center gap-2 font-mono text-xs text-mute">
              <Loader2 className="size-3.5 animate-spin" /> the agent is working…
            </div>
          )}
          <div ref={bottom} />
        </div>
      </div>

      <div className="border-t border-line px-4 py-4 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 pb-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-fog transition-colors hover:border-pink/40 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
            className="rounded-lg border border-line bg-ink2 p-3"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
              rows={2}
              placeholder="Describe the outcome you want. The agent picks the tier and the tools."
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-mute focus:outline-none"
            />
            <div className="flex items-center gap-2 pt-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">Tier: auto</span>
              <div className="flex flex-wrap gap-1">
                {connected.map((c) => (
                  <span key={c.id} className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-fog">
                    {c.name}
                  </span>
                ))}
                {connected.length === 0 && (
                  <Link to="/app/connectors" className="font-mono text-[10px] text-pink hover:underline">
                    connect a tool →
                  </Link>
                )}
              </div>
              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim() || sendMessage.isPending}
                className={cn(
                  "ml-auto grid size-8 place-items-center rounded-md bg-pink text-ink transition-colors hover:bg-white",
                  (!draft.trim() || sendMessage.isPending) && "opacity-50",
                )}
              >
                {sendMessage.isPending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
              </button>
            </div>
          </form>
          <p className="mt-2 font-mono text-[10px] text-mute">
            Long jobs move to background tasks automatically and keep a card in this conversation.
          </p>
        </div>
      </div>
    </div>
  );
}
