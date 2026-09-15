import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/app/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notification preferences | PINK workspace" },
      { name: "description", content: "Choose when PINK emails or pushes you about tasks, quota and connectors." },
      { property: "og:title", content: "PINK notification preferences" },
      { property: "og:description", content: "Task completion, failures, quota warnings and connector health alerts." },
    ],
  }),
  component: Notifications,
});

const groups = [
  {
    title: "Background tasks",
    items: [
      { label: "Task completed", detail: "When a background task finishes successfully", on: true },
      { label: "Task failed", detail: "Immediately, with the error and a retry link", on: true },
      { label: "Task queued longer than 5 minutes", detail: "Usually a priority or connector issue", on: false },
    ],
  },
  {
    title: "Usage and billing",
    items: [
      { label: "80% of quota reached", detail: "Early warning before requests start queueing", on: true },
      { label: "Quota exhausted", detail: "When new requests can no longer be served", on: true },
      { label: "Invoice available", detail: "Monthly receipt to your billing email", on: true },
    ],
  },
  {
    title: "Connectors",
    items: [
      { label: "Connection degraded", detail: "Stale token, dropped bridge or revoked scope", on: true },
      { label: "New scope requested", detail: "When the agent needs a permission it doesn't have", on: true },
      { label: "New connector available", detail: "Product news about new integrations", on: false },
    ],
  },
];

function Notifications() {
  return (
    <>
      <PageHeader
        title="Notifications"
        copy="Everything is off by default except the things you would regret missing."
      />
      <div className="grid gap-4 p-4 lg:max-w-4xl lg:p-8">
        {groups.map((g) => (
          <Panel key={g.title}>
            <h2 className="font-display text-lg font-semibold">{g.title}</h2>
            <ul className="mt-4 divide-y divide-line">
              {g.items.map((i) => (
                <li key={i.label} className="flex items-center gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm text-white">{i.label}</p>
                    <p className="font-mono text-[11px] text-mute">{i.detail}</p>
                  </div>
                  <Switch
                    defaultChecked={i.on}
                    aria-label={i.label}
                    className="ml-auto"
                    onCheckedChange={(v) => toast(v ? `On · ${i.label}` : `Off · ${i.label}`)}
                  />
                </li>
              ))}
            </ul>
          </Panel>
        ))}

        <Panel>
          <h2 className="font-display text-lg font-semibold">Delivery</h2>
          <ul className="mt-4 divide-y divide-line">
            {[
              ["Email", "avery@acmelabs.io", true],
              ["In-app", "Shown in the activity indicator", true],
              ["Slack", "Via the Zapier connector", false],
            ].map(([label, detail, on]) => (
              <li key={label as string} className="flex items-center gap-4 py-3.5">
                <div>
                  <p className="text-sm text-white">{label}</p>
                  <p className="font-mono text-[11px] text-mute">{detail}</p>
                </div>
                <Switch
                  defaultChecked={on as boolean}
                  aria-label={label as string}
                  className="ml-auto"
                  onCheckedChange={() => toast("Delivery preference saved")}
                />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
