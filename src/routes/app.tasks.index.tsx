import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { ConnectorChip, Meter, Panel, StatusPill, TierBadge } from "@/components/pink/primitives";
import { tasks } from "@/lib/mock";

export const Route = createFileRoute("/app/tasks/")({
  head: () => ({
    meta: [
      { title: "Background tasks | PINK workspace" },
      {
        name: "description",
        content: "Everything the agent is running or has run in the background, with status, tier and duration.",
      },
      { property: "og:title", content: "PINK background tasks" },
      { property: "og:description", content: "Queued, running, completed and failed agent work in one view." },
    ],
  }),
  component: Tasks,
});

const counts = ["running", "queued", "completed", "failed"] as const;

function Tasks() {
  return (
    <>
      <PageHeader
        title="Tasks"
        copy="Long-running agent work executes server-side. Every task keeps its logs, the tier that handled it and the conversation that started it."
        actions={
          <Link
            to="/app/chat"
            className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
          >
            Start something new
          </Link>
        }
      />

      <div className="space-y-6 p-4 lg:p-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {counts.map((s) => (
            <Panel key={s}>
              <StatusPill status={s} />
              <p className="mt-2 font-display text-3xl font-semibold">{tasks.filter((t) => t.status === s).length}</p>
            </Panel>
          ))}
        </section>

        <div className="overflow-hidden rounded-lg border border-line">
          <ul className="divide-y divide-line">
            {tasks.map((t) => (
              <li key={t.id}>
                <Link
                  to="/app/tasks/$taskId"
                  params={{ taskId: t.id }}
                  className="block px-5 py-4 transition-colors hover:bg-panel/60"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill status={t.status} />
                    <h2 className="font-display text-base font-semibold text-white">{t.title}</h2>
                    <ConnectorChip id={t.connector} />
                    <TierBadge tier={t.tier} className="ml-auto" />
                    <span className="font-mono text-[11px] text-mute">{t.duration}</span>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm text-fog">{t.summary}</p>
                  {(t.status === "running" || t.status === "failed") && (
                    <div className="mt-3 max-w-md">
                      <Meter value={t.progress} tone={t.status === "running" ? "violet" : "pink"} />
                    </div>
                  )}
                  <p className="mt-2 font-mono text-[10px] text-mute">
                    {t.id} · from {t.conversationId} · started {t.started}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
