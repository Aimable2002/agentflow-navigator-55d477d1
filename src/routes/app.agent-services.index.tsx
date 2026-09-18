import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { useSignalMonitor } from "@/lib/queries";

export const Route = createFileRoute("/app/agent-services/")({
  head: () => ({
    meta: [
      { title: "Agent services | PINK workspace" },
      {
        name: "description",
        content: "Background workers that keep running on your behalf, separate from the tools chat reaches for.",
      },
      { property: "og:title", content: "PINK agent services" },
      { property: "og:description", content: "Turn on persistent workers, like the Telegram signal monitor." },
    ],
  }),
  component: AgentServices,
});

function AgentServices() {
  const { data, isLoading, error } = useSignalMonitor();

  const status = data?.status;
  const configured = (data?.config?.monitored_chats?.length ?? 0) > 0;
  const label = !configured ? "Not configured" : status === "active" ? "Active" : "Paused";
  const tone =
    label === "Active" ? "text-mint" : label === "Paused" ? "text-amber" : "text-mute";
  const dot = label === "Active" ? "bg-mint" : label === "Paused" ? "bg-amber" : "bg-mute";
  const outOfCredits = data?.paused_reason === "credits_exhausted";

  return (
    <>
      <PageHeader
        title="Agent services"
        copy="Services run in the background on their own schedule. Unlike connectors, they are not tools the chat agent reaches for — you turn them on and they keep working."
      />

      <div className="space-y-6 p-4 lg:p-8">
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
            {error.message}
          </p>
        )}
        {isLoading && <p className="text-sm text-mute">Loading services…</p>}

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md border border-line bg-ink2 font-mono text-xs text-fog">
                TG
              </span>
              <div>
                <h2 className="font-display text-base font-semibold">Telegram Signal Monitor</h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">monitoring</p>
              </div>
              <span className={`ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] ${tone}`}>
                <span className={`size-1.5 rounded-full ${dot}`} />
                {label}
              </span>
            </div>

            <p className="mt-3 text-sm text-fog">
              Watches Telegram chats you choose and alerts you when it finds a real trading signal.
            </p>

            {outOfCredits && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono text-[11px] text-amber">
                Paused — out of credits
              </p>
            )}

            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 font-mono text-[11px]">
              <div>
                <dt className="text-mute">Chats watched</dt>
                <dd className="mt-1 text-fog">{data?.config?.monitored_chats?.length ?? 0}</dd>
              </div>
              <div>
                <dt className="text-mute">Min score</dt>
                <dd className="mt-1 text-fog">{data?.config?.min_confidence ?? 6}</dd>
              </div>
              <div>
                <dt className="text-mute">Alerts to</dt>
                <dd className="mt-1 truncate text-fog">{data?.config?.alert_chat ?? "me"}</dd>
              </div>
            </dl>

            <Link
              to="/app/agent-services/telegram-signal-monitor"
              className="mt-4 inline-block rounded-md border border-line px-3 py-2 text-sm text-white hover:bg-ink2"
            >
              Open
            </Link>
          </Panel>

          <TradingAgentCard />
        </div>
      </div>
    </>
  );
}

function TradingAgentCard() {
  const { data } = useTradingAgent();
  const config = data?.config;
  const configured = !!config?.pair && !!config?.timeframe;
  const label = !configured ? "Not configured" : data?.status === "active" ? "Active" : "Paused";
  const tone = label === "Active" ? "text-mint" : label === "Paused" ? "text-amber" : "text-mute";
  const dot = label === "Active" ? "bg-mint" : label === "Paused" ? "bg-amber" : "bg-mute";
  const outOfCredits = data?.paused_reason === "credits_exhausted";

  return (
    <Panel>
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-md border border-line bg-ink2 font-mono text-xs text-fog">
          TA
        </span>
        <div>
          <h2 className="font-display text-base font-semibold">Trading Agent</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">forecasting</p>
        </div>
        <span className={`ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] ${tone}`}>
          <span className={`size-1.5 rounded-full ${dot}`} />
          {label}
        </span>
      </div>

      <p className="mt-3 text-sm text-fog">
        Reads candles from your MT5 bridge and asks a forecasting model for a direction on one pair and timeframe.
      </p>

      {outOfCredits && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono text-[11px] text-amber">
          Paused — out of credits
        </p>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 font-mono text-[11px]">
        <div>
          <dt className="text-mute">Pair</dt>
          <dd className="mt-1 text-fog">{config?.pair ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-mute">Timeframe</dt>
          <dd className="mt-1 text-fog">{config?.timeframe ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-mute">Model</dt>
          <dd className="mt-1 truncate text-fog">{config?.forecast_model ?? "kronos"}</dd>
        </div>
      </dl>

      <Link
        to="/app/agent-services/trading-agent"
        className="mt-4 inline-block rounded-md border border-line px-3 py-2 text-sm text-white hover:bg-ink2"
      >
        Open
      </Link>
    </Panel>
  );
}
