import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, CtaBand } from "@/components/site/site-layout";
import {
  ActivityBars,
  ConnectorChip,
  Eyebrow,
  Meter,
  Panel,
  SectionHeading,
} from "@/components/pink/primitives";
import { marketingConnectors as connectors, plans } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PINK — the AI agent that gets things done across your stack" },
      {
        name: "description",
        content:
          "PINK routes every request to the right AI model tier and acts inside MT5, GitHub, Linear, HubSpot, Xero, Zapier and Lovable — including long jobs that run in the background.",
      },
      { property: "og:title", content: "PINK — agentic AI that acts inside your tools" },
      {
        property: "og:description",
        content:
          "Tiered model routing, seven MCP connectors and background task execution in one continuous workspace.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-6">
        <section className="grid items-center gap-12 py-16 lg:grid-cols-[1fr_1.05fr] lg:py-20">
          <div>
            <Eyebrow>AGENT ONLINE · 3 CONNECTORS LIVE</Eyebrow>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight lg:text-6xl">
              The AI agent that <span className="text-pink">gets things done</span> across your stack.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-fog">
              PINK routes every request to the right model tier and acts inside the tools you already run — MT5,
              GitHub, Xero, HubSpot and more — so work keeps moving even in the background.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="rounded-md bg-pink px-5 py-3 font-medium text-ink transition-colors hover:bg-white"
              >
                Start building free
              </Link>
              <Link
                to="/how-it-works"
                className="rounded-md border border-line px-5 py-3 text-white transition-colors hover:bg-panel"
              >
                See it in action
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 font-mono text-xs text-mute">
              <span>7 MCP connectors</span>
              <span className="h-3 w-px bg-line" />
              <span>3 model tiers</span>
              <span className="h-3 w-px bg-line" />
              <span>No credit card</span>
            </div>
          </div>

          <div className="console-shadow overflow-hidden rounded-xl border border-line bg-ink2">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-line" />
                <span className="size-2.5 rounded-full bg-line" />
                <span className="size-2.5 rounded-full bg-line" />
              </div>
              <span className="font-mono text-xs text-mute">pink://agent/run</span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-2.5 py-1 font-mono text-[11px] text-mint">
                <span className="size-1.5 rounded-full bg-mint pulse-dot" /> LIVE
              </span>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-panel font-mono text-[11px] text-fog">
                  YOU
                </span>
                <p className="text-sm leading-relaxed text-white/90">
                  Backtest my mean-reversion EA on EURUSD M15 and open a Linear ticket with the results.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-pink font-mono text-[11px] font-semibold text-ink">
                  P
                </span>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-white/90">
                    Routing to <span className="font-mono text-violet">best</span> tier for strategy reasoning
                    <span className="text-mute">…</span>
                  </p>
                  <div className="space-y-2">
                    {[
                      ["mt5 · load strategy", "eurusd_ma.mq5"],
                      ["mt5 · run backtest", "2023-01 → 2024-06"],
                      ["linear · create issue", "STRAT-482"],
                    ].map(([action, detail]) => (
                      <div key={action} className="flex items-center gap-2 font-mono text-xs text-fog">
                        <span className="size-1.5 rounded-full bg-mint" /> {action}{" "}
                        <span className="text-mute">{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-violet/30 bg-violet/5 p-3">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-violet pulse-dot" />
                      <span className="text-xs font-medium text-white">Backtest running in background</span>
                      <span className="ml-auto font-mono text-[11px] text-violet">Tier: best</span>
                    </div>
                    <div className="mt-2.5">
                      <Meter value={66} tone="violet" />
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="font-mono text-[11px] text-mute">EST. 2M 40S</span>
                      <Link
                        to="/app/tasks/$taskId"
                        params={{ taskId: "TSK-1421" }}
                        className="ml-auto font-mono text-[11px] text-violet hover:underline"
                      >
                        View task →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-line bg-panel/50 px-5 py-3">
              <ActivityBars className="h-5" />
              <span className="font-mono text-xs text-mint">2 tasks running</span>
              <span className="font-mono text-xs text-mute">1 queued</span>
              <Link to="/app/tasks" className="ml-auto font-mono text-xs text-fog hover:text-white">
                All tasks →
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-line py-12">
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-mute">
            Acts inside the tools you already use
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-sm text-fog">
            {connectors.map((c, i) => (
              <span key={c.id} className="flex items-center gap-8">
                <Link to="/use-cases" className="hover:text-white">
                  {c.name}
                </Link>
                {i < connectors.length - 1 && <span className="text-line">•</span>}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-4 pb-20 lg:grid-cols-3">
          <Panel>
            <span className="font-mono text-xs text-mint">TIER 1</span>
            <h3 className="mt-2 font-display text-lg font-semibold">Small / Fast</h3>
            <p className="mt-2 text-sm leading-relaxed text-fog">
              Routinely quick tasks — triage, drafting, lookups — handled cheaply and instantly.
            </p>
          </Panel>
          <Panel>
            <span className="font-mono text-xs text-amber">TIER 2</span>
            <h3 className="mt-2 font-display text-lg font-semibold">Medium / Balanced</h3>
            <p className="mt-2 text-sm leading-relaxed text-fog">
              Multi-step workflows that need solid reasoning without the top-shelf cost.
            </p>
          </Panel>
          <Panel accent>
            <span className="font-mono text-xs text-pink">TIER 3</span>
            <h3 className="mt-2 font-display text-lg font-semibold">Best / Deep</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              High-stakes work — strategy backtests, complex builds, financial moves — routed to the strongest model.
            </p>
          </Panel>
        </section>

        <section className="border-t border-line py-16">
          <SectionHeading
            label="Background execution"
            title="Long work doesn't hold you hostage."
            copy="A backtest takes minutes. A build takes longer. PINK runs them server-side, keeps a live reference inside the conversation that started them, and shows the count in your shell wherever you are."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              {
                t: "Started from chat",
                d: "The agent decides a job is slow, dispatches it, and the conversation keeps a live task card with tier, progress and elapsed time.",
              },
              {
                t: "Visible everywhere",
                d: "The shell carries a persistent activity indicator. Two tasks running is never something you have to go looking for.",
              },
              {
                t: "Fully accountable",
                d: "Every task keeps its log, the tier that handled it, the connector calls it made, and retry or cancel controls.",
              },
            ].map((c) => (
              <Panel key={c.t}>
                <h3 className="font-display text-lg font-semibold">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fog">{c.d}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="border-t border-line py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              label="Pricing"
              title="Start free. Pay when priority matters."
              copy="Free requests are served best-effort. Paid plans get priority processing and unmetered access to the best tier."
            />
            <Link
              to="/pricing"
              className="font-mono text-sm text-pink hover:underline lg:ml-auto lg:pb-2"
            >
              Full plan comparison →
            </Link>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((p) => (
              <Panel key={p.id} accent={!!p.featured}>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  {p.featured && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-pink">popular</span>
                  )}
                </div>
                <p className="mt-3 font-display text-3xl font-semibold">{p.price}</p>
                <p className="font-mono text-xs text-mute">{p.cadence}</p>
                <p className="mt-4 text-sm text-fog">{p.quota}</p>
                <p className="mt-1 font-mono text-xs text-fog">{p.priority}</p>
                <Link
                  to="/signup"
                  className={
                    p.featured
                      ? "mt-5 block rounded-md bg-pink px-4 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:bg-white"
                      : "mt-5 block rounded-md border border-line px-4 py-2.5 text-center text-sm text-white transition-colors hover:bg-panel"
                  }
                >
                  {p.cta}
                </Link>
              </Panel>
            ))}
          </div>
        </section>

        <section className="border-t border-line py-16">
          <SectionHeading
            label="Trust"
            title="Real actions, on a short leash."
            copy="The agent touches trading terminals, source code and financial records. Every connector is scope-by-scope, write access is opt-in, and nothing is granted silently."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {connectors.map((c) => (
              <ConnectorChip key={c.id} id={c.id} />
            ))}
          </div>
        </section>
      </div>
      <CtaBand />
    </SiteLayout>
  );
}
