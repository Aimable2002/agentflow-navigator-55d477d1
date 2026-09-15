import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { Meter, Panel, TierBadge } from "@/components/pink/primitives";
import { connectors, usage } from "@/lib/mock";

export const Route = createFileRoute("/app/usage")({
  head: () => ({
    meta: [
      { title: "Usage & quota | PINK workspace" },
      { name: "description", content: "Requests against your plan quota, split by model tier and connector." },
      { property: "og:title", content: "PINK usage and quota" },
      { property: "og:description", content: "See where your agent requests and spend are going." },
    ],
  }),
  component: Usage,
});

function Usage() {
  const pct = Math.round((usage.requestsUsed / usage.requestsLimit) * 100);
  const max = Math.max(...usage.daily.map((d) => d.small + d.medium + d.best));

  return (
    <>
      <PageHeader
        title="Usage"
        copy={`${usage.requestsUsed} of ${usage.requestsLimit} requests used this cycle. Renews ${usage.renewsOn}.`}
        actions={
          <Link
            to="/app/billing"
            className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
          >
            Upgrade plan
          </Link>
        }
      />

      <div className="space-y-6 p-4 lg:p-8">
        <section className="grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-semibold">Quota</h2>
              <span className="ml-auto font-mono text-xs text-fog">{pct}% used</span>
            </div>
            <div className="mt-3">
              <Meter value={pct} tone={pct > 80 ? "pink" : "mute"} />
            </div>
            <p className="mt-2 font-mono text-[11px] text-mute">
              {usage.requestsLimit - usage.requestsUsed} requests left · best-effort priority on {usage.plan}
            </p>

            <h3 className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Last 7 days by tier</h3>
            <div className="mt-4 flex h-40 items-end gap-3">
              {usage.daily.map((d) => {
                const total = d.small + d.medium + d.best;
                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="flex w-full flex-col justify-end overflow-hidden rounded-t"
                      style={{ height: `${(total / max) * 100}%` }}
                    >
                      <span className="w-full bg-pink" style={{ height: `${(d.best / total) * 100}%` }} />
                      <span className="w-full bg-fog/60" style={{ height: `${(d.medium / total) * 100}%` }} />
                      <span className="w-full bg-mint" style={{ height: `${(d.small / total) * 100}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-mute">{d.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 font-mono text-[10px] text-mute">
              <span className="text-mint">■ small</span>
              <span className="text-fog">■ medium</span>
              <span className="text-pink">■ best</span>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <h2 className="font-display text-lg font-semibold">Cost by tier</h2>
              <div className="mt-4 space-y-4">
                {usage.byTier.map((t) => (
                  <div key={t.tier}>
                    <div className="flex items-center gap-2">
                      <TierBadge tier={t.tier} />
                      <span className="ml-auto font-mono text-xs text-fog">{t.requests} req</span>
                      <span className="font-mono text-xs text-mute">{t.cost}</span>
                    </div>
                    <div className="mt-2">
                      <Meter value={t.share} tone={t.tier === "best" ? "pink" : t.tier === "medium" ? "mute" : "mint"} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-line pt-4 font-mono text-xs text-fog">
                Total this cycle · <span className="text-white">{usage.spend}</span> (covered by free tier)
              </p>
            </Panel>
            <Panel>
              <h2 className="font-display text-lg font-semibold">Connector calls</h2>
              <ul className="mt-4 space-y-3">
                {usage.byConnector.map((c) => (
                  <li key={c.id}>
                    <div className="flex items-center gap-2 text-sm">
                      <Link
                        to="/app/connectors/$connectorId"
                        params={{ connectorId: c.id }}
                        className="text-fog hover:text-white"
                      >
                        {connectors.find((x) => x.id === c.id)?.name}
                      </Link>
                      <span className="ml-auto font-mono text-xs text-mute">{c.calls}</span>
                    </div>
                    <div className="mt-1.5">
                      <Meter value={(c.calls / 184) * 100} tone="mute" />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </section>

        <Panel accent>
          <h2 className="font-display text-lg font-semibold">You are close to the free quota</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/90">
            At {pct}% used, heavy best-tier jobs will start queueing behind paid traffic. Pro raises the ceiling to
            10,000 requests and gives every request priority processing.
          </p>
          <Link
            to="/app/billing"
            className="mt-4 inline-block rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white"
          >
            Compare plans
          </Link>
        </Panel>
      </div>
    </>
  );
}
