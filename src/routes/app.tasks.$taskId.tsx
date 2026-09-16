import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { MarkdownContent } from "@/components/app/markdown-content";
import { ConnectorChip, Meter, Panel, StatusPill, TierBadge } from "@/components/pink/primitives";
import { useCancelTask, useTask } from "@/lib/queries";
import { clockTime, relativeTime, shortId, taskDuration } from "@/lib/format";
import type { LogLevel } from "@/lib/types";

export const Route = createFileRoute("/app/tasks/$taskId")({
  head: () => ({
    meta: [
      { title: "Task detail | PINK workspace" },
      { name: "description", content: "Live status, execution log and output for a single agent task." },
      { property: "og:title", content: "PINK task detail" },
      { property: "og:description", content: "Follow one agent task from queue to output." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TaskDetail,
});

const levelColour: Record<LogLevel, string> = {
  info: "text-fog",
  warn: "text-amber",
  error: "text-destructive",
  done: "text-mint",
};

function TaskDetail() {
  const { taskId } = Route.useParams();
  const { data, isLoading, error } = useTask(taskId);
  const cancel = useCancelTask();

  const t = data?.task ?? null;
  const logs = data?.logs ?? [];

  if (isLoading) return <div className="p-8 text-sm text-mute">Loading task…</div>;

  if (error) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-semibold">Task could not be loaded</h1>
        <p className="mt-2 text-fog">{error.message}</p>
        <Link to="/app/tasks" className="mt-4 inline-block font-mono text-sm text-pink hover:underline">
          ← All tasks
        </Link>
      </div>
    );
  }

  if (!t) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-semibold">Task not found</h1>
        <Link to="/app/tasks" className="mt-4 inline-block font-mono text-sm text-pink hover:underline">
          ← All tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <Link to="/app/tasks" className="font-mono text-xs text-mute hover:text-white">
        ← Tasks
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusPill status={t.status} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t.title}</h1>
        <TierBadge tier={t.tier} />
        <ConnectorChip id={t.connector_id} />
        <div className="ml-auto flex gap-2">
          {(t.status === "running" || t.status === "queued") && (
            <button
              type="button"
              disabled={cancel.isPending}
              onClick={() =>
                cancel.mutate(t, {
                  onSuccess: () => toast.success("Task cancelled"),
                  onError: (e) => toast.error(e instanceof Error ? e.message : "Could not cancel the task."),
                })
              }
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-panel disabled:opacity-50"
            >
              {cancel.isPending ? "Cancelling…" : "Cancel task"}
            </button>
          )}
          {t.conversation_id && (
            <Link
              to="/app/conversations/$conversationId"
              params={{ conversationId: t.conversation_id }}
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-panel"
            >
              Open conversation
            </Link>
          )}
        </div>
      </div>

      {(t.summary || t.error) && (
        <MarkdownContent
          content={t.error ?? t.summary ?? ""}
          className="mt-3 max-w-3xl text-fog"
        />
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {(t.status === "running" || t.status === "queued" || t.status === "failed") && (
            <Panel>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-semibold">Progress</h2>
                <span className="ml-auto font-mono text-xs text-fog">{t.progress}%</span>
              </div>
              <div className="mt-3">
                <Meter value={t.progress} tone={t.status === "failed" ? "pink" : "violet"} />
              </div>
              <p className="mt-2 font-mono text-[11px] text-mute">{taskDuration(t)}</p>
            </Panel>
          )}

          <Panel>
            <h2 className="font-display text-lg font-semibold">Execution log</h2>
            <div className="mt-4 space-y-1.5 overflow-x-auto rounded-md border border-line bg-ink p-4 font-mono text-xs">
              {logs.length === 0 && <p className="text-mute">No log lines recorded yet.</p>}
              {logs.map((l) => (
                <p key={l.id} className={levelColour[l.level]}>
                  <span className="text-mute">{clockTime(l.created_at)}</span> {l.message}
                </p>
              ))}
              {t.status === "running" && (
                <p className="text-violet">
                  <span className="text-mute">live</span> waiting on the agent…
                </p>
              )}
            </div>
          </Panel>

          {t.output && (
            <Panel>
              <h2 className="font-display text-lg font-semibold">Output</h2>
              <MarkdownContent content={t.output} className="mt-4" />
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Task facts</h2>
            <dl className="mt-4 space-y-3 font-mono text-xs">
              {[
                ["Task id", shortId(t.id)],
                ["Job id", t.job_id ?? "—"],
                ["Status", t.status],
                ["Model tier", t.tier],
                ["Connector", t.connector_id ?? "—"],
                ["Started", relativeTime(t.started_at ?? t.created_at)],
                ["Duration", taskDuration(t)],
                ["Conversation", t.conversation_id ? shortId(t.conversation_id, "CNV") : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-mute">{k}</dt>
                  <dd className="truncate text-fog">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel>
            <h2 className="font-display text-lg font-semibold">Why this tier?</h2>
            <p className="mt-3 text-sm leading-relaxed text-fog">
              {t.tier === "best"
                ? "Graded as high complexity with real consequence, so it was escalated to the strongest model available."
                : t.tier === "medium"
                  ? "A multi-step tool workflow with predictable structure — the balanced tier handles this at a fraction of the cost."
                  : "Straightforward work. The small tier is fast, cheap and entirely sufficient here."}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
