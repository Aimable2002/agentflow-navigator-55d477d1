import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero, SiteLayout } from "@/components/site/site-layout";
import { Panel, SectionHeading, TierBadge } from "@/components/pink/primitives";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — tiered routing, MCP connectors, background tasks | PINK" },
      {
        name: "description",
        content:
          "The three capabilities behind PINK: automatic model-tier routing, MCP connectors into real tools, and background agent tasks with full logs.",
      },
      { property: "og:title", content: "PINK features — routing, connectors, background execution" },
      {
        property: "og:description",
        content: "Automatic cost-quality routing, seven connectors and accountable long-running agent work.",
      },
    ],
  }),
  component: FeaturesPage,
});

const capabilities = [
  {
    label: "01 · Routing",
    title: "Tiered model routing",
    copy: "Every request is graded before it runs, then dispatched to the cheapest tier that can do the job properly. You stop paying frontier prices for a one-line lookup, and you stop getting a small model on work that deserves better.",
    bullets: [
      "Complexity, risk and step-count scoring per request",
      "Automatic escalation when a mid-tier run stalls",
      "Manual tier pinning per conversation or message",
      "Per-tier usage and cost visible in the dashboard",
    ],
  },
  {
    label: "02 · Connectors",
    title: "MCP connectors that take action",
    copy: "PINK speaks Model Context Protocol, so tools are exposed to the agent through one consistent interface. It reads and writes in the tools you already run instead of describing what you should do next.",
    bullets: [
      "MT5, GitHub, Linear, HubSpot, Xero, Zapier and Lovable",
      "Scope-by-scope permissions with write access opt-in",
      "Connection health and last-sync per connector",
      "Zapier as a bridge to thousands of further apps",
    ],
  },
  {
    label: "03 · Execution",
    title: "Background agent tasks",
    copy: "Serious work takes time. Tasks run server-side with queue, progress and log streams, and stay tied to the conversation that started them so you never lose the thread.",
    bullets: [
      "Queued, running, completed and failed states",
      "Retry a failed task, cancel a running one",
      "Full log with the connector calls it made",
      "Persistent activity indicator across the whole app",
    ],
  },
];

function FeaturesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Platform"
        title={
          <>
            Three capabilities, one <span className="text-pink">continuous</span> workspace.
          </>
        }
        copy="Routing decides how the work gets done. Connectors decide where. Background execution makes sure long jobs finish without you babysitting them."
      />

      <div className="mx-auto max-w-7xl px-6">
        {capabilities.map((c) => (
          <section key={c.title} className="grid gap-10 border-b border-line py-16 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-pink">{c.label}</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">{c.title}</h2>
              <p className="mt-4 max-w-lg leading-relaxed text-fog">{c.copy}</p>
            </div>
            <Panel className="self-start">
              <ul className="space-y-3">
                {c.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-fog">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pink" />
                    {b}
                  </li>
                ))}
              </ul>
            </Panel>
          </section>
        ))}

        <section className="py-16">
          <SectionHeading
            label="Tier reference"
            title="What lands where"
            copy="Routing is automatic, but it is not a black box — every message and every task records the tier that handled it."
          />
          <div className="mt-10 overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-panel font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                <tr>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Typical work</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Relative cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="px-4 py-4">
                    <TierBadge tier="small" />
                  </td>
                  <td className="px-4 py-4 text-fog">Classification, extraction, lookups, transaction coding</td>
                  <td className="px-4 py-4 font-mono text-xs text-fog">under 2s</td>
                  <td className="px-4 py-4 font-mono text-xs text-fog">1×</td>
                </tr>
                <tr>
                  <td className="px-4 py-4">
                    <TierBadge tier="medium" />
                  </td>
                  <td className="px-4 py-4 text-fog">Multi-step tool workflows, code fixes, CRM hygiene, builds</td>
                  <td className="px-4 py-4 font-mono text-xs text-fog">2–10s per step</td>
                  <td className="px-4 py-4 font-mono text-xs text-fog">6×</td>
                </tr>
                <tr>
                  <td className="px-4 py-4">
                    <TierBadge tier="best" />
                  </td>
                  <td className="px-4 py-4 text-fog">Strategy design, ambiguous debugging, financial judgement</td>
                  <td className="px-4 py-4 font-mono text-xs text-fog">deliberate</td>
                  <td className="px-4 py-4 font-mono text-xs text-fog">30×</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-mono text-xs text-mute">
            Relative cost is indicative. See{" "}
            <Link to="/pricing" className="text-pink hover:underline">
              pricing
            </Link>{" "}
            for plan quotas.
          </p>
        </section>
      </div>
      <CtaBand />
    </SiteLayout>
  );
}
