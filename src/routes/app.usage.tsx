import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { ActivityBars, ConnectorChip, Meter, Panel, TierBadge } from "@/components/pink/primitives";
import { tierMeta } from "@/lib/content";
import { useConnectors, useProfile, useUsageEvents } from "@/lib/queries";
import { money, shortDate } from "@/lib/format";
import type { Tier, UsageEvent } from "@/lib/types";

export const Route = createFileRoute("/app/usage")({
  head: () => ({
    meta: [
      { title: "Usage | PINK workspace" },
      {
        name: "description",
        content: "Requests, tool calls and cost broken down by model tier, connector and day.",
      },
      { property: "og:title", content: "PINK usage" },
      { property: "og:description", content: "See exactly where your agent requests and spend went." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Usage,
});

const tiers: Tier[] = ["small", "medium", "best"];

function sum(events: UsageEvent[], key: "requests" | "tool_calls" | "cost_usd") {
  return events.reduce((acc, e) => acc + (e[key] ?? 0), 0);
}

/** Requests per day for the last 14 days, oldest first. */
function dailySeries(events: UsageEvent[], days = 14) {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const e of events) {
    const day = e.created_at.slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + (e.requests ?? 0));
  }
  return [...buckets.entries()].map(([day, value]) => ({ day, value }));
}

function Usage() {
  const { data: events = [], isLoading, error } = useUsageEvents();
  const { data: profile } = useProfile();
  const { data: connectors } = useConnectors();

  const totalRequests = sum(events, "requests");
  const totalToolCalls = sum(events, "tool_calls");
  const totalCost = sum(events, "cost_usd");
  const series = dailySeries(events);
  const peak = series.reduce((a, b) => (b.value > a.value ? b : a), series[0] ?? { day: "", value: 0 });

  const byConnector = [...
    events.reduce((map, e) => {
      if (!e.connector_id) return map;
      const prev = map.get(e.connector_id) ?? { calls: 0, cost: 0 };
      map.set(e.connector_id, { calls: prev.calls + (e.tool_calls ?? 0), cost: prev.cost + (e.cost_usd ?? 0) });
      return map;
    }, new Map<string, { calls: number; cost: number }>())
  ]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.calls - a.calls);

  const quotaPct =
    profile && profile.quota_limit > 0 ? Math.min(100, Math.round((profile.quota_used / profile.quota_limit) * 100)) : 0;

  return (
    <>
      <PageHeader
        title="Usage"
        copy="Every request is recorded with the tier that answered it and the connectors it touched, so routing decisions are auditable."
      />

      <div className="space-y-6 p-4 lg:p-8">
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
            {error.message}
          </p>
        )}
        {isLoading && <p className="text-sm text-mute">Loading usage…</p>}
        {!isLoading && events.length === 0 && (
          <p className="rounded-md border border-line bg-panel px-4 py-3 text-sm text-fog">
            No usage recorded yet. Numbers appear here as soon as the agent runs its first request.
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Requests</p>
            <p className="mt-2 font-display text-3xl font-semibold">{totalRequests.toLocaleString()}</p>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Tool calls</p>
            <p className="mt-2 font-display text-3xl font-semibold">{totalToolCalls.toLocaleString()}</p>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Model cost</p>
            <p className="mt-2 font-display text-3xl font-semibold">{money(totalCost)}</p>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Quota used</p>
            <p className="mt-2 font-display text-3xl font-semibold">{quotaPct}%</p>
            <div className="mt-3">
              <Meter value={quotaPct} tone={quotaPct > 85 ? "pink" : "mint"} />
            </div>
            {profile && (
              <p className="mt-2 font-mono text-[10px] text-mute">
                {profile.quota_used.toLocaleString()} / {profile.quota_limit.toLocaleString()} on {profile.plan}
              </p>
            )}
          </Panel>
        </section>

        <Panel>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-lg font-semibold">Requests per day</h2>
            <span className="ml-auto font-mono text-[11px] text-mute">
              last 14 days · peak {peak.value.toLocaleString()} on {shortDate(peak.day)}
            </span>
          </div>
          <div className="mt-5">
            <ActivityBars values={series.map((s) => s.value)} />
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="font-display text-lg font-semibold">By model tier</h2>
            <div className="mt-4 space-y-4">
              {tiers.map((t) => {
                const forTier = events.filter((e) => e.tier === t);
                const reqs = sum(forTier, "requests");
                const share = totalRequests > 0 ? Math.round((reqs / totalRequests) * 100) : 0;
                return (
                  <div key={t}>
                    <div className="flex items-center gap-3">
                      <TierBadge tier={t} />
                      <span className="text-sm text-fog">{tierMeta[t].label}</span>
                      <span className="ml-auto font-mono text-xs text-fog">
                        {reqs.toLocaleString()} req · {money(sum(forTier, "cost_usd"))}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Meter value={share} tone={t === "best" ? "pink" : t === "medium" ? "violet" : "mint"} />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-mute">{share}% of all requests</p>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">By connector</h2>
            <div className="mt-4 space-y-3">
              {byConnector.length === 0 && (
                <p className="text-sm text-fog">No connector tool calls recorded yet.</p>
              )}
              {byConnector.map((c) => {
                const top = byConnector[0]?.calls ?? 1;
                const name = connectors.find((k) => k.id === c.id)?.name;
                return (
                  <div key={c.id}>
                    <div className="flex items-center gap-2">
                      <ConnectorChip id={c.id} />
                      {name && <span className="text-sm text-fog">{name}</span>}
                      <span className="ml-auto font-mono text-xs text-fog">
                        {c.calls.toLocaleString()} calls · {money(c.cost)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Meter value={Math.round((c.calls / top) * 100)} tone="violet" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
