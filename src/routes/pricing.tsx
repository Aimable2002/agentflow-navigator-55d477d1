import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { CtaBand, PageHero, SiteLayout } from "@/components/site/site-layout";
import { Panel, SectionHeading } from "@/components/pink/primitives";
import { faqs, planMatrix, plans } from "@/lib/content";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — free tier and priority paid plans | PINK" },
      {
        name: "description",
        content:
          "Compare the PINK free tier against Pro and Scale: request quotas, best-tier access, connector limits, background task concurrency and queue priority.",
      },
      { property: "og:title", content: "PINK pricing — start free, upgrade for priority" },
      {
        property: "og:description",
        content: "Free best-effort requests, or paid priority processing with unmetered best-tier routing.",
      },
    ],
  }),
  component: Pricing,
});

function Cell({ value }: { value: string }) {
  if (value === "—")
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-mute">
        <Minus className="size-3" /> not included
      </span>
    );
  return <span className="text-sm text-fog">{value}</span>;
}

function Pricing() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Free to run real work. <span className="text-pink">Paid</span> when priority matters.
          </>
        }
        copy="Every plan uses the same routing engine and the same connectors. What you buy is capacity, priority and history."
      />

      <div className="mx-auto max-w-7xl px-6">
        <section className="grid gap-4 py-14 lg:grid-cols-3">
          {plans.map((p) => (
            <Panel key={p.id} accent={!!p.featured} className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold">{p.name}</h2>
                {p.featured && (
                  <span className="rounded-full border border-pink/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-pink">
                    most chosen
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-fog">{p.blurb}</p>
              <p className="mt-6 font-display text-4xl font-semibold">{p.price}</p>
              <p className="font-mono text-xs text-mute">{p.cadence}</p>

              <div className="mt-5 rounded-md border border-line bg-ink2 p-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Included</p>
                <p className="mt-1.5 text-sm text-white">{p.quota}</p>
                <p className="font-mono text-xs text-fog">{p.priority}</p>
              </div>

              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-fog">
                    <Check className="mt-0.5 size-4 shrink-0 text-mint" />
                    {f}
                  </li>
                ))}
              </ul>

              {p.limits.length > 0 && (
                <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                  {p.limits.map((l) => (
                    <li key={l} className="font-mono text-[11px] text-mute">
                      · {l}
                    </li>
                  ))}
                </ul>
              )}

              <Link
                to={p.id === "scale" ? "/contact" : "/signup"}
                className={
                  p.featured
                    ? "mt-6 block rounded-md bg-pink px-4 py-3 text-center font-medium text-ink transition-colors hover:bg-white"
                    : "mt-6 block rounded-md border border-line px-4 py-3 text-center text-white transition-colors hover:bg-panel"
                }
              >
                {p.cta}
              </Link>
            </Panel>
          ))}
        </section>

        <section className="border-t border-line py-14">
          <SectionHeading label="Comparison" title="Line by line" />
          <div className="mt-8 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-panel font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                <tr>
                  <th className="px-4 py-3">Capability</th>
                  <th className="px-4 py-3">Free</th>
                  <th className="px-4 py-3 text-pink">Pro</th>
                  <th className="px-4 py-3">Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {planMatrix.map((r) => (
                  <tr key={r.row}>
                    <td className="px-4 py-3.5 text-sm text-white">{r.row}</td>
                    <td className="px-4 py-3.5">
                      <Cell value={r.free} />
                    </td>
                    <td className="bg-pink/5 px-4 py-3.5">
                      <Cell value={r.pro} />
                    </td>
                    <td className="px-4 py-3.5">
                      <Cell value={r.scale} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-mono text-xs text-mute">
            Prices shown are indicative for this preview. Taxes calculated at checkout.
          </p>
        </section>

        <section className="border-t border-line py-14">
          <SectionHeading label="Priority" title="What best-effort versus priority means" />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Panel>
              <h3 className="font-display text-lg font-semibold">Free · best effort</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">
                Your requests run as soon as there is capacity. At quiet times that is immediate. At peak, free
                traffic waits behind paid traffic, and heavy best-tier jobs may sit in the queue for a few minutes.
              </p>
            </Panel>
            <Panel accent>
              <h3 className="font-display text-lg font-semibold">Paid · priority</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                Paid requests jump the queue and get higher concurrency, so a backtest and a build can run at the
                same time. Scale additionally reserves best-tier capacity so nothing waits.
              </p>
            </Panel>
          </div>
        </section>

        <section className="border-t border-line py-14">
          <SectionHeading label="Questions" title="Billing questions people ask first" />
          <div className="mt-8 divide-y divide-line rounded-lg border border-line">
            {faqs.slice(0, 4).map((f) => (
              <div key={f.q} className="p-5">
                <h3 className="font-display text-base font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fog">{f.a}</p>
              </div>
            ))}
          </div>
          <Link to="/support" className="mt-6 inline-block font-mono text-sm text-pink hover:underline">
            More answers in the help centre →
          </Link>
        </section>
      </div>
      <CtaBand />
    </SiteLayout>
  );
}
