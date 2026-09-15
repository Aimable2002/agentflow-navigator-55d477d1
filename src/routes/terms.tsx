import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/site-layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | PINK" },
      {
        name: "description",
        content:
          "The terms governing use of the PINK agent platform: accounts, acceptable use, connected third-party tools, fees, liability and termination.",
      },
      { property: "og:title", content: "PINK Terms of Service" },
      { property: "og:description", content: "Accounts, acceptable use, connectors, fees and liability." },
    ],
  }),
  component: Terms,
});

const sections = [
  {
    h: "1. Agreement",
    p: "These terms form a binding agreement between you and PINK Labs Pty Ltd covering the PINK platform, its API and any connected tooling we provide. By creating an account you accept them on behalf of yourself and, where applicable, your organisation.",
  },
  {
    h: "2. Accounts",
    p: "You are responsible for the accuracy of your account details, for keeping credentials and API keys confidential, and for all activity performed under your workspace. Notify us promptly if you believe a key has been exposed.",
  },
  {
    h: "3. Acceptable use",
    p: "Do not use PINK to break the law, infringe rights, attack systems you do not control, or circumvent the rate limits and quotas of the platform or of a connected service. Automated resale of agent capacity requires written agreement.",
  },
  {
    h: "4. Connected third-party tools",
    p: "Connectors act on your instruction and within the scopes you grant. Your use of MT5, GitHub, Linear, HubSpot, Xero, Zapier, Lovable or any other connected service remains governed by that provider's own terms. You are responsible for the actions the agent performs in those systems under your authorisation.",
  },
  {
    h: "5. Trading and financial output",
    p: "Backtests, strategy code, reconciliations and financial summaries are informational. They are not financial, accounting, tax or investment advice, and past performance in a backtest does not indicate future results. Live order placement, where enabled, executes entirely at your own risk.",
  },
  {
    h: "6. Plans, quotas and fees",
    p: "Free workspaces are served on a best-effort basis and are subject to quota. Paid plans are billed in advance on a monthly or annual cycle, are non-refundable except where required by law, and may incur usage overage at the published rate. We will give notice before changing prices.",
  },
  {
    h: "7. Availability",
    p: "We aim for high availability but do not warrant uninterrupted service. Scheduled maintenance is announced where practicable. Background tasks interrupted by an incident may be retried without charge.",
  },
  {
    h: "8. Intellectual property",
    p: "You retain ownership of your content and of output generated for you. We retain ownership of the platform. You grant us the limited licence needed to operate the service, including processing your prompts and connector data to fulfil your requests.",
  },
  {
    h: "9. Confidentiality and data",
    p: "Each party will protect the other's confidential information. Our handling of personal data is described in the Privacy Policy, which forms part of these terms.",
  },
  {
    h: "10. Limitation of liability",
    p: "To the maximum extent permitted by law, neither party is liable for indirect or consequential loss, and our aggregate liability is limited to the fees you paid in the twelve months preceding the claim.",
  },
  {
    h: "11. Suspension and termination",
    p: "You may cancel at any time from billing settings. We may suspend a workspace for non-payment, security risk or breach of these terms, and will restore access once the cause is resolved where possible.",
  },
  {
    h: "12. Changes and governing law",
    p: "We may update these terms; material changes are notified by email at least 30 days in advance. The agreement is governed by the laws of Victoria, Australia.",
  },
];

function Terms() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        copy="Last updated 12 March 2026. This is a preview document for a demonstration workspace and is not legal advice."
      />
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-xl font-semibold">{s.h}</h2>
              <p className="mt-3 leading-relaxed text-fog">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 border-t border-line pt-6 font-mono text-xs text-mute">
          Questions about these terms: legal@pink.dev
        </p>
      </div>
    </SiteLayout>
  );
}
