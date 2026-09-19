import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Panel } from "@/components/pink/primitives";
import { relativeTime } from "@/lib/format";
import { useConnectors, useTradingAgent, useTradingAgentControls, useTradingAgentSignals } from "@/lib/queries";

export const Route = createFileRoute("/app/agent-services/trading-agent")({
  head: () => ({
    meta: [
      { title: "Trading Agent Monitor | PINK workspace" },
      {
        name: "description",
        content: "Configure the trading agent, select a connector and timeframe, and review generated model signals.",
      },
      { property: "og:title", content: "Trading Agent Monitor" },
      { property: "og:description", content: "A background trading agent that generates and tracks multi-model market signals." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TradingAgentPage,
});

const defaultConfig = {
  pair: null,
  timeframe: null,
  connector: "mt5",
  candle_tool: "get_candles",
  forecast_models: ["chronos2", "timesfm2_5", "moirai_moe"],
} as const;

const field = "mt-1 w-full rounded-md border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-pink";

function TradingAgentPage() {
  const [tab, setTab] = useState<"config" | "signals">("config");
  const trading = useTradingAgent();

  return (
    <div className="p-4 lg:p-8">
      <Link to="/app/agent-services" className="font-mono text-xs text-mute hover:text-white">
        ← Agent services
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md border border-line bg-ink2 font-mono text-sm text-fog">
          TA
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Trading Agent Monitor</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">analysis</p>
        </div>
        <span className="ml-auto font-mono text-[11px] text-mute">
          {trading.data?.status === "active" ? "active" : "paused"}
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog">
        Configure the market pair and model ensemble, then generate new trading signals from your connected broker or chart provider.
      </p>

      <div className="mt-6 flex gap-1 border-b border-line">
        {(["config", "signals"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={
              tab === item
                ? "-mb-px border-b-2 border-pink px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-white"
                : "-mb-px border-b-2 border-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-mute hover:text-white"
            }
          >
            {item === "config" ? "Configuration" : "Recent signals"}
          </button>
        ))}
      </div>

      {tab === "config" ? <ConfigTab /> : <SignalsTab />}
    </div>
  );
}

function ConfigTab() {
  const trading = useTradingAgent();
  const connectors = useConnectors();
  const { save, activate, pause, generate } = useTradingAgentControls();

  const [pair, setPair] = useState(defaultConfig.pair ?? "");
  const [timeframe, setTimeframe] = useState(defaultConfig.timeframe ?? "");
  const [connector, setConnector] = useState<"mt5" | "ctrader">(defaultConfig.connector);
  const [candleTool, setCandleTool] = useState(defaultConfig.candle_tool);
  const [forecastModels, setForecastModels] = useState<string[]>([...defaultConfig.forecast_models]);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [generateStatus, setGenerateStatus] = useState<string | null>(null);

  useEffect(() => {
    const config = trading.data?.config ?? defaultConfig;
    setPair(config.pair ?? "");
    setTimeframe(config.timeframe ?? "");
    setConnector(config.connector ?? defaultConfig.connector);
    setCandleTool(config.candle_tool ?? defaultConfig.candle_tool);
    setForecastModels(config.forecast_models && config.forecast_models.length > 0 ? config.forecast_models : [...defaultConfig.forecast_models]);
  }, [trading.data]);

  const connectedConnector = connectors.data?.find((entry) => entry.id === connector)?.connected ?? false;
  const active = trading.data?.status === "active";

  const showCandleTool = candleTool !== "get_candles";

  const toggleModel = (model: string) => {
    setForecastModels((current) =>
      current.includes(model) ? current.filter((item) => item !== model) : [...current, model],
    );
  };

  const submit = () => {
    save.mutate(
      {
        pair: pair.trim() || null,
        timeframe: timeframe.trim() || null,
        connector,
        candle_tool: candleTool,
        forecast_models: forecastModels,
      },
      {
        onSuccess: () => toast.success("Trading agent settings saved."),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save trading settings."),
      },
    );
  };

  const toggleActive = () => {
    setActivateError(null);
    if (active) {
      pause.mutate(undefined, {
        onSuccess: () => toast.success("Trading agent paused."),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Could not pause trading agent."),
      });
      return;
    }
    activate.mutate(undefined, {
      onSuccess: () => toast.success("Trading agent activated."),
      onError: (error) => setActivateError(error instanceof Error ? error.message : "Could not activate trading agent."),
    });
  };

  const generateSignal = () => {
    setGenerateStatus(null);
    generate.mutate(undefined, {
      onSuccess: (result) => {
        const nextStatus = result?.status ?? "queued";
        setGenerateStatus(`Job queued (${nextStatus}). The generated signal will appear after a short delay.`);
        toast.success("Signal generation queued.");
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Could not queue a signal generation request.";
        setGenerateStatus(message);
        toast.error(message);
      },
    });
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <Panel>
          <h2 className="font-display text-lg font-semibold">Trading configuration</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-white">Pair</span>
              <input value={pair} onChange={(event) => setPair(event.target.value)} placeholder="EURUSD" className={field} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-white">Timeframe</span>
              <select value={timeframe} onChange={(event) => setTimeframe(event.target.value)} className={field}>
                <option value="">Select</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-white">Connector</span>
              <select
                value={connector}
                onChange={(event) => setConnector(event.target.value as "mt5" | "ctrader")}
                className={field}
              >
                <option value="mt5">MT5</option>
                <option value="ctrader">cTrader</option>
              </select>
            </label>
          </div>

          {!connectedConnector && (
            <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
              This connector is not connected yet. The worker will pause until the connector is connected in settings.
            </p>
          )}

          {showCandleTool && (
            <label className="mt-4 block">
              <span className="text-sm font-medium text-white">Candle tool</span>
              <input value={candleTool} onChange={(event) => setCandleTool(event.target.value)} className={field} />
            </label>
          )}
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Forecast models</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {defaultConfig.forecast_models.map((model) => {
              const on = forecastModels.includes(model);
              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => toggleModel(model)}
                  className={
                    on
                      ? "rounded-md border border-pink bg-pink/10 px-2.5 py-1.5 text-xs font-medium text-pink"
                      : "rounded-md border border-line px-2.5 py-1.5 text-xs text-fog hover:bg-ink2"
                  }
                >
                  {model}
                </button>
              );
            })}
          </div>
        </Panel>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={save.isPending}
            className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : "Save settings"}
          </button>

          <button
            type="button"
            onClick={toggleActive}
            disabled={activate.isPending || pause.isPending}
            className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2 disabled:opacity-60"
          >
            {active ? "Pause agent" : "Activate agent"}
          </button>

          <button
            type="button"
            onClick={generateSignal}
            disabled={generate.isPending}
            className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2 disabled:opacity-60"
          >
            {generate.isPending ? "Generating…" : "Generate signal"}
          </button>
        </div>

        {activateError && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-white/90">
            {activateError}
          </p>
        )}

        {generateStatus && (
          <p className="rounded-md border border-line bg-ink2 px-3 py-2 text-sm text-fog">{generateStatus}</p>
        )}
      </div>

      <div className="space-y-4">
        <Panel>
          <h2 className="font-display text-lg font-semibold">Agent status</h2>
          <div className="mt-4 space-y-3 text-sm text-fog">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
              <span>Status</span>
              <span className="font-mono text-[11px] uppercase text-white">{active ? "active" : "paused"}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
              <span>Pair</span>
              <span className="font-mono text-[11px] text-white">{pair || "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
              <span>Timeframe</span>
              <span className="font-mono text-[11px] text-white">{timeframe || "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Connector</span>
              <span className="font-mono text-[11px] text-white">{connector}</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SignalsTab() {
  const { data, isLoading, error } = useTradingAgentSignals();
  const signals = data?.signals ?? [];

  return (
    <div className="mt-6">
      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
          {error.message}
        </p>
      )}
      {isLoading && <p className="text-sm text-mute">Loading signals…</p>}

      {!isLoading && signals.length === 0 && (
        <Panel>
          <p className="text-sm text-fog">No generated trading signals yet. Queue a new signal when you’re ready.</p>
        </Panel>
      )}

      {signals.length > 0 && (
        <div className="space-y-4">
          {signals.map((signal) => (
            <Panel key={signal.id} className="overflow-hidden">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                      {relativeTime(signal.created_at)}
                    </span>
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                      {signal.pair}
                    </span>
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                      {signal.timeframe}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white">
                    <span className="rounded border border-line px-2 py-1">{signal.signal.symbol}</span>
                    <span className="rounded border border-line px-2 py-1">{signal.signal.direction}</span>
                    <span className="rounded border border-line px-2 py-1">Entry {signal.signal.entry ?? "—"}</span>
                    <span className="rounded border border-line px-2 py-1">Consensus {signal.signal.consensus}</span>
                  </div>
                </div>

                <div className="font-mono text-[11px] uppercase text-mute">{signal.outcome_status}</div>
              </div>

              <div className="mt-4 grid gap-3 rounded-md border border-line bg-ink2 p-3 text-sm text-fog md:grid-cols-2">
                {signal.signal.take_profits && signal.signal.take_profits.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-mute">Take profits</span>
                    <div className="mt-1 flex flex-wrap gap-2 text-white">
                      {signal.signal.take_profits.map((tp, index) => (
                        <span key={`${signal.id}-tp-${index}`} className="rounded border border-line px-2 py-1">
                          {tp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-mute">Stop loss</span>
                  <div className="mt-1 text-white">{signal.signal.stop_loss ?? "—"}</div>
                </div>

                <div>
                  <span className="text-mute">Confidence</span>
                  <div className="mt-1 text-white">{signal.signal.confidence}</div>
                </div>
              </div>

              {signal.model_forecasts && signal.model_forecasts.length > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">Model comparison</p>
                  <div className="mt-2 space-y-2">
                    {signal.model_forecasts.map((forecast) => (
                      <div key={`${signal.id}-${forecast.model}`} className="rounded-md border border-line bg-ink2 p-3 text-sm text-fog">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-white">{forecast.model}</span>
                          <span className="font-mono text-[10px] uppercase text-mute">{forecast.direction}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span>Confidence {forecast.confidence}</span>
                          <span>Entry {forecast.entry ?? "—"}</span>
                          <span>SL {forecast.stop_loss ?? "—"}</span>
                        </div>
                        {forecast.take_profits && forecast.take_profits.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {forecast.take_profits.map((tp, index) => (
                              <span key={`${forecast.model}-tp-${index}`} className="rounded border border-line px-2 py-1 text-white">
                                TP {tp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <details className="mt-4 text-sm text-fog">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.12em] text-pink">
                  Raw payload
                </summary>
                <pre className="mt-2 overflow-x-auto rounded-md bg-ink p-3 text-xs text-mute">
                  {JSON.stringify(signal.raw_forecast, null, 2)}
                </pre>
              </details>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
