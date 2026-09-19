import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, Check, Hash, Megaphone, User } from "lucide-react";
import { Panel } from "@/components/pink/primitives";
import { relativeTime } from "@/lib/format";
import { useSignalMonitor, useSignalMonitorControls, useSignalMonitorSignals, useTelegramChats, useTelegramStatus } from "@/lib/queries";

export const Route = createFileRoute("/app/agent-services/telegram-signal-monitor")({
  head: () => ({
    meta: [
      { title: "Telegram Signal Monitor | PINK workspace" },
      {
        name: "description",
        content: "Choose which Telegram chats are read and review normalized trading signals.",
      },
      { property: "og:title", content: "Telegram Signal Monitor" },
      { property: "og:description", content: "A background worker that watches Telegram for trading signals." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignalMonitor,
});

const field = "mt-1 w-full rounded-md border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-pink";

function SignalMonitor() {
  const [tab, setTab] = useState<"config" | "signals">("config");
  const telegram = useTelegramStatus();
  const monitor = useSignalMonitor();
  const telegramConnected = telegram.data?.connected === true;

  return (
    <div className="p-4 lg:p-8">
      <Link to="/app/agent-services" className="font-mono text-xs text-mute hover:text-white">
        ← Agent services
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md border border-line bg-ink2 font-mono text-sm text-fog">
          TG
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Telegram Signal Monitor</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">monitoring</p>
        </div>
        <span className="ml-auto font-mono text-[11px] text-mute">
          {monitor.data?.status === "active" ? "active" : monitor.data?.status === "paused" ? "paused" : "paused"}
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog">
        Messages from the chats you select are read for trading opportunities and normalized into structured signals.
      </p>

      {!telegram.isLoading && !telegramConnected ? (
        <Panel className="mt-6 max-w-2xl">
          <h2 className="font-display text-lg font-semibold">Telegram is not connected</h2>
          <p className="mt-2 text-sm text-fog">
            This service reads messages through your own Telegram account. Connect it on the Telegram connector page first,
            then come back here to choose chats.
          </p>
          <Link
            to="/app/connectors/$connectorId"
            params={{ connectorId: "telegram" }}
            className="mt-4 inline-block rounded-md bg-pink px-3 py-2 text-sm font-medium text-ink hover:bg-white"
          >
            Go to Telegram connector
          </Link>
        </Panel>
      ) : (
        <>
          <div className="mt-6 flex gap-1 border-b border-line">
            {(["config", "signals"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={
                  tab === t
                    ? "-mb-px border-b-2 border-pink px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-white"
                    : "-mb-px border-b-2 border-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-mute hover:text-white"
                }
              >
                {t === "config" ? "Configuration" : "Recent signals"}
              </button>
            ))}
          </div>

          {tab === "config" ? <ConfigTab enabled={telegramConnected} /> : <SignalsTab />}
        </>
      )}
    </div>
  );
}

function ConfigTab({ enabled }: { enabled: boolean }) {
  const monitor = useSignalMonitor();
  const chats = useTelegramChats(enabled);
  const { save, activate, pause } = useSignalMonitorControls();

  const [selected, setSelected] = useState<string[]>([]);
  const [alertChat, setAlertChat] = useState("me");
  const [activateError, setActivateError] = useState<string | null>(null);

  useEffect(() => {
    const config = monitor.data?.config;
    if (!config) return;
    setSelected(config.monitored_chats ?? []);
    setAlertChat(config.alert_chat || "me");
  }, [monitor.data]);

  const active = monitor.data?.status === "active";
  const pauseReason = monitor.data?.paused_reason;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const submit = () => {
    save.mutate(
      { monitored_chats: selected, alert_chat: alertChat.trim() || "me" },
      {
        onSuccess: () => toast.success("Monitoring settings saved."),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save these settings."),
      },
    );
  };

  const toggleActive = () => {
    setActivateError(null);
    if (active) {
      pause.mutate(undefined, {
        onSuccess: () => toast.success("Monitoring paused."),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not pause monitoring."),
      });
      return;
    }
    activate.mutate(undefined, {
      onSuccess: () => toast.success("Monitoring is on."),
      onError: (e) => setActivateError(e instanceof Error ? e.message : "Could not turn monitoring on."),
    });
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <Panel>
          <h2 className="font-display text-lg font-semibold">Chats to monitor</h2>
          <p className="mt-1 text-sm text-fog">Only the chats you tick here are read.</p>

          {chats.isLoading && <p className="mt-4 text-sm text-mute">Loading your chats…</p>}
          {chats.error && (
            <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-white/90">
              {chats.error.message}
            </p>
          )}

          <ul className="mt-4 max-h-80 space-y-1 overflow-y-auto pr-1">
            {(chats.data?.chats ?? []).map((chat) => {
              const id = String(chat.id);
              const checked = selected.includes(id);
              const kind = chat.is_channel ? "channel" : chat.is_group ? "group" : "direct";
              const Icon = chat.is_channel ? Megaphone : chat.is_group ? Hash : User;
              return (
                <li key={id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-md border border-line px-3 py-2 hover:bg-ink2">
                    <input type="checkbox" checked={checked} onChange={() => toggle(id)} className="size-4 accent-pink" />
                    <Icon className="size-4 text-mute" />
                    <span className="min-w-0 flex-1 truncate text-sm text-white">{chat.name}</span>
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-mute">
                      {kind}
                    </span>
                    {(chat.unread_count ?? 0) > 0 && (
                      <span className="font-mono text-[10px] text-fog">{chat.unread_count} unread</span>
                    )}
                  </label>
                </li>
              );
            })}
            {!chats.isLoading && (chats.data?.chats?.length ?? 0) === 0 && (
              <li className="text-sm text-fog">No chats came back from Telegram.</li>
            )}
          </ul>
          <p className="mt-3 font-mono text-[11px] text-mute">{selected.length} selected</p>
        </Panel>

        <Panel>
          <label className="block">
            <span className="text-sm font-medium text-white">Alert destination</span>
            <input value={alertChat} onChange={(e) => setAlertChat(e.target.value)} className={field} />
          </label>
          <p className="mt-2 text-sm text-fog">
            &lsquo;me&rsquo; sends alerts to your own Telegram Saved Messages. You can also enter a specific chat or
            contact.
          </p>
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
            {active ? "Pause monitoring" : "Activate monitoring"}
          </button>
          <span className="font-mono text-[11px] text-mute">
            {active ? "Currently active" : "Currently paused"}
          </span>
        </div>

        {activateError && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-white/90">
            {activateError}
          </p>
        )}
        {pauseReason && (
          <p className="rounded-md border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-[11px] text-amber">
            Paused — {pauseReason}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Panel>
          <h2 className="font-display text-lg font-semibold">Monitor status</h2>
          <div className="mt-4 space-y-3 text-sm text-fog">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
              <span>Status</span>
              <span className="font-mono text-[11px] uppercase text-white">{active ? "active" : "paused"}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
              <span>Alert target</span>
              <span className="font-mono text-[11px] text-white">{alertChat || "me"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Watched chats</span>
              <span className="font-mono text-[11px] text-white">{selected.length}</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function formatDirection(value: string | null | undefined) {
  const map: Record<string, string> = { buy: "Buy", sell: "Sell", call: "Call", put: "Put" };
  return value ? map[value] ?? value : "—";
}

function formatSignalState(signal: { parse_status?: string; normalized_signal?: { parse_status?: string } }) {
  const state = signal.parse_status ?? signal.normalized_signal?.parse_status ?? "pending";
  if (state === "rejected") return "Rejected / unusable";
  if (state === "pending") return "Pending parsing";
  return "Parsed";
}

function SignalsTab() {
  const { data, isLoading, error } = useSignalMonitorSignals();
  const [expanded, setExpanded] = useState<string | null>(null);
  const signals = data?.signals ?? [];

  const items = useMemo(
    () =>
      signals.map((signal) => ({
        ...signal,
        open: expanded === signal.id,
        type: signal.signal_type ?? signal.normalized_signal?.signal_type ?? null,
        direction: signal.direction ?? signal.normalized_signal?.direction ?? null,
        status: signal.parse_status ?? signal.normalized_signal?.parse_status ?? "pending",
      })),
    [expanded, signals],
  );

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
          <p className="text-sm text-fog">
            No signals yet — once you activate monitoring and a message comes in from a watched chat, it&rsquo;ll show up here.
          </p>
        </Panel>
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((signal) => {
            const open = signal.open;
            const failed = !signal.alerted && !!signal.alert_error;
            const parsed = signal.status === "parsed";
            const rejected = signal.status === "rejected";
            const pending = signal.status === "pending";

            return (
              <Panel key={signal.id} className="overflow-hidden">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                        {relativeTime(signal.created_at)}
                      </span>
                      <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                        {signal.channel ?? "unknown"}
                      </span>
                      <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                        {formatSignalState(signal)}
                      </span>
                    </div>

                    {rejected ? (
                      <p className="mt-3 text-sm text-destructive">This Telegram message was rejected as unusable.</p>
                    ) : pending ? (
                      <p className="mt-3 text-sm text-amber">Processing this message into a structured trade signal…</p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-white">
                        {signal.type && <span className="rounded border border-line px-2 py-1">{signal.type}</span>}
                        {signal.symbol && <span className="rounded border border-line px-2 py-1">{signal.symbol}</span>}
                        {signal.direction && <span className="rounded border border-line px-2 py-1">{formatDirection(signal.direction)}</span>}
                        {signal.entry !== null && signal.entry !== undefined && (
                          <span className="rounded border border-line px-2 py-1">Entry {signal.entry}</span>
                        )}
                        {signal.expiry_minutes && (
                          <span className="rounded border border-line px-2 py-1">Expiry {signal.expiry_minutes}m</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {signal.alerted ? (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-mint">
                        <Check className="size-3.5" /> sent
                      </span>
                    ) : failed ? (
                      <span
                        title={signal.alert_error ?? "Delivery failed"}
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-destructive"
                      >
                        <AlertTriangle className="size-3.5" /> failed
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-mute">pending alert</span>
                    )}
                  </div>
                </div>

                {!rejected && !pending && parsed && (
                  <div className="mt-4 grid gap-3 rounded-md border border-line bg-ink2 p-3 text-sm text-fog md:grid-cols-2">
                    {signal.symbol && <div><span className="text-mute">Symbol</span><div className="mt-1 text-white">{signal.symbol}</div></div>}
                    {signal.direction && <div><span className="text-mute">Direction</span><div className="mt-1 text-white">{formatDirection(signal.direction)}</div></div>}
                    {signal.entry !== null && signal.entry !== undefined && (
                      <div><span className="text-mute">Entry</span><div className="mt-1 text-white">{signal.entry}</div></div>
                    )}
                    {signal.stop_loss !== null && signal.stop_loss !== undefined && (
                      <div><span className="text-mute">Stop loss</span><div className="mt-1 text-white">{signal.stop_loss}</div></div>
                    )}
                    {signal.take_profits && signal.take_profits.length > 0 && (
                      <div className="md:col-span-2"><span className="text-mute">Take profits</span><div className="mt-1 flex flex-wrap gap-2 text-white">{signal.take_profits.map((tp) => <span key={`${signal.id}-${tp}`} className="rounded border border-line px-2 py-1">{tp}</span>)}</div></div>
                    )}
                    {signal.expiry_minutes && (
                      <div><span className="text-mute">Expiry</span><div className="mt-1 text-white">{signal.expiry_minutes} minutes</div></div>
                    )}
                  </div>
                )}

                {open && (
                  <div className="mt-4 rounded-md border border-line bg-ink2 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">Original message</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-fog">{signal.raw_text}</p>
                    {signal.model_reasoning && (
                      <>
                        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">Reasoning</p>
                        <p className="mt-2 text-sm text-fog">{signal.model_reasoning}</p>
                      </>
                    )}
                    {signal.normalized_signal && Object.keys(signal.normalized_signal).length > 0 && (
                      <>
                        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">Normalized payload</p>
                        <pre className="mt-2 overflow-x-auto rounded-md bg-ink p-3 text-xs text-mute">
                          {JSON.stringify(signal.normalized_signal, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : signal.id)}
                  className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-pink hover:text-white"
                >
                  {open ? "Hide details" : "Show details"}
                </button>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
