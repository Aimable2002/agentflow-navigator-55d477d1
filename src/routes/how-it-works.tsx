import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero, SiteLayout } from "@/components/site/site-layout";
import { Panel, SectionHeading, TierBadge } from "@/components/pink/primitives";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — model tiers and connected tools explained | PINK" },
      {
        name: "description",
        content:
          "A plain-language walkthrough of how PINK grades a request, picks a model tier, calls your connected tools and runs long jobs in the background.",
      },
      { property: "og:title", content: "How PINK works, without the jargon" },
      {
        property: "og:description",
        content: "Ask, grade, route, act, report — the five steps behind every agent request.",
      },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    n: "01",
    t: "You describe an outcome",
    d: "Not a prompt recipe, not a series of clicks. “Reconcile February and tell me what needs a decision” is a complete instruction here.",
  },
  {
    n: "02",
    t: "The request is graded",
    d: "A small, fast model reads the request together with the conversation and the tools in scope, then scores how hard and how consequential it is.",
  },
  {
    n: "03",
    t: "It is routed to a tier",
    d: "Easy work goes to a small model. Ordinary multi-step work goes to a middle one. Work where being wrong is expensive goes to the best available model.",
  },
  {
    n: "04",
    t: "The agent uses your tools",
    d: "Through MCP connectors it reads and writes in MT5, GitHub, Linear, HubSpot, Xero, Zapier or Lovable — only within the scopes you granted.",
  },
  {
    n: "05",
    t: "Slow work moves to the background",
    d: "Anything that takes minutes becomes a task. You get told when it finishes; the conversation keeps a live card in the meantime.",
  },
];

function HowItWorks() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="How it works"
        title={
          <>
            Ask for the result. PINK works out <span className="text-pink">how</span>.
          </>
        }
        copy="You do not need to know which model to use or which API to call. That is the entire point of the platform — and this page explains what happens between your sentence and the finished work."
      />

      <div className="mx-auto max-w-7xl px-6">
        <section className="border-b border-line py-16">
          <ol className="space-y-4">
            {steps.map((s) => (
              <li key={s.n} className="grid gap-4 rounded-lg border border-line bg-panel p-6 lg:grid-cols-[6rem_1fr]">
                <span className="font-mono text-3xl text-line">{s.n}</span>
                <div>
                  <h2 className="font-display text-xl font-semibold">{s.t}</h2>
                  <p className="mt-2 max-w-2xl leading-relaxed text-fog">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-b border-line py-16">
          <SectionHeading
            label="Analogy"
            title="Think of a workshop, not a genius."
            copy="A good workshop does not hand every job to its most expensive specialist. It sorts the work first."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <Panel>
              <TierBadge tier="small" />
              <h3 className="mt-3 font-display text-lg font-semibold">The apprentice</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">
                Sorts the post, labels the parts, answers the obvious question. Fast and cheap, and completely
                adequate for most of the day.
              </p>
            </Panel>
            <Panel>
              <TierBadge tier="medium" />
              <h3 className="mt-3 font-display text-lg font-semibold">The technician</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">
                Handles the standard jobs end to end — several steps, real tools, dependable results.
              </p>
            </Panel>
            <Panel accent>
              <TierBadge tier="best" />
              <h3 className="mt-3 font-display text-lg font-semibold">The specialist</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                Called in when the job is genuinely hard or the cost of being wrong is high. Expensive, so used
                deliberately.
              </p>
            </Panel>
          </div>
        </section>

        <section className="grid gap-10 py-16 lg:grid-cols-2">
          <div>
            <SectionHeading
              label="Connected tools"
              title="What “connected” actually means"
              copy="A connector is an authorised link between PINK and one of your accounts. It has an explicit list of permissions — read this, write that — and you decide which are on."
            />
            <ul className="mt-8 space-y-3 text-sm text-fog">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pink" />
                Read-only by default; writing needs an explicit grant.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pink" />
                Live trading and payment actions are always separate, opt-in scopes.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pink" />
                Every action the agent takes is logged against a task you can open.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pink" />
                Revoke a connector at any time; running tasks stop with it.
              </li>
            </ul>
          </div>
          <Panel className="self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Worked example</p>
            <div className="mt-4 space-y-4 font-mono text-xs">
              <p className="text-white/90">→ “Reconcile February and file the exceptions.”</p>
              <p className="text-fog">graded: routine classification, low risk</p>
              <p className="text-mint">routed: small tier</p>
              <p className="text-fog">xero · read 412 transactions</p>
              <p className="text-fog">xero · apply account codes</p>
              <p className="text-fog">linear · create issue FIN-118 (6 exceptions)</p>
              <p className="text-mint">done in 1m 22s · $0.004</p>
            </div>
            <Link to="/docs/$slug" params={{ slug: "model-routing" }} className="mt-6 inline-block font-mono text-xs text-pink hover:underline">
              Read the routing docs →
            </Link>
          </Panel>
        </section>
      </div>
      <CtaBand />
    </SiteLayout>
  );
}
