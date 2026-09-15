import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { Meter, Panel } from "@/components/pink/primitives";
import { plans } from "@/lib/content";
import { useInvoices, useProfile, useUpdateProfile } from "@/lib/queries";
import { shortDate, money, relativeTime } from "@/lib/format";

export const Route = createFileRoute("/app/billing")({
  head: () => ({
    meta: [
      { title: "Billing | PINK workspace" },
      { name: "description", content: "Your plan, the quota it buys, and every invoice issued on your account." },
      { property: "og:title", content: "PINK billing" },
      { property: "og:description", content: "Plan, quota and invoice history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Billing,
});

/** Quota and concurrency each plan grants, applied when the plan changes. */
const planLimits: Record<string, { quota_limit: number; concurrent_limit: number }> = {
  free: { quota_limit: 500, concurrent_limit: 5 },
  pro: { quota_limit: 10000, concurrent_limit: 25 },
  scale: { quota_limit: 1000000, concurrent_limit: 100 },
};

function Billing() {
  const { data: profile, isLoading, error } = useProfile();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const update = useUpdateProfile();

  const currentPlan = profile?.plan ?? "free";
  const used = profile?.quota_used ?? 0;
  const limit = profile?.quota_limit ?? 0;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  const switchTo = (planId: string) => {
    const limits = planLimits[planId];
    if (!limits) return;
    update.mutate(
      { plan: planId, ...limits },
      {
        onSuccess: () => toast.success(`You're on the ${planId} plan`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not change the plan."),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="Billing"
        copy="Your plan sets the monthly request quota, how many tasks can run at once, and where your work sits in the queue."
      />

      <div className="space-y-6 p-4 lg:p-8">
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
            {error.message}
          </p>
        )}
        {isLoading && <p className="text-sm text-mute">Loading your plan…</p>}

        {profile && (
          <Panel>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-lg font-semibold">Current plan</h2>
              <span className="rounded-md bg-pink px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink">
                {profile.plan}
              </span>
              <span className="ml-auto font-mono text-[11px] text-mute">
                period started {shortDate(profile.quota_period_start)}
              </span>
            </div>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-semibold">{used.toLocaleString()}</span>
                  <span className="font-mono text-xs text-mute">of {limit.toLocaleString()} requests used</span>
                </div>
                <div className="mt-3">
                  <Meter value={pct} tone={pct > 85 ? "pink" : "mint"} />
                </div>
              </div>
              <div className="font-mono text-xs text-fog">
                <p className="text-mute">Concurrent tasks</p>
                <p className="mt-1 font-display text-2xl font-semibold text-white">{profile.concurrent_limit}</p>
              </div>
            </div>
          </Panel>
        )}

        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Plans</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {plans.map((p) => {
              const isCurrent = p.id === currentPlan;
              return (
                <Panel key={p.id} className={isCurrent ? "border-pink/50" : ""}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                    {isCurrent && (
                      <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-pink">current</span>
                    )}
                  </div>
                  <p className="mt-2">
                    <span className="font-display text-3xl font-semibold">{p.price}</span>{" "}
                    <span className="font-mono text-xs text-mute">{p.cadence}</span>
                  </p>
                  <p className="mt-2 text-sm text-fog">{p.tagline}</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-fog">
                    {p.includes.slice(0, 5).map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-pink" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={isCurrent || update.isPending}
                    onClick={() => switchTo(p.id)}
                    className={
                      isCurrent
                        ? "mt-5 w-full rounded-md border border-line px-4 py-2.5 text-sm text-mute"
                        : "mt-5 w-full rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white disabled:opacity-50"
                    }
                  >
                    {isCurrent ? "Your plan" : update.isPending ? "Switching…" : `Switch to ${p.name}`}
                  </button>
                </Panel>
              );
            })}
          </div>
        </section>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Invoices</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                  <th className="pb-2 pr-4 font-normal">Number</th>
                  <th className="pb-2 pr-4 font-normal">Issued</th>
                  <th className="pb-2 pr-4 font-normal">Plan</th>
                  <th className="pb-2 pr-4 font-normal">Amount</th>
                  <th className="pb-2 pr-4 font-normal">Status</th>
                  <th className="pb-2 font-normal" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {invoicesLoading && (
                  <tr>
                    <td colSpan={6} className="py-4 text-mute">
                      Loading invoices…
                    </td>
                  </tr>
                )}
                {!invoicesLoading && invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-mute">
                      No invoices yet. Free-plan accounts are never billed.
                    </td>
                  </tr>
                )}
                {invoices.map((i) => (
                  <tr key={i.id} className="text-fog">
                    <td className="py-3 pr-4 font-mono text-xs text-white">{i.number}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{shortDate(i.issued_at)}</td>
                    <td className="py-3 pr-4">{i.plan}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{money(i.amount_usd)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          i.status === "paid" ? "font-mono text-[11px] text-mint" : "font-mono text-[11px] text-amber"
                        }
                      >
                        {i.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {i.invoice_url && (
                        <a href={i.invoice_url} target="_blank" rel="noreferrer" className="text-pink hover:underline">
                          View ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {profile && (
            <p className="mt-4 font-mono text-[11px] text-mute">
              Billing contact: {profile.email ?? "—"}
              {profile.company ? ` · ${profile.company}` : ""} ·{" "}
              <Link to="/app/settings/account" className="text-pink hover:underline">
                edit in account settings
              </Link>
            </p>
          )}
          {invoices[0] && (
            <p className="mt-1 font-mono text-[11px] text-mute">
              Last invoice issued {relativeTime(invoices[0].issued_at)}.
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}
