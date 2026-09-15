import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { Panel } from "@/components/pink/primitives";
import { Switch } from "@/components/ui/switch";
import { connectorById, tasks } from "@/lib/mock";

export const Route = createFileRoute("/app/connectors/$connectorId")({
  loader: ({ params }) => {
    const connector = connectorById(params.connectorId);
    if (!connector) throw notFound();
    return { connector };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Connector not found | PINK" }, { name: "robots", content: "noindex" }] };
    const c = loaderData.connector;
    return {
      meta: [
        { title: `${c.name} connector | PINK` },
        { name: "description", content: c.description },
        { property: "og:title", content: `${c.name} connector settings — PINK` },
        { property: "og:description", content: c.tagline },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold">Connector not found</h1>
      <Link to="/app/connectors" className="mt-4 inline-block font-mono text-sm text-pink hover:underline">
        ← All connectors
      </Link>
    </div>
  ),
  component: ConnectorDetail,
});

function ConnectorDetail() {
  const { connector: c } = Route.useLoaderData();
  const related = tasks.filter((t) => t.connector === c.id);

  return (
    <div className="p-4 lg:p-8">
      <Link to="/app/connectors" className="font-mono text-xs text-mute hover:text-white">
        ← Connectors
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="grid size-11 place-items-center rounded-md border border-line bg-panel font-mono text-sm text-fog">
          {c.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{c.name}</h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
            {c.category} · {c.connected ? c.account : "not connected"}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {c.connected ? (
            <>
              <button
                type="button"
                onClick={() => toast.success(`${c.name} re-synced`)}
                className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-panel"
              >
                Re-sync
              </button>
              <button
                type="button"
                onClick={() => toast(`${c.name} disconnected`, { description: "Running tasks using it were stopped." })}
                className="rounded-md border border-destructive/40 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => toast.success(`Authorisation started for ${c.name}`)}
              className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white"
            >
              Connect {c.name}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel>
            <h2 className="font-display text-lg font-semibold">About this connector</h2>
            <p className="mt-3 text-sm leading-relaxed text-fog">{c.description}</p>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">Permission scopes</h2>
            <p className="mt-2 text-sm text-fog">
              The agent can only do what is switched on here. Sensitive scopes stay off until you enable them.
            </p>
            <ul className="mt-4 divide-y divide-line">
              {c.scopes.map((s) => (
                <li key={s.label} className="flex items-center gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm text-white">{s.label}</p>
                    <p className="font-mono text-[11px] text-mute">{s.detail}</p>
                  </div>
                  <Switch
                    defaultChecked={s.granted}
                    disabled={!c.connected}
                    className="ml-auto"
                    onCheckedChange={(v) =>
                      toast(v ? `Granted: ${s.label}` : `Revoked: ${s.label}`, {
                        description: `${c.name} scope updated.`,
                      })
                    }
                    aria-label={s.label}
                  />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">What people ask it for</h2>
            <ul className="mt-4 space-y-2.5">
              {c.actions.map((a) => (
                <li key={a} className="flex gap-3 text-sm text-fog">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-mint" />
                  {a}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel accent={c.health === "degraded"}>
            <h2 className="font-display text-lg font-semibold">Connection</h2>
            <dl className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <dt className="text-mute">Status</dt>
                <dd className={c.connected ? (c.health === "degraded" ? "text-amber" : "text-mint") : "text-mute"}>
                  {c.connected ? (c.health === "degraded" ? "needs attention" : "healthy") : "not connected"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Last sync</dt>
                <dd className="text-fog">{c.lastSync ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Scopes granted</dt>
                <dd className="text-fog">
                  {c.scopes.filter((s) => s.granted).length} of {c.scopes.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Protocol</dt>
                <dd className="text-fog">MCP</dd>
              </div>
            </dl>
            {c.health === "degraded" && (
              <p className="mt-4 text-sm text-white/90">
                The last sync returned a stale token warning. Re-sync to refresh authorisation.
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">Recent tasks using {c.name}</h2>
            <ul className="mt-4 space-y-3">
              {related.length === 0 && <p className="text-sm text-fog">No tasks have used this connector yet.</p>}
              {related.map((t) => (
                <li key={t.id}>
                  <Link
                    to="/app/tasks/$taskId"
                    params={{ taskId: t.id }}
                    className="block text-sm text-fog hover:text-white"
                  >
                    {t.title}
                    <span className="block font-mono text-[10px] text-mute">
                      {t.id} · {t.status} · {t.duration}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
