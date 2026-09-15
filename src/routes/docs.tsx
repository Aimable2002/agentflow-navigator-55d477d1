import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/site-layout";
import { Panel, SectionHeading } from "@/components/pink/primitives";
import { docSections } from "@/lib/content";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — getting started and connector guides | PINK" },
      {
        name: "description",
        content:
          "PINK documentation: create a workspace, connect MT5, GitHub, HubSpot, Xero and Zapier, understand model routing, and drive the agent through the API.",
      },
      { property: "og:title", content: "PINK documentation" },
      { property: "og:description", content: "Getting started, connector setup guides, routing and API access." },
    ],
  }),
  component: Docs,
});

function Docs() {
  const start = docSections[0]!;
  const rest = docSections.slice(1);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Documentation"
        title={
          <>
            Everything from first login to <span className="text-pink">API</span> access.
          </>
        }
        copy="Short guides, written for both the developer wiring up MT5 and the operator connecting Xero for the first time."
      />

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Panel accent className="self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-pink">Start here</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">{start.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90">{start.summary}</p>
            <p className="mt-4 font-mono text-[11px] text-mute">{start.reading} read</p>
            <Link
              to="/docs/$slug"
              params={{ slug: start.slug }}
              className="mt-6 inline-block rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
            >
              Read the guide
            </Link>
          </Panel>

          <div className="space-y-3">
            {rest.map((d) => (
              <Link
                key={d.slug}
                to="/docs/$slug"
                params={{ slug: d.slug }}
                className="block rounded-lg border border-line bg-panel p-5 transition-colors hover:border-pink/40"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-lg font-semibold">{d.title}</h3>
                  <span className="ml-auto font-mono text-[11px] text-mute">{d.reading}</span>
                </div>
                <p className="mt-2 text-sm text-fog">{d.summary}</p>
              </Link>
            ))}
          </div>
        </div>

        <section className="mt-16 border-t border-line pt-14">
          <SectionHeading
            label="Reference"
            title="Quick reference"
            copy="The three things people look up most often."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Panel>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Tier names</p>
              <pre className="mt-3 overflow-x-auto font-mono text-xs text-fog">{`small   // fast, cheap
medium  // balanced default
best    // deep reasoning`}</pre>
            </Panel>
            <Panel>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Start a run</p>
              <pre className="mt-3 overflow-x-auto font-mono text-xs text-fog">{`POST /v1/runs
{
  "prompt": "Backtest…",
  "tier": "auto",
  "connectors": ["mt5"]
}`}</pre>
            </Panel>
            <Panel>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Task states</p>
              <pre className="mt-3 overflow-x-auto font-mono text-xs text-fog">{`queued → running
running → completed
running → failed (retryable)`}</pre>
            </Panel>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
