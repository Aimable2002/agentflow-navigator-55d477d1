import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clipboard, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/pink/primitives";
import { relativeTime } from "@/lib/format";
import { useEaPendingOrders, useTradeOrders, useTradeOrdersRealtime } from "@/lib/queries";
import type { TradeOrder, TradeOrderRow, TradeOrderStatus } from "@/lib/types";

export const Route = createFileRoute("/app/agent-services/mt5-ea")({
  head: () => ({
    meta: [
      { title: "MT5 EA Execution | PINK workspace" },
      {
        name: "description",
        content: "Monitor MT5 EA order claims and broker execution receipts.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Mt5EaPage,
});

const downloadUrl =
  (import.meta.env["VITE_MT5_EA_DOWNLOAD_URL"] as string | undefined)?.trim() ?? "";
const statuses: Array<TradeOrderStatus | "partial"> = [
  "pending",
  "claimed",
  "executed",
  "partial",
  "rejected",
  "failed",
  "expired",
];
const statusStyles: Record<string, string> = {
  pending: "border-amber/40 bg-amber/10 text-amber",
  claimed: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  executed: "border-mint/40 bg-mint/10 text-mint",
  partial: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  rejected: "border-destructive/40 bg-destructive/10 text-red-300",
  failed: "border-destructive/40 bg-destructive/10 text-red-300",
  expired: "border-line bg-ink2 text-mute",
};

function makeInstallationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `mt5-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function Mt5EaPage() {
  const pending = useEaPendingOrders();
  const history = useTradeOrders();
  const realtime = useTradeOrdersRealtime();
  const [selected, setSelected] = useState<TradeOrderRow | null>(null);
  const [filter, setFilter] = useState("all");
  const [symbol, setSymbol] = useState("");
  const [installationId, setInstallationId] = useState("");
  const [localPaused, setLocalPaused] = useState(false);
  const [automationAcknowledged, setAutomationAcknowledged] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("pink-mt5-installation-id");
    setInstallationId(saved ?? makeInstallationId());
    setLocalPaused(window.localStorage.getItem("pink-mt5-local-paused") === "true");
  }, []);

  useEffect(() => {
    if (installationId) window.localStorage.setItem("pink-mt5-installation-id", installationId);
  }, [installationId]);

  const rows = history.data ?? [];
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const rowStatus = row.execution?.status ?? row.status;
        return (
          (filter === "all" || rowStatus === filter) &&
          (!symbol || row.symbol.toLowerCase().includes(symbol.toLowerCase()))
        );
      }),
    [filter, rows, symbol],
  );
  const counts = useMemo(() => {
    const result: Record<string, number> = { pending: pending.data?.orders.length ?? 0 };
    for (const row of rows) {
      const status = row.execution?.status ?? row.status;
      result[status] = (result[status] ?? 0) + 1;
    }
    return result;
  }, [pending.data?.orders.length, rows]);

  const toggleLocalPause = () => {
    const next = !localPaused;
    if (
      !window.confirm(
        next
          ? "Mark this installation paused? This frontend preference does not stop backend dispatch."
          : "Clear the local paused marker?",
      )
    )
      return;
    setLocalPaused(next);
    window.localStorage.setItem("pink-mt5-local-paused", String(next));
    toast(next ? "Installation marked paused locally." : "Installation marked active locally.");
  };

  return (
    <div className="p-4 lg:p-8">
      <Link to="/app/agent-services" className="font-mono text-xs text-mute hover:text-white">
        ← Agent services
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md border border-line bg-ink2 font-mono text-sm text-fog">
          EA
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">MT5 EA Execution</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
            operational dashboard
          </p>
        </div>
        <span
          className={`ml-auto inline-flex items-center gap-2 font-mono text-[11px] ${localPaused ? "text-amber" : "text-mute"}`}
        >
          <span className={`size-1.5 rounded-full ${localPaused ? "bg-amber" : "bg-mute"}`} />
          {localPaused
            ? "paused locally"
            : realtime === "live"
              ? "realtime connected"
              : realtime === "fallback"
                ? "polling fallback"
                : "reconnecting"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        {statuses.map((status) => (
          <StatusCount key={status} label={status} count={counts[status] ?? 0} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">Pending order queue</h2>
                <p className="mt-1 text-sm text-fog">
                  The backend is authoritative. Realtime events only trigger a refetch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void pending.refetch()}
                className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-xs text-white hover:bg-ink2"
              >
                <RefreshCw className="size-3.5" />
                Refresh
              </button>
            </div>
            {pending.error && <ErrorMessage message={pending.error.message} />}
            {pending.isLoading && (
              <p className="mt-5 text-sm text-mute">Loading executable orders…</p>
            )}
            {!pending.isLoading && !pending.error && (pending.data?.orders.length ?? 0) === 0 && (
              <EmptyState label="No executable orders are waiting." />
            )}
            <div className="mt-4 space-y-2">
              {(pending.data?.orders ?? []).map((order) => (
                <OrderLine
                  key={order.id}
                  order={order}
                  onSelect={() => setSelected({ ...order, execution: null, signal: null })}
                />
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-36 flex-1">
                <label
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute"
                  htmlFor="ea-symbol"
                >
                  Symbol
                </label>
                <input
                  id="ea-symbol"
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                  placeholder="All symbols"
                  className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-pink"
                />
              </div>
              <div className="min-w-36 flex-1">
                <label
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute"
                  htmlFor="ea-status"
                >
                  Status
                </label>
                <select
                  id="ea-status"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-pink"
                >
                  <option value="all">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Execution history</h2>
                <p className="mt-1 text-sm text-fog">
                  Signal intent and broker outcome remain separate.
                </p>
              </div>
              <span className="font-mono text-[11px] text-mute">{filteredRows.length} records</span>
            </div>
            {history.error && <ErrorMessage message={history.error.message} />}
            {history.isLoading && <p className="mt-5 text-sm text-mute">Loading order history…</p>}
            {!history.isLoading && !history.error && filteredRows.length === 0 && (
              <EmptyState label="No matching order history." />
            )}
            <div className="mt-4 space-y-2">
              {filteredRows.map((row) => (
                <OrderLine key={row.id} order={row} onSelect={() => setSelected(row)} />
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">MT5 installation</h2>
                <p className="mt-1 text-sm text-fog">
                  The current backend does not expose heartbeat or registration data.
                </p>
              </div>
              <span className="rounded border border-amber/40 bg-amber/10 px-2 py-1 font-mono text-[10px] uppercase text-amber">
                Not installed
              </span>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <InfoRow
                label="Installation ID"
                value={installationId || "Creating…"}
                copy={installationId}
              />
              <InfoRow label="Authenticated account" value="Current Supabase user" />
              <InfoRow label="MT5 account / broker" value="Not exposed by backend" />
              <InfoRow label="Last heartbeat / EA version" value="Not exposed by backend" />
            </dl>
            <button
              type="button"
              onClick={toggleLocalPause}
              className="mt-5 w-full rounded-md border border-amber/40 px-3 py-2 text-sm text-amber hover:bg-amber/10"
            >
              {localPaused ? "Clear local paused marker" : "Pause installation locally"}
            </button>
            <p className="mt-2 text-xs leading-relaxed text-mute">
              This marker is a frontend preference only. It does not pause backend order creation or
              EA dispatch.
            </p>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">EA release</h2>
            {downloadUrl ? (
              <>
                <p className="mt-2 text-sm text-fog">
                  Download the configured release, then install it in MT5.
                </p>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-pink px-3 py-2.5 text-sm font-medium text-ink hover:bg-white"
                >
                  <ExternalLink className="size-4" />
                  Download EA
                </a>
              </>
            ) : (
              <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
                EA release not published yet
              </p>
            )}
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-fog">
              <li>Install the configured EA release in MetaTrader 5.</li>
              <li>Use the installation ID above when the EA setup asks for it.</li>
              <li>
                Provide the backend URL:{" "}
                <code className="break-all text-xs text-white">
                  {(import.meta.env["VITE_PINK_API_URL"] as string | undefined) ||
                    "Backend URL is not configured"}
                </code>
              </li>
            </ol>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">Automation safety</h2>
            <p className="mt-2 text-sm leading-relaxed text-fog">
              Enabling an EA can place real broker orders. The current backend does not expose a
              global pause or installation enable endpoint, so this acknowledgment does not enable
              automation.
            </p>
            <label className="mt-4 flex items-start gap-3 text-sm text-white">
              <input
                type="checkbox"
                checked={automationAcknowledged}
                onChange={(event) => setAutomationAcknowledged(event.target.checked)}
                className="mt-0.5 size-4 accent-pink"
              />
              I understand that EA automation can place real orders.
            </label>
            <button
              type="button"
              disabled={!automationAcknowledged}
              className="mt-4 w-full rounded-md border border-line px-3 py-2 text-sm text-mute disabled:opacity-50"
            >
              Enable automation requires backend support
            </button>
          </Panel>
        </div>
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function StatusCount({ label, count }: { label: string; count: number }) {
  return (
    <div className={`rounded-md border px-3 py-3 ${statusStyles[label]}`}>
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-80">{label}</div>
      <div className="mt-1 text-xl font-semibold">{count}</div>
    </div>
  );
}

function OrderLine({
  order,
  onSelect,
}: {
  order: TradeOrder | TradeOrderRow;
  onSelect: () => void;
}) {
  const status = ("execution" in order ? order.execution?.status : null) ?? order.status;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="block w-full rounded-md border border-line bg-ink2 p-3 text-left hover:border-pink/50"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-white">{order.symbol}</span>
        <span className="font-mono text-xs uppercase text-fog">{order.direction}</span>
        <span
          className={`ml-auto rounded border px-2 py-0.5 font-mono text-[10px] uppercase ${statusStyles[status] ?? statusStyles["pending"]}`}
        >
          {status}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-mute">
        <span>Entry {order.entry ?? "—"}</span>
        <span>TP {order.take_profits.length ? order.take_profits.join(" / ") : "—"}</span>
        <span>{relativeTime(order.created_at)}</span>
      </div>
    </button>
  );
}

function OrderDetail({ order, onClose }: { order: TradeOrderRow; onClose: () => void }) {
  const status = order.execution?.status ?? order.status;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-line bg-ink p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
              Order detail
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              {order.symbol} · {order.direction}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-2 py-1 text-xs text-fog hover:text-white"
          >
            Close
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoRow label="Status" value={status} />
          <InfoRow label="Order type" value={order.order_type} />
          <InfoRow label="Requested entry" value={String(order.entry ?? "—")} />
          <InfoRow label="Stop loss" value={String(order.stop_loss ?? "—")} />
          <InfoRow label="Take profits" value={order.take_profits.join(" / ") || "—"} />
          <InfoRow
            label="Expiry"
            value={order.expiry_minutes ? `${order.expiry_minutes} minutes` : "—"}
          />
          <InfoRow label="Created" value={order.created_at} />
          <InfoRow label="Updated" value={order.updated_at} />
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <h3 className="font-display font-semibold">Broker outcome</h3>
          {order.execution ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoRow label="Receipt status" value={order.execution.status} />
              <InfoRow label="MT5 account" value={order.execution.mt5_account_id} />
              <InfoRow label="Broker ticket" value={order.execution.broker_ticket ?? "—"} />
              <InfoRow label="Fill price" value={String(order.execution.fill_price ?? "—")} />
              <InfoRow label="Volume" value={String(order.execution.volume ?? "—")} />
              <InfoRow
                label="Error"
                value={order.execution.error_message ?? order.execution.error_code ?? "—"}
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-amber">
              No execution receipt yet. This signal has not been shown as a successful trade.
            </p>
          )}
        </div>
        <details className="mt-5 border-t border-line pt-4">
          <summary className="cursor-pointer text-sm font-medium text-white">
            Original signal and raw Telegram message
          </summary>
          <div className="mt-3 space-y-3 text-sm text-fog">
            <InfoRow label="Signal ID" value={order.signal_id} />
            <InfoRow label="Channel" value={order.signal?.channel ?? "—"} />
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink2 p-3 text-xs text-fog">
              {order.signal?.raw_text ??
                "Original signal is not available from the current response."}
            </pre>
            {order.execution?.raw_response && (
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink2 p-3 text-xs text-fog">
                {JSON.stringify(order.execution.raw_response, null, 2)}
              </pre>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

function InfoRow({ label, value, copy }: { label: string; value: string; copy?: string }) {
  const copyValue = async () => {
    if (copy) {
      await navigator.clipboard.writeText(copy);
      toast.success("Copied.");
    }
  };
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-b border-line pb-2">
      <span className="text-fog">{label}</span>
      <span className="flex min-w-0 items-center gap-2 text-right font-mono text-[11px] text-white">
        <span className="truncate">{value}</span>
        {copy && (
          <button
            type="button"
            aria-label={`Copy ${label}`}
            title={`Copy ${label}`}
            onClick={() => void copyValue()}
            className="text-mute hover:text-white"
          >
            <Clipboard className="size-3.5" />
          </button>
        )}
      </span>
    </div>
  );
}
function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-white/90">
      {message}
    </p>
  );
}
function EmptyState({ label }: { label: string }) {
  return (
    <p className="mt-5 rounded-md border border-dashed border-line px-3 py-5 text-center text-sm text-mute">
      {label}
    </p>
  );
}
