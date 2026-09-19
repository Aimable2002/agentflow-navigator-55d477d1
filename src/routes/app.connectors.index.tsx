import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { useConnectors } from "@/lib/queries";
import { relativeTime } from "@/lib/format";

export const Route = createFileRoute("/app/connectors/")({
  head: () => ({
    meta: [
      { title: "Connectors | PINK workspace" },
      {
        name: "description",
        content: "Connect MT5, GitHub, Linear, Telegram and more, and review each connection's health.",
      },
      { property: "og:title", content: "PINK connectors" },
      { property: "og:description", content: "Manage the tools the agent is allowed to act inside." },
    ],
  }),
  component: Connectors,
});

function Connectors() {
  const { data: connectors, isLoading, error } = useConnectors();
  const connected = connectors.filter((c) => c.connected);
  const available = connectors.filter((c) => !c.connected);

  return (
    <>
      <PageHeader
        title="Connectors"
        copy="Each connector is a scoped link to one of your accounts. Grant the narrowest permissions that let the agent finish the job."
        actions={
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
            {connected.length} of {connectors.length} connected
          </span>
        }
      />

      <div className="space-y-8 p-4 lg:p-8">
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
            {error.message}
          </p>
        )}
        {isLoading && <p className="text-sm text-mute">Loading connectors…</p>}

        {connected.length > 0 && (
          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Connected</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {connected.map((c) => (
                <Panel key={c.id}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-md border border-line bg-ink2 font-mono text-xs text-fog">
                      {c.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold">{c.name}</h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{c.category}</p>
                    </div>
                    <span
                      className={
                        c.status === "degraded"
                          ? "ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-amber"
                          : "ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-mint"
                      }
                    >
                      <span
                        className={
                          c.status === "degraded" ? "size-1.5 rounded-full bg-amber" : "size-1.5 rounded-full bg-mint"
                        }
                      />
                      {c.status === "degraded" ? "needs attention" : "healthy"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-fog">{c.tagline}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 font-mono text-[11px]">
                    <div>
                      <dt className="text-mute">Account</dt>
                      <dd className="mt-1 truncate text-fog">{c.connection?.account_label ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-mute">Transport</dt>
                      <dd className="mt-1 text-fog">{c.kind === "mcp" ? c.transport ?? "—" : "Native API"}</dd>
                    </div>
                    <div>
                      <dt className="text-mute">Last sync</dt>
                      <dd className="mt-1 text-fog">{relativeTime(c.connection?.last_sync_at)}</dd>
                    </div>
                  </dl>
                  {c.connection?.last_error && (
                    <p className="mt-3 font-mono text-[11px] text-amber">{c.connection.last_error}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link
                      to="/app/connectors/$connectorId"
                      params={{ connectorId: c.id }}
                      className="rounded-md border border-line px-3 py-2 text-sm text-white hover:bg-ink2"
                    >
                      Configure
                    </Link>
                    <Link
                      to="/app/chat"
                      className="rounded-md bg-pink px-3 py-2 text-sm font-medium text-ink hover:bg-white"
                    >
                      Use in chat
                    </Link>
                  </div>
                </Panel>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Available to connect</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {available.map((c) => (
              <Panel key={c.id} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-semibold">{c.name}</h3>
                  <span className="ml-auto font-mono text-[11px] text-mute">○</span>
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{c.category}</p>
                <p className="mt-3 flex-1 text-sm text-fog">{c.tagline}</p>
                <Link
                  to="/app/connectors/$connectorId"
                  params={{ connectorId: c.id }}
                  className="mt-4 rounded-md border border-line px-3 py-2 text-center text-sm text-white hover:bg-ink2"
                >
                  Connect
                </Link>
              </Panel>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
