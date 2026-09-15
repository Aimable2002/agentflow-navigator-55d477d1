import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, LifeBuoy, MessageCircle, ShieldCheck } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/site-layout";
import { Panel, SectionHeading } from "@/components/pink/primitives";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/lib/content";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support & help centre | PINK" },
      {
        name: "description",
        content:
          "Answers about model routing, connector permissions, background tasks, quotas and priority — plus how to reach the PINK team.",
      },
      { property: "og:title", content: "PINK help centre" },
      { property: "og:description", content: "FAQ, status, security contact and support paths for PINK." },
    ],
  }),
  component: Support,
});

const paths = [
  {
    icon: BookOpen,
    t: "Documentation",
    d: "Setup guides for every connector, routing behaviour and API access.",
    to: "/docs" as const,
    cta: "Open docs",
  },
  {
    icon: MessageCircle,
    t: "Contact support",
    d: "Free plans get community support. Pro is 1 business day, Scale 4 hours.",
    to: "/contact" as const,
    cta: "Send a message",
  },
  {
    icon: ShieldCheck,
    t: "Security & scopes",
    d: "How connector permissions work and how to report a vulnerability.",
    to: "/privacy" as const,
    cta: "Read the policy",
  },
  {
    icon: LifeBuoy,
    t: "Task troubleshooting",
    d: "Why a task queued, stalled or failed, and when a retry is safe.",
    to: "/docs/$slug" as const,
    params: { slug: "background-tasks" },
    cta: "Task guide",
  },
];

function Support() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Support"
        title={
          <>
            Help centre — <span className="text-pink">answers</span> before tickets.
          </>
        }
        copy="Most questions are about routing, permissions or why a task is queued. Start here; a human is one click away if this doesn't cover it."
      />

      <div className="mx-auto max-w-7xl px-6">
        <section className="grid gap-4 border-b border-line py-14 sm:grid-cols-2 lg:grid-cols-4">
          {paths.map((p) => (
            <Panel key={p.t} className="flex flex-col">
              <p.icon className="size-5 text-pink" />
              <h2 className="mt-4 font-display text-base font-semibold">{p.t}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-fog">{p.d}</p>
              <Link
                to={p.to}
                params={p.params as never}
                className="mt-4 font-mono text-xs text-pink hover:underline"
              >
                {p.cta} →
              </Link>
            </Panel>
          ))}
        </section>

        <section className="border-b border-line py-14">
          <SectionHeading label="FAQ" title="Frequently asked" />
          <Accordion type="single" collapsible className="mt-8 divide-y divide-line rounded-lg border border-line">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`} className="border-none px-5">
                <AccordionTrigger className="text-left font-display text-base hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-fog">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="grid gap-4 py-14 lg:grid-cols-3">
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Platform status</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-mint">
              <span className="size-1.5 rounded-full bg-mint pulse-dot" /> All systems operational
            </p>
            <p className="mt-2 font-mono text-xs text-fog">Routing, connectors and task workers nominal.</p>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Response times</p>
            <ul className="mt-3 space-y-1.5 font-mono text-xs text-fog">
              <li>Free · community</li>
              <li>Pro · 1 business day</li>
              <li>Scale · 4 hours, shared Slack</li>
            </ul>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Security reports</p>
            <p className="mt-3 text-sm text-fog">
              Disclose privately to security@pink.dev. We acknowledge within one business day.
            </p>
          </Panel>
        </section>
      </div>
    </SiteLayout>
  );
}
