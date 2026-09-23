import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { useSignalMonitor, useTradingAgent } from "@/lib/queries";

export const Route = createFileRoute("/app/agent-services/")({
  head: () => ({
    meta: [
      { title: "Agent services | PINK workspace" },
      {
        name: "description",
        content:
          "Background workers that keep running on your behalf, separate from the tools chat reaches for.",
      },
      { property: "og:title", content: "PINK agent services" },
      {
        property: "og:description",
        content: "Turn on persistent workers, like the Telegram and trading monitors.",
      },
    ],
  }),
  component: AgentServices,
});

function AgentServices() {
  const telegram = useSignalMonitor();
  const trading = useTradingAgent();

  const telegramStatus = telegram.data?.status;
  const telegramConfigured = (telegram.data?.config?.monitored_chats?.length ?? 0) > 0;
  const telegramLabel = !telegramConfigured
    ? "Not configured"
    : telegramStatus === "active"
      ? "Active"
      : "Paused";
  const telegramTone =
    telegramLabel === "Active"
      ? "text-mint"
      : telegramLabel === "Paused"
        ? "text-amber"
        : "text-mute";
  const telegramDot =
    telegramLabel === "Active" ? "bg-mint" : telegramLabel === "Paused" ? "bg-amber" : "bg-mute";

  const tradingStatus = trading.data?.status;
  const tradingConfigured = !!(
    trading.data?.config?.pair ||
    trading.data?.config?.timeframe ||
    trading.data?.config?.connector
  );
  const tradingLabel = !tradingConfigured
    ? "Not configured"
    : tradingStatus === "active"
      ? "Active"
      : "Paused";
  const tradingTone =
    tradingLabel === "Active"
      ? "text-mint"
      : tradingLabel === "Paused"
        ? "text-amber"
        : "text-mute";
  const tradingDot =
    tradingLabel === "Active" ? "bg-mint" : tradingLabel === "Paused" ? "bg-amber" : "bg-mute";

  return (
    <>
      <PageHeader
        title="Agent services"
        copy="Services run in the background on their own schedule. Unlike connectors, they are not tools the chat agent reaches for — you turn them on and they keep working."
      />

      <div className="space-y-6 p-4 lg:p-8">
        {(telegram.error || trading.error) && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
            {(telegram.error ?? trading.error)?.message}
          </p>
        )}
        {(telegram.isLoading || trading.isLoading) && (
          <p className="text-sm text-mute">Loading services…</p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md border border-line bg-ink2 font-mono text-xs text-fog">
                TG
              </span>
              <div>
                <h2 className="font-display text-base font-semibold">Telegram Signal Monitor</h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                  monitoring
                </p>
              </div>
              <span
                className={`ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] ${telegramTone}`}
              >
                <span className={`size-1.5 rounded-full ${telegramDot}`} />
                {telegramLabel}
              </span>
            </div>

            <p className="mt-3 text-sm text-fog">
              Watches Telegram chats you choose and normalizes the messages into structured trading
              signals.
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 font-mono text-[11px]">
              <div>
                <dt className="text-mute">Chats watched</dt>
                <dd className="mt-1 text-fog">
                  {telegram.data?.config?.monitored_chats?.length ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-mute">Alerts to</dt>
                <dd className="mt-1 truncate text-fog">
                  {telegram.data?.config?.alert_chat ?? "me"}
                </dd>
              </div>
            </dl>

            <Link
              to="/app/agent-services/telegram-signal-monitor"
              className="mt-4 inline-block rounded-md border border-line px-3 py-2 text-sm text-white hover:bg-ink2"
            >
              Open
            </Link>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md border border-line bg-ink2 font-mono text-xs text-fog">
                TA
              </span>
              <div>
                <h2 className="font-display text-base font-semibold">Trading Agent Monitor</h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                  analysis
                </p>
              </div>
              <span
                className={`ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] ${tradingTone}`}
              >
                <span className={`size-1.5 rounded-full ${tradingDot}`} />
                {tradingLabel}
              </span>
            </div>

            <p className="mt-3 text-sm text-fog">
              Runs market analysis with your configured pair, connector, and model ensemble.
            </p>

            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 font-mono text-[11px]">
              <div>
                <dt className="text-mute">Pair</dt>
                <dd className="mt-1 text-fog">{trading.data?.config?.pair ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-mute">Timeframe</dt>
                <dd className="mt-1 text-fog">{trading.data?.config?.timeframe ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-mute">Connector</dt>
                <dd className="mt-1 text-fog">{trading.data?.config?.connector ?? "mt5"}</dd>
              </div>
            </dl>

            <Link
              to="/app/agent-services/trading-agent"
              className="mt-4 inline-block rounded-md border border-line px-3 py-2 text-sm text-white hover:bg-ink2"
            >
              Open
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}
