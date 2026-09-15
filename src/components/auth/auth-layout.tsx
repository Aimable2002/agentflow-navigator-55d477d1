import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ActivityBars, Logo } from "@/components/pink/primitives";

export function AuthLayout({
  eyebrow,
  title,
  copy,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-ink text-white lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col px-6 py-8 lg:px-16">
        <Link to="/" aria-label="PINK home">
          <Logo />
        </Link>
        <div className="mx-auto w-full max-w-sm flex-1 py-14">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-pink">{eyebrow}</p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-fog">{copy}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-fog">{footer}</div>}
        </div>
        <p className="font-mono text-[11px] text-mute">
          By continuing you agree to the{" "}
          <Link to="/terms" className="hover:text-white">
            terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="hover:text-white">
            privacy policy
          </Link>
          .
        </p>
      </div>

      <aside className="hidden border-l border-line bg-ink2 p-16 lg:flex lg:flex-col lg:justify-center">
        <div className="console-shadow rounded-xl border border-line bg-ink p-6">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="font-mono text-xs text-mute">pink://agent/run</span>
            <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-mint">
              <span className="size-1.5 rounded-full bg-mint pulse-dot" /> LIVE
            </span>
          </div>
          <div className="mt-4 space-y-3 font-mono text-xs">
            <p className="text-white/90">→ reconcile February and file the exceptions</p>
            <p className="text-mint">routed · small tier</p>
            <p className="text-fog">xero · 412 transactions read</p>
            <p className="text-fog">linear · issue FIN-118 created</p>
            <p className="text-mint">done in 1m 22s</p>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
            <ActivityBars />
            <span className="font-mono text-xs text-mint">2 tasks running</span>
          </div>
        </div>
        <p className="mt-8 max-w-sm text-sm leading-relaxed text-fog">
          Tiered routing, seven connectors and background execution — one workspace where you can always see what the
          agent did.
        </p>
      </aside>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center text-sm text-white">
        {label}
        {hint && <span className="ml-auto font-mono text-[11px] text-mute">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-ink2 px-3 py-2.5 text-sm text-white placeholder:text-mute focus:border-pink focus:outline-none";

export const submitClass =
  "w-full rounded-md bg-pink px-4 py-3 font-medium text-ink transition-colors hover:bg-white";
