import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { ConnectorChip, Meter, Panel, StatusPill, TierBadge } from "@/components/pink/primitives";
import { taskById } from "@/lib/mock";

export const Route = createFileRoute("/app/tasks/$taskId")({
  loader: ({ params }) => {
    const task = taskById(params.taskId);
    if (!task) throw notFound();
    return { task };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Task not found | PINK" }, { name: "robots", content: "noindex" }] };
    const t = loaderData.task;
    return {
      meta: [
        { title: `${t.id} · ${t.title} | PINK task` },
        { name: "description", content: t.summary },
        { property: "og:title", content: `${t.title} — PINK task` },
        { property: "og:description", content: t.summary },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold">Task not found</h1>
      <Link to="/app/tasks" className="mt-4 inline-block font-mono text-sm text-pink hover:underline">
        ← All tasks
      </Link>
    </div>
  ),
  component: TaskDetail,
});

const levelColour = {
  info: "text-fog",
  warn: "text-amber",
  error: "text-destructive",
  done: "text-mint",
} as const;

function TaskDetail() {
  const { task: t } = Route.useLoaderData();

  return (
    <div className="p-4 lg:p-8">
      <Link to="/app/tasks" className="font-mono text-xs text-mute hover:text-white">
        ← Tasks
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusPill status={t.status} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t.title}</h1>
        <TierBadge tier={t.tier} />
        <ConnectorChip id={t.connector} />
        <div className="ml-auto flex gap-2">
          {t.status === "running" && (
            <button
              type="button"
              onClick={() => toast("Cancellation requested", { description: `${t.id} will stop after the current step.` })}
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-panel"
            >
              Cancel task
            </button>
          )}
          {t.status === "failed" && (
            <button
              type="button"
              onClick={() => toast.success("Retry queued", { description: `${t.id} restarted from a clean state.` })}
              className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white"
            >
              Retry task
            </button>
          )}
          <Link
            to="/app/conversations/$conversationId"
            params={{ conversationId: t.conversationId }}
            className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-panel"
          >
            Open conversation
          </Link>
        </div>
      </div>

      <p className="mt-3 max-w-3xl text-sm text-fog">{t.summary}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {(t.status === "running" || t.status === "failed") && (
            <Panel>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-semibold">Progress</h2>
                <span className="ml-auto font-mono text-xs text-fog">{t.progress}%</span>
              </div>
              <div className="mt-3">
                <Meter value={t.progress} tone={t.status === "running" ? "violet" : "pink"} />
              </div>
              <p className="mt-2 font-mono text-[11px] text-mute">{t.duration}</p>
            </Panel>
          )}

          <Panel>
            <h2 className="font-display text-lg font-semibold">Execution log</h2>
            <div className="mt-4 space-y-1.5 overflow-x-auto rounded-md border border-line bg-ink p-4 font-mono text-xs">
              {t.logs.map((l, i) => (
                <p key={i} className={levelColour[l.level]}>
                  <span className="text-mute">{l.t}</span> {l.msg}
                </p>
              ))}
              {t.status === "running" && (
                <p className="text-violet">
                  <span className="text-mute">live</span> streaming…
                </p>
              )}
            </div>
          </Panel>

          {t.output && (
            <Panel>
              <h2 className="font-display text-lg font-semibold">Output</h2>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-line bg-ink p-4 font-mono text-xs text-fog">
                {t.output}
              </pre>
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Task facts</h2>
            <dl className="mt-4 space-y-3 font-mono text-xs">
              {[
                ["Task id", t.id],
                ["Status", t.status],
                ["Model tier", t.tier],
                ["Connector", t.connector],
                ["Started", t.started],
                ["Duration", t.duration],
                ["Conversation", t.conversationId],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-mute">{k}</dt>
                  <dd className="text-fog">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel>
            <h2 className="font-display text-lg font-semibold">Why this tier?</h2>
            <p className="mt-3 text-sm leading-relaxed text-fog">
              {t.tier === "best"
                ? "Graded as high complexity with real financial consequence, so it was escalated to the strongest model available."
                : t.tier === "medium"
                  ? "A multi-step tool workflow with predictable structure — the balanced tier handles this at a fraction of the cost."
                  : "Straightforward classification work. The small tier is fast, cheap and entirely sufficient here."}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
