import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Panel } from "@/components/pink/primitives";
import { useApiKeys, useCreateApiKey, useProfile, useRevokeApiKey } from "@/lib/queries";
import { relativeTime } from "@/lib/format";

export const Route = createFileRoute("/app/settings/api-keys")({
  head: () => ({
    meta: [
      { title: "API keys | PINK workspace" },
      { name: "description", content: "Create, scope and revoke keys that call the PINK agent from your own code." },
      { property: "og:title", content: "PINK API keys" },
      { property: "og:description", content: "Programmatic access to the agent, scoped and revocable." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApiKeys,
});

const scopeOptions = [
  { value: "chat:write", label: "chat:write — start conversations and tasks" },
  { value: "tasks:read", label: "tasks:read — read task status and logs" },
  { value: "usage:read", label: "usage:read — read usage and quota" },
];

function ApiKeys() {
  const { data: keys = [], isLoading, error } = useApiKeys();
  const { data: profile } = useProfile();
  const create = useCreateApiKey();
  const revoke = useRevokeApiKey();

  const [label, setLabel] = useState("");
  const [scope, setScope] = useState(scopeOptions[0]!.value);
  const [secret, setSecret] = useState<string | null>(null);

  const onFreePlan = (profile?.plan ?? "free") === "free";

  const submit = () => {
    if (!label.trim()) {
      toast.error("Give the key a name so you can recognise it later.");
      return;
    }
    create.mutate(
      { label: label.trim(), scope },
      {
        onSuccess: (value) => {
          setSecret(value);
          setLabel("");
          toast.success("Key created — copy it now, it is shown once.");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create the key."),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">API keys</h1>
        <p className="mt-2 max-w-2xl text-sm text-fog">
          Keys let your own code call the agent. Each key carries one scope, and we only ever store its hash — copy the
          secret when it is created.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-white/90">
          {error.message}
        </p>
      )}

      {onFreePlan && (
        <p className="rounded-md border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-white/90">
          API keys are a paid-plan feature. You can create one here, but requests made with it are rejected while your
          account is on the free plan.
        </p>
      )}

      {secret && (
        <Panel className="border-mint/40">
          <h2 className="font-display text-lg font-semibold">Your new key</h2>
          <p className="mt-1 text-sm text-fog">This is the only time it will be shown.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-ink px-3 py-2 font-mono text-xs text-mint">
              {secret}
            </code>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(secret);
                toast.success("Copied to clipboard");
              }}
              className="rounded-md border border-line px-3 py-2 text-sm text-white hover:bg-ink2"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => setSecret(null)}
              className="rounded-md bg-pink px-3 py-2 text-sm font-medium text-ink hover:bg-white"
            >
              I've saved it
            </button>
          </div>
        </Panel>
      )}

      <Panel>
        <h2 className="font-display text-lg font-semibold">Create a key</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block text-sm">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Name</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="production backend"
              className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-xs text-white outline-none focus:border-pink"
            />
          </label>
          <label className="block text-sm">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Scope</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-xs text-white outline-none focus:border-pink"
            >
              {scopeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={create.isPending}
            className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white disabled:opacity-50"
          >
            {create.isPending ? "Creating…" : "Create key"}
          </button>
        </div>
      </Panel>

      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid grid-cols-[1fr_auto] border-b border-line bg-panel px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
          <span>Key</span>
          <span>Status</span>
        </div>
        <ul className="divide-y divide-line">
          {isLoading && <li className="px-5 py-6 text-sm text-mute">Loading keys…</li>}
          {!isLoading && keys.length === 0 && (
            <li className="px-5 py-6 text-sm text-mute">No keys yet.</li>
          )}
          {keys.map((k) => (
            <li key={k.id} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-white">{k.label}</p>
                <p className="mt-1 truncate font-mono text-[11px] text-fog">{k.prefix}••••••••</p>
                <p className="mt-1 font-mono text-[10px] text-mute">
                  {k.scope} · created {relativeTime(k.created_at)} · last used{" "}
                  {k.last_used_at ? relativeTime(k.last_used_at) : "never"}
                </p>
              </div>
              {k.revoked_at ? (
                <span className="font-mono text-[11px] text-mute">revoked {relativeTime(k.revoked_at)}</span>
              ) : (
                <button
                  type="button"
                  disabled={revoke.isPending}
                  onClick={() =>
                    revoke.mutate(k.id, {
                      onSuccess: () => toast.success(`${k.label} revoked`),
                      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not revoke the key."),
                    })
                  }
                  className="rounded-md border border-line px-3 py-2 text-sm text-white hover:bg-panel disabled:opacity-50"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
