import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CreditCard, Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { invoices, plans, usage } from "@/lib/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/billing")({
  head: () => ({
    meta: [
      { title: "Billing & subscription | PINK workspace" },
      { name: "description", content: "Change plan, manage your payment method and download past invoices." },
      { property: "og:title", content: "PINK billing" },
      { property: "og:description", content: "Plan selection, payment method and invoice history." },
    ],
  }),
  component: Billing,
});

function Billing() {
  return (
    <>
      <PageHeader
        title="Billing"
        copy={`You are on the ${usage.plan} plan. Renews ${usage.renewsOn}.`}
        actions={
          <Link
            to="/app/usage"
            className="rounded-md border border-line px-4 py-2.5 text-sm text-white transition-colors hover:bg-panel"
          >
            View usage
          </Link>
        }
      />

      <div className="space-y-8 p-4 lg:p-8">
        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Plan</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {plans.map((p) => {
              const current = p.name === usage.plan;
              return (
                <Panel key={p.id} accent={p.featured} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                    {current && (
                      <span className="ml-auto rounded-full border border-mint/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mint">
                        current
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-display text-3xl font-semibold">{p.price}</p>
                  <p className="font-mono text-xs text-mute">{p.cadence}</p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {p.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-fog">
                        <Check className="mt-0.5 size-4 shrink-0 text-mint" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={current}
                    onClick={() =>
                      toast.success(`Switched to ${p.name}`, { description: "Priority processing applies immediately." })
                    }
                    className={cn(
                      "mt-5 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                      current
                        ? "cursor-default border border-line text-mute"
                        : p.featured
                          ? "bg-pink text-ink hover:bg-white"
                          : "border border-line text-white hover:bg-ink2",
                    )}
                  >
                    {current ? "Current plan" : p.id === "scale" ? "Talk to sales" : `Switch to ${p.name}`}
                  </button>
                </Panel>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Payment method</h2>
            <div className="mt-4 flex items-center gap-3 rounded-md border border-line bg-ink2 p-4">
              <CreditCard className="size-5 text-pink" />
              <div>
                <p className="text-sm text-white">Visa ending 4242</p>
                <p className="font-mono text-[11px] text-mute">Expires 09 / 2028 · Avery Lane</p>
              </div>
              <button
                type="button"
                onClick={() => toast("Card update form opened")}
                className="ml-auto rounded-md border border-line px-3 py-2 text-sm text-white hover:bg-panel"
              >
                Update
              </button>
            </div>
            <p className="mt-4 font-mono text-[11px] text-mute">
              Billing email: billing@acmelabs.io · VAT / ABN can be added at checkout.
            </p>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">Billing address</h2>
            <p className="mt-4 text-sm leading-relaxed text-fog">
              Acme Labs Pty Ltd
              <br />
              Level 4, 118 Flinders Lane
              <br />
              Melbourne VIC 3000, Australia
            </p>
            <button
              type="button"
              onClick={() => toast("Address form opened")}
              className="mt-4 rounded-md border border-line px-3 py-2 text-sm text-white hover:bg-ink2"
            >
              Edit address
            </button>
          </Panel>
        </section>

        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Invoices</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-panel font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3.5 font-mono text-xs text-white">{i.id}</td>
                    <td className="px-4 py-3.5 text-fog">{i.date}</td>
                    <td className="px-4 py-3.5 text-fog">{i.plan}</td>
                    <td className="px-4 py-3.5 text-fog">{i.amount}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-mint">{i.status}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => toast.success(`${i.id} downloaded`)}
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-fog hover:text-white"
                      >
                        <Download className="size-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
