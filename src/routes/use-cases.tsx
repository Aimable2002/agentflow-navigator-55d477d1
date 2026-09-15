import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero, SiteLayout } from "@/components/site/site-layout";
import { Panel } from "@/components/pink/primitives";
import { marketingConnectors as connectors } from "@/lib/content";

export const Route = createFileRoute("/use-cases")({
  head: () => ({
    meta: [
      { title: "Use cases — MT5, GitHub, Linear, HubSpot, Xero, Zapier, Lovable | PINK" },
      {
        name: "description",
        content:
          "What PINK can actually do in each connected tool: backtest trading strategies, ship pull requests, file issues, keep the CRM clean, reconcile the books and build apps.",
      },
      { property: "og:title", content: "PINK use cases across seven connected tools" },
      {
        property: "og:description",
        content: "Concrete work the agent performs in MT5, GitHub, Linear, HubSpot, Xero, Zapier and Lovable.",
      },
    ],
  }),
  component: UseCases,
});

const personas = [
  {
    who: "Traders and quants",
    tools: "MT5 · Linear",
    story:
      "Describe a strategy in plain English, get a compiled EA, a backtest across the range you care about, and a tracking issue with the numbers — without opening MetaEditor.",
  },
  {
    who: "Engineering teams",
    tools: "GitHub · Linear · Lovable",
    story:
      "Point the agent at a red CI job or a stale issue. It reads the logs, opens a branch, raises a pull request and reports back with the diff summary.",
  },
  {
    who: "Operators and founders",
    tools: "HubSpot · Xero · Zapier",
    story:
      "Ask for pipeline health, reconcile the month, chase overdue invoices and push the digest into Slack — one conversation instead of four dashboards.",
  },
];

function UseCases() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Use cases"
        title={
          <>
            Seven connectors. <span className="text-pink">Real</span> work in each.
          </>
        }
        copy="Every connector below is a set of actions the agent can take on your behalf, not a logo on a wall. Grant the scopes you're comfortable with and it works within them."
      />

      <div className="mx-auto max-w-7xl px-6">
        <section className="grid gap-4 border-b border-line py-14 lg:grid-cols-3">
          {personas.map((p) => (
            <Panel key={p.who}>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-pink">{p.tools}</p>
              <h3 className="mt-3 font-display text-lg font-semibold">{p.who}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">{p.story}</p>
            </Panel>
          ))}
        </section>

        <section className="space-y-4 py-14">
          {connectors.map((c) => (
            <div key={c.id} className="grid gap-6 rounded-lg border border-line bg-panel p-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-md border border-line bg-ink2 font-mono text-xs text-fog">
                    {c.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">{c.name}</h2>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">{c.category}</p>
                  </div>
                  <span className="ml-auto font-mono text-[11px] text-mint">● available</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-fog">{c.description}</p>
                <Link
                  to="/docs/$slug"
                  params={{ slug: c.id === "mt5" ? "connect-mt5" : c.id === "github" ? "connect-github" : "connect-business-tools" }}
                  className="mt-4 inline-block font-mono text-xs text-pink hover:underline"
                >
                  Setup guide →
                </Link>
              </div>
              <div className="rounded-lg border border-line bg-ink2 p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Things people ask for</p>
                <ul className="mt-4 space-y-3">
                  {c.actions.map((a) => (
                    <li key={a} className="flex gap-3 text-sm text-white/90">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-mint" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>
      </div>
      <CtaBand />
    </SiteLayout>
  );
}
