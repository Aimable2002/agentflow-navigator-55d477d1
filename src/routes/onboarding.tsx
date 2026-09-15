import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Logo, Meter, Panel } from "@/components/pink/primitives";
import { marketingConnectors as connectors, plans } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your workspace | PINK" },
      { name: "description", content: "Pick a plan, connect your first tool and give the PINK agent its first job." },
      { property: "og:title", content: "Set up your PINK workspace" },
      { property: "og:description", content: "Three steps: plan, connector, first request." },
    ],
  }),
  component: Onboarding,
});

const goals = [
  "Backtest and iterate trading strategies",
  "Ship code and keep CI green",
  "Keep the CRM and pipeline clean",
  "Reconcile the books and chase invoices",
  "Build internal apps and dashboards",
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState("free");
  const [tool, setTool] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  const steps = ["Choose a plan", "Connect a tool", "First request"];

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="flex h-16 items-center border-b border-line px-6">
        <Link to="/" aria-label="PINK home">
          <Logo size="sm" />
        </Link>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
          Step {step} of 3
        </span>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <Meter value={(step / 3) * 100} />
          <div className="mt-3 flex gap-6">
            {steps.map((s, i) => (
              <span
                key={s}
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.12em]",
                  i + 1 === step ? "text-pink" : i + 1 < step ? "text-mint" : "text-mute",
                )}
              >
                {i + 1 < step ? "✓ " : ""}
                {s}
              </span>
            ))}
          </div>
        </div>

        {step === 1 && (
          <section>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Choose how you want to start.</h1>
            <p className="mt-3 max-w-xl text-fog">
              Free is genuinely usable. Upgrade the moment queue priority starts to matter — nothing is lost when you
              switch.
            </p>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={cn(
                    "rounded-lg border p-5 text-left transition-colors",
                    plan === p.id ? "border-pink bg-pink/5" : "border-line bg-panel hover:border-pink/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">{p.name}</h2>
                    {plan === p.id && <Check className="ml-auto size-4 text-pink" />}
                  </div>
                  <p className="mt-3 font-display text-2xl font-semibold">{p.price}</p>
                  <p className="font-mono text-xs text-mute">{p.cadence}</p>
                  <p className="mt-4 text-sm text-fog">{p.quota}</p>
                  <p className="mt-1 font-mono text-xs text-fog">{p.priority}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Connect your first tool.</h1>
            <p className="mt-3 max-w-xl text-fog">
              Pick the one where your work actually lives. You can add the rest later, and you choose the permissions
              at connection time.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {connectors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTool(c.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    tool === c.id ? "border-pink bg-pink/5" : "border-line bg-panel hover:border-pink/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-semibold">{c.name}</span>
                    {tool === c.id && <Check className="ml-auto size-4 text-pink" />}
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{c.category}</p>
                  <p className="mt-2 text-xs text-fog">{c.tagline}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="font-display text-3xl font-semibold tracking-tight">What should the agent do first?</h1>
            <p className="mt-3 max-w-xl text-fog">
              We'll open your first conversation with this in mind. Routing happens automatically from here.
            </p>
            <div className="mt-8 space-y-3">
              {goals.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-4 text-left text-sm transition-colors",
                    goal === g ? "border-pink bg-pink/5 text-white" : "border-line bg-panel text-fog hover:text-white",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", goal === g ? "bg-pink" : "bg-mute")} />
                  {g}
                </button>
              ))}
            </div>
            <Panel className="mt-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">You're set up with</p>
              <p className="mt-2 text-sm text-fog">
                {plans.find((p) => p.id === plan)?.name} plan ·{" "}
                {tool ? connectors.find((c) => c.id === tool)?.name : "no connector yet"}
              </p>
            </Panel>
          </section>
        )}

        <div className="mt-10 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-panel"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => (step === 3 ? navigate({ to: "/app" }) : setStep((s) => s + 1))}
            disabled={(step === 2 && !tool) || (step === 3 && !goal)}
            className="rounded-md bg-pink px-5 py-2.5 font-medium text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === 3 ? "Enter the workspace" : "Continue"}
          </button>
          <Link to="/app" className="ml-auto font-mono text-xs text-mute hover:text-white">
            Skip setup →
          </Link>
        </div>
      </div>
    </div>
  );
}
