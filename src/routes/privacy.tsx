import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/site-layout";
import { Panel } from "@/components/pink/primitives";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | PINK" },
      {
        name: "description",
        content:
          "How PINK collects, uses, stores and protects your data — including prompts, connector tokens, task logs and model-provider processing.",
      },
      { property: "og:title", content: "PINK Privacy Policy" },
      { property: "og:description", content: "Data handling, connector tokens, retention and your rights." },
    ],
  }),
  component: Privacy,
});

const sections = [
  {
    h: "What we collect",
    p: "Account details (name, email, organisation), workspace configuration, conversation content and prompts, task logs, connector metadata and OAuth tokens, billing records, and technical logs such as IP address and user agent.",
  },
  {
    h: "How we use it",
    p: "To route and execute your requests, call the connectors you authorised, show you history and usage, bill your plan, detect abuse, and improve reliability. We do not sell personal data.",
  },
  {
    h: "Model providers",
    p: "Requests are dispatched to third-party model providers according to tier. Only the content required to fulfil the request is sent. We use providers under agreements that prohibit training on your content.",
  },
  {
    h: "Connector tokens",
    p: "OAuth tokens and bridge credentials are encrypted at rest with per-workspace keys, are never included in model context, and are used solely to perform actions you requested within the scopes you granted.",
  },
  {
    h: "Sensitive categories",
    p: "Trading accounts, source code and accounting records receive read-first defaults. Write and order-placement scopes are off until you enable them explicitly, and every use is recorded in the task log.",
  },
  {
    h: "Retention",
    p: "Conversations and task logs follow your plan's history window (7 days on Free, 90 days on Pro, unlimited on Scale). Deleted workspaces are purged within 30 days, backups within 90.",
  },
  {
    h: "Your rights",
    p: "You can access, export, correct or delete your data from account settings, or by writing to privacy@pink.dev. Depending on where you live you may also have rights to object or restrict processing.",
  },
  {
    h: "Sub-processors",
    p: "We use cloud hosting, model inference, payment and email providers. A current list with locations is available on request and updated before any material change.",
  },
  {
    h: "Security",
    p: "Encryption in transit and at rest, least-privilege internal access, audited administrative actions, and independent penetration testing at least annually.",
  },
  {
    h: "International transfers",
    p: "Data may be processed in Australia, the European Union and the United States under standard contractual clauses or equivalent safeguards.",
  },
];

function Privacy() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        copy="Last updated 12 March 2026. This is a preview document for a demonstration workspace and is not legal advice."
      />
      <div className="mx-auto max-w-3xl px-6 py-14">
        <Panel accent>
          <p className="text-sm leading-relaxed text-white/90">
            Short version: we store what is needed to run the agent for you, we encrypt connector credentials and keep
            them out of model context, we do not sell your data, and write access to your tools stays off until you
            turn it on.
          </p>
        </Panel>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-xl font-semibold">{s.h}</h2>
              <p className="mt-3 leading-relaxed text-fog">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 border-t border-line pt-6 font-mono text-xs text-mute">
          Privacy enquiries: privacy@pink.dev · Security disclosures: security@pink.dev
        </p>
      </div>
    </SiteLayout>
  );
}
