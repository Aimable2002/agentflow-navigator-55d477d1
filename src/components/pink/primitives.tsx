import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { connectorLabels, tierMeta } from "@/lib/content";
import type { ConnectorId, TaskStatus, Tier } from "@/lib/types";

export function Logo({ size = "md", withWordmark = true }: { size?: "sm" | "md"; withWordmark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid place-items-center rounded-md bg-pink font-mono font-semibold text-ink",
          size === "sm" ? "size-7 text-xs" : "size-8 text-sm",
        )}
      >
        P
      </span>
      {withWordmark && (
        <span className={cn("font-display font-semibold tracking-tight", size === "sm" ? "text-base" : "text-lg")}>
          PINK
        </span>
      )}
    </span>
  );
}

export function Eyebrow({ children, tone = "mint" }: { children: ReactNode; tone?: "mint" | "pink" | "violet" }) {
  const tones = { mint: "text-mint", pink: "text-pink", violet: "text-violet" } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs",
        tones[tone],
      )}
    >
      <span className={cn("size-1.5 rounded-full pulse-dot", tone === "mint" ? "bg-mint" : tone === "pink" ? "bg-pink" : "bg-violet")} />
      {children}
    </span>
  );
}

export function Panel({
  children,
  className,
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        accent ? "border-pink/40 bg-pink/5" : "border-line bg-panel",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  label,
  title,
  copy,
  align = "left",
}: {
  label?: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {label && (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-mute">{label}</p>
      )}
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h2>
      {copy && <p className="mt-4 text-base leading-relaxed text-fog">{copy}</p>}
    </div>
  );
}

export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  const meta = tierMeta[tier];
  const border = tier === "best" ? "border-pink/40" : tier === "medium" ? "border-amber/40" : "border-mint/40";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em]",
        border,
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

const statusStyles: Record<TaskStatus, { dot: string; text: string; label: string }> = {
  queued: { dot: "bg-mute", text: "text-fog", label: "Queued" },
  running: { dot: "bg-violet pulse-dot", text: "text-violet", label: "Running" },
  completed: { dot: "bg-mint", text: "text-mint", label: "Completed" },
  failed: { dot: "bg-destructive", text: "text-destructive", label: "Failed" },
  cancelled: { dot: "bg-mute", text: "text-mute", label: "Cancelled" },
};

export function StatusPill({ status, className }: { status: TaskStatus; className?: string }) {
  const s = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em]", s.text, className)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function ConnectorChip({ id, className }: { id: ConnectorId | null; className?: string }) {
  if (!id) return null;
  return (
    <span
      className={cn(
        "rounded border border-line bg-ink2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-fog",
        className,
      )}
    >
      {connectorLabels[id] ?? id}
    </span>
  );
}

export function Meter({ value, tone = "pink" }: { value: number; tone?: "pink" | "violet" | "mint" | "mute" }) {
  const tones = { pink: "bg-pink", violet: "bg-violet", mint: "bg-mint", mute: "bg-fog" } as const;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className={cn("h-full rounded-full transition-all", tones[tone])} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function ActivityBars({ className }: { className?: string }) {
  return (
    <span className={cn("flex h-4 items-end gap-0.5", className)}>
      {[0, 0.15, 0.3, 0.45].map((d) => (
        <span key={d} className="w-1 h-full bg-mint bar-wave" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}

export function InlineTaskCard({
  taskId,
  title,
  tier,
  status,
  progress,
  meta,
}: {
  taskId: string;
  title: string;
  tier: Tier;
  status: TaskStatus;
  progress: number;
  meta: string;
}) {
  const running = status === "running";
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        running ? "border-violet/30 bg-violet/5" : status === "failed" ? "border-destructive/30 bg-destructive/5" : "border-line bg-ink2",
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", running ? "bg-violet pulse-dot" : status === "failed" ? "bg-destructive" : "bg-mint")} />
        <span className="text-xs font-medium text-white">{title}</span>
        <TierBadge tier={tier} className="ml-auto" />
      </div>
      <div className="mt-2.5">
        <Meter value={progress} tone={running ? "violet" : status === "failed" ? "pink" : "mint"} />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase text-mute">{meta}</span>
        <Link
          to="/app/tasks/$taskId"
          params={{ taskId }}
          className="ml-auto font-mono text-[11px] text-violet hover:underline"
        >
          View task →
        </Link>
      </div>
    </div>
  );
}
