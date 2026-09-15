import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { apiKeys } from "@/lib/mock";

export const Route = createFileRoute("/app/settings/api-keys")({
  head: () => ({
    meta: [
      { title: "API keys | PINK workspace" },
      { name: "description", content: "Create and revoke keys to drive the PINK agent programmatically." },
      { property: "og:title", content: "PINK API keys" },
      { property: "og:description", content: "Programmatic access with scoped, revocable keys." },
    ],
  }),
  component: ApiKeys,
});

function ApiKeys() {
  return (
    <>
      <PageHeader
        title="API keys"
        copy="For driving the agent from your own code or CI. Keys are shown once at creation."
        actions={
          <button
            type="button"
            onClick={() => toast.success("New key created", { description: "Copy it now — it won't be shown again." })}
            className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
          >
            Create key
          </button>
        }
      />

      <div className="grid gap-4 p-4 lg:max-w-4xl lg:p-8">
        <Panel>
          <h2 className="font-display text-lg font-semibold">Your keys</h2>
          <p className="mt-2 font-mono text-[11px] text-mute">Free plan allows 0 keys · Pro allows 3 · Scale unlimited</p>
          <ul className="mt-4 divide-y divide-line">
            {apiKeys.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center gap-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm text-white">{k.label}</p>
                  <p className="font-mono text-[11px] text-mute">
                    {k.prefix} · {k.scope} · created {k.created} · last used {k.lastUsed}
                  </p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => toast.success("Key prefix copied")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 font-mono text-[11px] text-fog hover:text-white"
                  >
                    <Copy className="size-3.5" /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => toast("Key revoked", { description: "Requests using it will now fail." })}
                    className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-2 font-mono text-[11px] text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" /> Revoke
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Start a run</h2>
          <pre className="mt-4 overflow-x-auto rounded-md border border-line bg-ink p-4 font-mono text-xs text-fog">{`curl https://api.pink.dev/v1/runs \\
  -H "Authorization: Bearer pk_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Backtest the momentum EA on EURUSD M15",
    "tier": "auto",
    "connectors": ["mt5", "linear"]
  }'`}</pre>
          <p className="mt-3 text-sm text-fog">
            The response returns a task id immediately. Poll it or register a webhook to hear about completion.
          </p>
          <Link to="/docs/$slug" params={{ slug: "api-access" }} className="mt-3 inline-block font-mono text-xs text-pink hover:underline">
            API documentation →
          </Link>
        </Panel>

        <Panel accent>
          <h2 className="font-display text-lg font-semibold">Keep keys server-side</h2>
          <p className="mt-2 text-sm text-white/90">
            A key can start runs against every connector you have authorised. Never ship one in browser code, and scope
            it to read-only where that is enough.
          </p>
        </Panel>
      </div>
    </>
  );
}
