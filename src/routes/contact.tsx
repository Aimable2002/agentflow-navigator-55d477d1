import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHero, SiteLayout } from "@/components/site/site-layout";
import { Panel } from "@/components/pink/primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the PINK team" },
      {
        name: "description",
        content:
          "Talk to PINK about sales, Scale plans, connector requests or support. Tell us what you want the agent to do and we will tell you whether it can.",
      },
      { property: "og:title", content: "Contact PINK" },
      { property: "og:description", content: "Sales, support, security and connector requests." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Tell us what you want the agent <span className="text-pink">to do</span>.
          </>
        }
        copy="The most useful message you can send us is the actual job — the strategy, the workflow, the reconciliation. We will tell you honestly whether PINK handles it today."
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.2fr_1fr]">
        <Panel>
          {sent ? (
            <div className="py-10 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-mint">Message received</p>
              <h2 className="mt-4 font-display text-2xl font-semibold">Thanks — we'll reply shortly.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-fog">
                A human reads every message. If it was a Scale enquiry we usually come back the same day with a short
                call invite.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-6 rounded-md border border-line px-4 py-2 text-sm text-white hover:bg-panel"
              >
                Send another
              </button>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                toast.success("Message sent", { description: "We'll be in touch by email." });
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required placeholder="Avery Lane" className="bg-ink2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" type="email" required placeholder="avery@company.com" className="bg-ink2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">What is this about?</Label>
                <Select defaultValue="sales">
                  <SelectTrigger id="topic" className="bg-ink2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Plans and pricing</SelectItem>
                    <SelectItem value="support">Support with my account</SelectItem>
                    <SelectItem value="connector">Request a connector</SelectItem>
                    <SelectItem value="security">Security or compliance</SelectItem>
                    <SelectItem value="other">Something else</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">The job you want done</Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  placeholder="e.g. Every Monday, reconcile Xero, summarise the pipeline from HubSpot and post the digest to Slack."
                  className="bg-ink2"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-pink px-5 py-3 font-medium text-ink transition-colors hover:bg-white"
              >
                Send message
              </button>
              <p className="font-mono text-[11px] text-mute">
                We reply from a real address. No sequences, no drip campaign.
              </p>
            </form>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Direct</p>
            <ul className="mt-3 space-y-2 text-sm text-fog">
              <li>
                Sales · <span className="text-white">sales@pink.dev</span>
              </li>
              <li>
                Support · <span className="text-white">support@pink.dev</span>
              </li>
              <li>
                Security · <span className="text-white">security@pink.dev</span>
              </li>
            </ul>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Offices</p>
            <p className="mt-3 text-sm text-fog">
              Level 4, 118 Flinders Lane
              <br />
              Melbourne VIC 3000, Australia
            </p>
            <p className="mt-3 text-sm text-fog">
              22 Rue de la Boétie
              <br />
              75008 Paris, France
            </p>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Response times</p>
            <p className="mt-3 text-sm text-fog">
              Sales enquiries same business day. Support follows your plan: 1 business day on Pro, 4 hours on Scale.
            </p>
          </Panel>
        </div>
      </div>
    </SiteLayout>
  );
}
