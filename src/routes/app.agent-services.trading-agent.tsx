import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Panel } from "@/components/pink/primitives";
import { relativeTime } from "@/lib/format";
import { useTradingAgent, useTradingAgentControls, useTradingAgentSignals } from "@/lib/queries";

export const Route = createFileRoute("/app/agent-services/trading-agent")({
  head: () => ({
    meta: [
      { title: "Trading Agent | PINK workspace" },
      {
        name: "description",
        content: "Pick a pair, a timeframe and a forecasting model, then generate and review directional signals.",
      },
      { property: "og:title", content: "Trading Agent" },
      { property: "og:description", content: "MT5 candles plus a forecasting model, on one pair and timeframe." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TradingAgentPage,
});

const field =
  "mt-1 w-full rounded-md border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-pink";

/** Pairs the MT5 bridge commonly exposes. The exact symbol must match your broker's naming. */
const PAIRS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "EURJPY",
  "GBPJPY",
  "XAUUSD",
  "BTCUSD",
  "ETHUSD",
];

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];

/** Forecast models the backend has configuration for. */
const MODELS = [
  { id: "kronos", label: "Kronos" },
  { id: "chronos2", label: "Chronos 2" },
];

function TradingAgentPage() {
  const agent = useTradingAgent();
  const { save, activate, pause, generate } = useTradingAgentControls();

  const [pair, setPair] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [model, setModel] = useState("kronos");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const config = agent.data?.config;
    if (!config) return;
    setPair(config.pair ?? "");
    setTimeframe(config.timeframe ?? "");
    setModel(config.forecast_model || "kronos");
  }, [agent.data]);

  const active = agent.data?.status === "active";
  const payload = { pair: pair || null, timeframe: timeframe || null, forecast_model: model };

  const onSave = () => {
    setActionError(null);
    save.mutate(payload, {
      onSuccess: () => toast.success("Settings saved."),
      onError: (e) => setActionError(e instanceof Error ? e.message : "Could not save these settings."),
    });
  };

  const onToggle = () => {
    setActionError(null);
    if (active) {
      pause.mutate(undefined, {
        onError: (e) => setActionError(e instanceof Error ? e.message : "Could not pause the agent."),
      });
      return;
    }
    activate.mutate(undefined, {
      onError: (e) => setActionError(e instanceof Error ? e.message : "Could not turn the agent on."),
    });
  };

  const onGenerate = () => {
    setActionError(null);
    generate.mutate(payload, {
      onSuccess: () => toast.success("Signal queued — it will appear below once the forecast returns."),
      onError: (e) => setActionError(e instanceof Error ? e.message : "Could not generate a signal."),
    });
  };

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
          <h1 className="font-display text-2xl font-semibold tracking-tight">Trading Agent</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">forecasting</p>
        </div>
        <span className="ml-auto font-mono text-[11px] text-mute">{active ? "active" : "paused"}</span>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog">
        Candles come from your own MT5 bridge and are passed to a forecasting model, which returns a direction and a
        confidence figure. No chat model is involved, and nothing is traded for you.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Instrument</h2>
            <p className="mt-1 text-sm text-fog">One pair and one timeframe per run.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Pair</span>
                <select className={field} value={pair} onChange={(e) => setPair(e.target.value)}>
                  <option value="">Select a pair…</option>
                  {PAIRS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Timeframe</span>
                <select className={field} value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                  <option value="">Select a timeframe…</option>
                  {TIMEFRAMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Forecast model</span>
              <select className={field} value={model} onChange={(e) => setModel(e.target.value)}>
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <span className="mt-2 block text-xs text-mute">
                The model reads the candle history and returns a direction with a confidence figure.
              </span>
            </label>
          </Panel>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={save.isPending}
              className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save settings"}
            </button>
            <button
              type="button"
              onClick={onToggle}
              disabled={activate.isPending || pause.isPending}
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2 disabled:opacity-60"
            >
              {active ? "Pause agent" : "Activate agent"}
            </button>
            <button
              type="button"
              onClick={onGenerate}
              disabled={generate.isPending}
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2 disabled:opacity-60"
            >
              {generate.isPending ? "Requesting…" : "Generate signal"}
            </button>
            <span className="font-mono text-[11px] text-mute">{active ? "Currently active" : "Currently paused"}</span>
          </div>

          {actionError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
              {actionError}
            </p>
          )}

          <SignalHistory />
        </div>

        <Panel className="h-fit">
          <h2 className="font-display text-lg font-semibold">How this works</h2>
          <ul className="mt-4 space-y-4 text-sm text-fog">
            <li className="border-l-2 border-pink pl-3">
              Prices come from your own MT5 bridge — nothing is bought from a market-data provider.
            </li>
            <li className="border-l-2 border-line pl-3">
              The forecast is a direction and a confidence figure, not advice and not an order.
            </li>
            <li className="border-l-2 border-line pl-3">
              Each generated signal costs real AI credits, so only keep the agent active while you need it.
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function directionMark(direction: string) {
  if (direction === "long") return { Icon: ArrowUp, tone: "text-mint" };
  if (direction === "short") return { Icon: ArrowDown, tone: "text-destructive" };
  return { Icon: Minus, tone: "text-mute" };
}

function SignalHistory() {
  const { data, isLoading, error } = useTradingAgentSignals();
  const signals = data?.signals ?? [];

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Signal history</h2>

      {error && (
        <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
          {error.message}
        </p>
      )}
      {isLoading && <p className="mt-3 text-sm text-mute">Loading signals…</p>}

      {!isLoading && !error && signals.length === 0 && (
        <Panel className="mt-3">
          <p className="text-sm text-fog">
            No signals yet — save a pair and timeframe, then use “Generate signal” to produce the first one.
          </p>
        </Panel>
      )}

      {signals.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-ink2 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
              <tr>
                <th className="px-4 py-3">Pair</th>
                <th className="px-4 py-3">Timeframe</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {signals.map((s) => {
                const { Icon, tone } = directionMark(String(s.direction));
                return (
                  <tr key={s.id} className="text-sm">
                    <td className="px-4 py-3 font-mono text-xs text-white">{s.pair}</td>
                    <td className="px-4 py-3 font-mono text-xs text-fog">{s.timeframe}</td>
                    <td className={`px-4 py-3 ${tone}`}>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                        <Icon className="size-3.5" />
                        {s.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-fog">
                      {typeof s.confidence === "number" ? s.confidence.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mute">{relativeTime(s.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
