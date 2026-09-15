import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero, SiteLayout } from "@/components/site/site-layout";
import { Panel, SectionHeading } from "@/components/pink/primitives";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PINK — an agent that is accountable for its actions" },
      {
        name: "description",
        content:
          "Why PINK exists: cost-aware model routing, real tool access through MCP, and an interface where you can always see what the agent did.",
      },
      { property: "og:title", content: "About PINK" },
      {
        property: "og:description",
        content: "The principles behind an agent platform trusted with trading, code and financial data.",
      },
    ],
  }),
  component: About,
});

const principles = [
  {
    t: "Cheap by default, strong when it counts",
    d: "Frontier models on every request is a waste. A weak model on the hard request is worse. Grading each request is the only honest answer, and we show you which tier ran.",
  },
  {
    t: "An agent that acts, not advises",
    d: "Advice is easy to generate and hard to use. Everything we build is aimed at the agent finishing the job inside the tools where the work actually lives.",
  },
  {
    t: "Nothing happens invisibly",
    d: "Scopes are explicit, actions are logged, and every background task keeps its full trail. If the agent touched your books or your repo, you can see exactly how.",
  },
  {
    t: "One surface, not a pile of pages",
    d: "Chat, background execution and configuration belong to the same continuous experience. Losing your place is a product bug.",
  },
];

function About() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About"
        title={
          <>
            Built for people who hand an agent <span className="text-pink">real</span> work.
          </>
        }
        copy="PINK started from a simple frustration: capable models, and almost no way to let them safely finish a job in the systems that matter. So we built the routing, the connectors and the accountability in one place."
      />

      <div className="mx-auto max-w-7xl px-6">
        <section className="grid gap-4 border-b border-line py-14 lg:grid-cols-2">
          {principles.map((p) => (
            <Panel key={p.t}>
              <h2 className="font-display text-lg font-semibold">{p.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-fog">{p.d}</p>
            </Panel>
          ))}
        </section>

        <section className="grid gap-10 border-b border-line py-14 lg:grid-cols-[1fr_1fr]">
          <SectionHeading
            label="Who we are"
            title="A small team from trading floors and developer tools."
            copy="We have shipped execution systems where a wrong number costs money, and developer platforms where trust is earned one boring, correct release at a time. Both experiences shaped how conservative PINK is with write access."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { k: "2024", v: "Founded" },
              { k: "11", v: "People" },
              { k: "7", v: "Connectors live" },
              { k: "3", v: "Model tiers" },
              { k: "1.4M", v: "Tasks executed" },
              { k: "99.95%", v: "Task delivery" },
            ].map((s) => (
              <div key={s.v} className="rounded-lg border border-line bg-panel p-4">
                <p className="font-display text-2xl font-semibold">{s.k}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">{s.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-14">
          <SectionHeading label="Talk to us" title="We answer our own support." />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="rounded-md bg-pink px-5 py-3 font-medium text-ink transition-colors hover:bg-white"
            >
              Contact the team
            </Link>
            <Link
              to="/support"
              className="rounded-md border border-line px-5 py-3 text-white transition-colors hover:bg-panel"
            >
              Help centre
            </Link>
          </div>
        </section>
      </div>
      <CtaBand />
    </SiteLayout>
  );
}
