import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { InlineTaskCard, Meter, Panel, StatusPill, TierBadge } from "@/components/pink/primitives";
import { useConnectors, useConversations, useProfile, useTasks, useUsageEvents } from "@/lib/queries";
import { tierMeta } from "@/lib/content";
import { planLabel, relativeTime, shortId, taskDuration, money } from "@/lib/format";
import { useSession } from "@/lib/auth";
import type { Tier } from "@/lib/types";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Overview | PINK workspace" },
      { name: "description", content: "Your agent activity, connected tools, running tasks and usage at a glance." },
      { property: "og:title", content: "PINK workspace overview" },
      { property: "og:description", content: "Account activity, connectors, recent agent work and usage." },
    ],
  }),
  component: Overview,
});

const tiers: Tier[] = ["small", "medium", "best"];

function Overview() {
  const { user } = useSession();
  const { data: profile } = useProfile();
  const { data: tasks = [] } = useTasks();
  const { data: conversations = [] } = useConversations();
  const { data: connectors = [] } = useConnectors();
  const { data: events = [] } = useUsageEvents();

  const running = tasks.filter((t) => t.status === "running");
  const connected = connectors.filter((c) => c.connected);
  const used = profile?.quota_used ?? 0;
  const limit = profile?.quota_limit ?? 500;
  const pct = Math.round((used / Math.max(1, limit)) * 100);
  const concurrentLimit = profile?.concurrent_limit ?? 5;
  const spend = events.reduce((sum, e) => sum + Number(e.cost_usd ?? 0), 0);
  const totalRequests = events.reduce((sum, e) => sum + (e.requests ?? 0), 0);

  const byTier = tiers.map((tier) => {
    const rows = events.filter((e) => e.tier === tier);
    const requests = rows.reduce((s, e) => s + (e.requests ?? 0), 0);
    return {
      tier,
      requests,
      cost: money(rows.reduce((s, e) => s + Number(e.cost_usd ?? 0), 0)),
      share: totalRequests ? Math.round((requests / totalRequests) * 100) : 0,
    };
  });

  const name = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`Welcome back, ${name}`}
        copy={
          running.length
            ? `${running.length} task${running.length > 1 ? "s" : ""} in flight. Everything else is quiet.`
            : "Nothing running. Start a conversation and the agent will pick a tier and the tools it needs."
        }
        actions={
          <>
            <Link
              to="/app/chat"
              className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
            >
              New conversation
            </Link>
            <Link
              to="/app/tasks"
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white transition-colors hover:bg-panel"
            >
              View tasks
            </Link>
          </>
        }
      />

      <div className="space-y-6 p-4 lg:p-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Requests this cycle</p>
            <p className="mt-2 font-display text-3xl font-semibold">{used}</p>
            <p className="font-mono text-xs text-fog">
              of {limit} on {planLabel(profile?.plan)}
            </p>
            <div className="mt-3">
              <Meter value={pct} tone={pct > 80 ? "pink" : "mute"} />
            </div>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Tasks running</p>
            <p className="mt-2 font-display text-3xl font-semibold text-violet">{running.length}</p>
            <p className="font-mono text-xs text-fog">
              {running.length} of {concurrentLimit} concurrent slots
            </p>
            <div className="mt-3">
              <Meter value={(running.length / Math.max(1, concurrentLimit)) * 100} tone="violet" />
            </div>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Connected tools</p>
            <p className="mt-2 font-display text-3xl font-semibold">{connected.length}</p>
            <p className="font-mono text-xs text-fog">of {connectors.length} available</p>
            <Link to="/app/connectors" className="mt-3 inline-block font-mono text-[11px] text-pink hover:underline">
              Manage connectors →
            </Link>
          </Panel>
          <Panel accent>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Estimated spend</p>
            <p className="mt-2 font-display text-3xl font-semibold">{money(spend)}</p>
            <p className="font-mono text-xs text-fog">{planLabel(profile?.plan)} plan this cycle</p>
            <Link to="/app/billing" className="mt-3 inline-block font-mono text-[11px] text-pink hover:underline">
              Upgrade for priority →
            </Link>
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel>
            <div className="flex items-center">
              <h2 className="font-display text-lg font-semibold">In flight now</h2>
              <Link to="/app/tasks" className="ml-auto font-mono text-[11px] text-fog hover:text-white">
                All tasks →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {running.length === 0 && <p className="text-sm text-mute">No background work at the moment.</p>}
              {running.map((t) => (
                <InlineTaskCard
                  key={t.id}
                  taskId={t.id}
                  title={t.title}
                  tier={t.tier}
                  status={t.status}
                  progress={t.progress}
                  meta={`${shortId(t.id)} · ${taskDuration(t)}`}
                />
              ))}
            </div>

            <h3 className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Recent agent activity</h3>
            <ul className="mt-3 divide-y divide-line">
              {tasks.length === 0 && <li className="py-3 text-sm text-mute">Nothing here yet.</li>}
              {tasks.slice(0, 6).map((t) => (
                <li key={t.id}>
                  <Link
                    to="/app/tasks/$taskId"
                    params={{ taskId: t.id }}
                    className="flex flex-wrap items-center gap-3 py-3 hover:text-white"
                  >
                    <StatusPill status={t.status} />
                    <span className="text-sm text-white">{t.title}</span>
                    <TierBadge tier={t.tier} className="ml-auto" />
                    <span className="font-mono text-[11px] text-mute">{taskDuration(t)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <h2 className="font-display text-lg font-semibold">Tier mix</h2>
              <div className="mt-4 space-y-4">
                {byTier.map((t) => (
                  <div key={t.tier}>
                    <div className="flex items-center gap-2">
                      <TierBadge tier={t.tier} />
                      <span className="ml-auto font-mono text-xs text-fog">{t.requests} req</span>
                      <span className="font-mono text-xs text-mute">{t.cost}</span>
                    </div>
                    <div className="mt-2">
                      <Meter value={t.share} tone={t.tier === "best" ? "pink" : t.tier === "medium" ? "mute" : "mint"} />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-mute">{tierMeta[t.tier].note}</p>
                  </div>
                ))}
              </div>
              <Link to="/app/usage" className="mt-5 inline-block font-mono text-[11px] text-pink hover:underline">
                Full usage breakdown →
              </Link>
            </Panel>

            <Panel>
              <h2 className="font-display text-lg font-semibold">Connections</h2>
              <ul className="mt-4 space-y-3">
                {connectors.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <Link
                      to="/app/connectors/$connectorId"
                      params={{ connectorId: c.id }}
                      className="text-sm text-white hover:text-pink"
                    >
                      {c.name}
                    </Link>
                    <span
                      className={
                        c.status === "connected"
                          ? "ml-auto font-mono text-[11px] text-mint"
                          : c.status === "degraded"
                            ? "ml-auto font-mono text-[11px] text-amber"
                            : "ml-auto font-mono text-[11px] text-mute"
                      }
                    >
                      {c.status === "connected"
                        ? "connected"
                        : c.status === "degraded"
                          ? "needs attention"
                          : "not connected"}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <h2 className="font-display text-lg font-semibold">Latest conversations</h2>
              <ul className="mt-4 space-y-3">
                {conversations.length === 0 && <li className="text-sm text-mute">No conversations yet.</li>}
                {conversations.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/app/conversations/$conversationId"
                      params={{ conversationId: c.id }}
                      className="block text-sm text-fog hover:text-white"
                    >
                      {c.title}
                      <span className="block font-mono text-[10px] text-mute">
                        {shortId(c.id, "CNV")} · {relativeTime(c.updated_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </section>
      </div>
    </>
  );
}
