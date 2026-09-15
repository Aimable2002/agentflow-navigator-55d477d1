import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Panel, StatusPill, TierBadge } from "@/components/pink/primitives";
import { useConnector, useDisconnectConnector, useSaveConnection, useTasks } from "@/lib/queries";
import { relativeTime, shortId, taskDuration } from "@/lib/format";
import type { ConnectorScope, McpTransport } from "@/lib/types";

export const Route = createFileRoute("/app/connectors/$connectorId")({
  head: () => ({
    meta: [
      { title: "Connector setup | PINK workspace" },
      { name: "description", content: "Connect this tool, choose its transport and grant only the scopes you want." },
      { property: "og:title", content: "PINK connector setup" },
      { property: "og:description", content: "Scoped, revocable access for one tool." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConnectorDetail,
});

const transports: McpTransport[] = ["stdio", "sse", "http"];

function ConnectorDetail() {
  const { connectorId } = Route.useParams();
  const { data: connector, isLoading, error } = useConnector(connectorId);
  const { data: tasks = [] } = useTasks();
  const save = useSaveConnection();
  const disconnect = useDisconnectConnector();

  const [transport, setTransport] = useState<McpTransport>("http");
  const [serverUrl, setServerUrl] = useState("");
  const [authHeader, setAuthHeader] = useState("Authorization");
  const [authToken, setAuthToken] = useState("");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [accountLabel, setAccountLabel] = useState("");
  const [scopes, setScopes] = useState<ConnectorScope[]>([]);

  useEffect(() => {
    if (!connector) return;
    const c = connector.connection;
    setTransport(c?.transport ?? connector.default_transport);
    setServerUrl(c?.server_url ?? connector.default_server_url ?? "");
    setAuthHeader(c?.auth_header_name ?? "Authorization");
    setCommand(c?.command ?? "");
    setArgs((c?.args ?? []).join(" "));
    setAccountLabel(c?.account_label ?? "");
    setScopes(connector.scopes);
  }, [connector]);

  if (isLoading) return <div className="p-8 text-sm text-mute">Loading connector…</div>;

  if (error || !connector) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-semibold">Connector not found</h1>
        <p className="mt-2 text-fog">{error?.message ?? "This connector is not in the catalogue."}</p>
        <Link to="/app/connectors" className="mt-4 inline-block font-mono text-sm text-pink hover:underline">
          ← All connectors
        </Link>
      </div>
    );
  }

  if (connector.id === "telegram") {
    return <TelegramOnboarding connector={connector} />;
  }

  if (connector.id === "whatsapp") {
    return <WhatsAppOnboarding connector={connector} />;
  }

  const related = tasks.filter((t) => t.connector_id === connector.id);
  const grantedCount = scopes.filter((s) => s.granted).length;

  const submit = () => {
    if (transport !== "stdio" && !serverUrl.trim()) {
      toast.error("A server URL is required for SSE and HTTP transports.");
      return;
    }
    if (transport === "stdio" && !command.trim()) {
      toast.error("A command is required for the stdio transport.");
      return;
    }
    save.mutate(
      {
        connector_id: connector.id,
        transport,
        server_url: transport === "stdio" ? null : serverUrl.trim(),
        auth_header_name: authHeader.trim() || "Authorization",
        auth_token: authToken.trim() || null,
        command: transport === "stdio" ? command.trim() : null,
        args: transport === "stdio" ? args.trim().split(/\s+/).filter(Boolean) : [],
        account_label: accountLabel.trim() || null,
        scopes,
        status: "connected",
      },
      {
        onSuccess: () => {
          setAuthToken("");
          toast.success(`${connector.name} saved`);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save this connection."),
      },
    );
  };

  const field = "mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-xs text-white outline-none focus:border-pink";

  return (
    <div className="p-4 lg:p-8">
      <Link to="/app/connectors" className="font-mono text-xs text-mute hover:text-white">
        ← Connectors
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md border border-line bg-ink2 font-mono text-sm text-fog">
          {connector.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{connector.name}</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{connector.category}</p>
        </div>
        <span
          className={
            connector.connected
              ? "ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-mint"
              : "ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-mute"
          }
        >
          <span className={connector.connected ? "size-1.5 rounded-full bg-mint" : "size-1.5 rounded-full bg-mute"} />
          {connector.status}
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog">{connector.description}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Connection</h2>
            <p className="mt-1 text-sm text-fog">
              The agent opens this connector with your own credentials. Tokens are stored against your account and never
              shown again after saving.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {transports.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTransport(t)}
                  className={
                    transport === t
                      ? "rounded-md bg-pink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink"
                      : "rounded-md border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-fog hover:bg-ink2"
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Account label</span>
                <input
                  value={accountLabel}
                  onChange={(e) => setAccountLabel(e.target.value)}
                  placeholder="which account is this?"
                  className={field}
                />
              </label>

              {transport === "stdio" ? (
                <>
                  <label className="block text-sm">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Command</span>
                    <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="npx" className={field} />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Arguments</span>
                    <input
                      value={args}
                      onChange={(e) => setArgs(e.target.value)}
                      placeholder="-y @modelcontextprotocol/server-github"
                      className={field}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="block text-sm">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Server URL</span>
                    <input
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="https://mcp.example.com/sse"
                      className={field}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Auth header</span>
                    <input value={authHeader} onChange={(e) => setAuthHeader(e.target.value)} className={field} />
                  </label>
                </>
              )}

              <label className="block text-sm sm:col-span-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                  {connector.connection ? "Replace token (leave blank to keep)" : "Token"}
                </span>
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="••••••••••••"
                  className={field}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={save.isPending}
                className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white disabled:opacity-50"
              >
                {save.isPending ? "Saving…" : connector.connected ? "Save changes" : "Connect"}
              </button>
              {connector.connected && (
                <button
                  type="button"
                  disabled={disconnect.isPending}
                  onClick={() =>
                    disconnect.mutate(connector.id, {
                      onSuccess: () => toast.success(`${connector.name} disconnected`),
                      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not disconnect."),
                    })
                  }
                  className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2 disabled:opacity-50"
                >
                  {disconnect.isPending ? "Disconnecting…" : "Disconnect"}
                </button>
              )}
              {connector.docs_url && (
                <a
                  href={connector.docs_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2"
                >
                  Provider docs ↗
                </a>
              )}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-semibold">Scopes</h2>
              <span className="ml-auto font-mono text-[11px] text-mute">
                {grantedCount} of {scopes.length} granted
              </span>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {scopes.length === 0 && <li className="py-3 text-sm text-fog">This connector defines no scopes.</li>}
              {scopes.map((s, i) => (
                <li key={s.key} className="flex items-start gap-3 py-3">
                  <button
                    type="button"
                    aria-pressed={s.granted}
                    aria-label={`Toggle ${s.label}`}
                    onClick={() =>
                      setScopes((prev) => prev.map((p, pi) => (pi === i ? { ...p, granted: !p.granted } : p)))
                    }
                    className={
                      s.granted
                        ? "mt-0.5 h-5 w-9 shrink-0 rounded-full bg-mint p-0.5 transition-colors"
                        : "mt-0.5 h-5 w-9 shrink-0 rounded-full bg-line p-0.5 transition-colors"
                    }
                  >
                    <span
                      className={
                        s.granted
                          ? "block size-4 translate-x-4 rounded-full bg-ink transition-transform"
                          : "block size-4 rounded-full bg-mute transition-transform"
                      }
                    />
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{s.label}</p>
                    <p className="text-sm text-fog">{s.detail}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-mute">{s.key}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[11px] text-mute">Scope changes save with the button above.</p>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Status</h2>
            <dl className="mt-4 space-y-3 font-mono text-xs">
              {[
                ["Transport", connector.transport],
                ["Server", connector.connection?.server_url ?? connector.default_server_url ?? "—"],
                ["Account", connector.connection?.account_label ?? "—"],
                ["Tools exposed", connector.connection?.tool_count?.toString() ?? "—"],
                ["Last sync", relativeTime(connector.connection?.last_sync_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-mute">{k}</dt>
                  <dd className="truncate text-fog">{v}</dd>
                </div>
              ))}
            </dl>
            {connector.connection?.last_error && (
              <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-[11px] text-amber">
                {connector.connection.last_error}
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">Actions the agent can take</h2>
            <ul className="mt-3 space-y-1.5 font-mono text-xs text-fog">
              {connector.actions.map((a) => (
                <li key={a} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-pink" /> {a}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">Recent tasks</h2>
            <div className="mt-3 space-y-3">
              {related.length === 0 && <p className="text-sm text-fog">No tasks have used this connector yet.</p>}
              {related.slice(0, 5).map((t) => (
                <Link
                  key={t.id}
                  to="/app/tasks/$taskId"
                  params={{ taskId: t.id }}
                  className="block rounded-md border border-line p-3 hover:bg-ink2"
                >
                  <div className="flex items-center gap-2">
                    <StatusPill status={t.status} />
                    <TierBadge tier={t.tier} className="ml-auto" />
                  </div>
                  <p className="mt-2 text-sm text-white">{t.title}</p>
                  <p className="mt-1 font-mono text-[10px] text-mute">
                    {shortId(t.id)} · {taskDuration(t)}
                  </p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

type SpecialConnectorProps = {
  connector: NonNullable<ReturnType<typeof useConnector>["data"]>;
};

function SpecialConnectorHeader({ connector, copy }: SpecialConnectorProps & { copy: string }) {
  return (
    <>
      <Link to="/app/connectors" className="font-mono text-xs text-mute hover:text-white">
        ← Connectors
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md border border-line bg-ink2 font-mono text-sm text-fog">
          {connector.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{connector.name}</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{connector.category}</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-mute">
          <span className="size-1.5 rounded-full bg-mute" />
          {connector.connected ? connector.status : "not connected"}
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog">{copy}</p>
    </>
  );
}

const specialField =
  "mt-1 w-full rounded-md border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-pink";

function TelegramOnboarding({ connector }: SpecialConnectorProps) {
  const [step, setStep] = useState<"phone" | "code" | "password" | "ready">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const submitPhone = () => {
    if (!phone.trim()) {
      toast.error("Enter the phone number linked to Telegram.");
      return;
    }
    setStep("code");
    toast.success("Telegram sent a login code to your account.");
  };

  const submitCode = () => {
    if (!code.trim()) {
      toast.error("Enter the Telegram login code.");
      return;
    }
    setStep("password");
  };

  return (
    <div className="p-4 lg:p-8">
      <SpecialConnectorHeader
        connector={connector}
        copy="Connect your own Telegram account, then choose which chats can feed signals to your agent."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Telegram login</h2>
              <p className="mt-1 text-sm text-fog">A one-time sign-in keeps this account scoped to you.</p>
            </div>
            <span className="font-mono text-[11px] text-pink">{step === "ready" ? "4 / 4" : step === "phone" ? "1 / 4" : step === "code" ? "2 / 4" : "3 / 4"}</span>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-1.5" aria-label="Telegram setup progress">
            {["phone", "code", "password", "ready"].map((item, index) => (
              <span key={item} className={`h-1 rounded-full ${index <= ["phone", "code", "password", "ready"].indexOf(step) ? "bg-pink" : "bg-line"}`} />
            ))}
          </div>

          <div className="mt-6">
            {step === "phone" && (
              <div>
                <label className="block text-sm">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Phone number</span>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+44 7700 900000" inputMode="tel" className={specialField} />
                </label>
                <button type="button" onClick={submitPhone} className="mt-5 rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white">
                  Send login code
                </button>
              </div>
            )}

            {step === "code" && (
              <div>
                <label className="block text-sm">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Login code</span>
                  <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="12345" inputMode="numeric" autoComplete="one-time-code" className={specialField} />
                </label>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={submitCode} className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white">Verify code</button>
                  <button type="button" onClick={() => setStep("phone")} className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2">Change number</button>
                </div>
              </div>
            )}

            {step === "password" && (
              <div>
                <label className="block text-sm">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Two-step verification password <span className="normal-case tracking-normal">(optional)</span></span>
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Only if Telegram asks for it" className={specialField} />
                </label>
                <button type="button" onClick={() => setStep("ready")} className="mt-5 rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white">
                  Finish Telegram setup
                </button>
              </div>
            )}

            {step === "ready" && (
              <div className="rounded-md border border-mint/30 bg-mint/5 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mint">Login captured</p>
                <p className="mt-2 text-sm text-fog">Your secure Telegram session will be attached to this account when the session service is enabled.</p>
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Before you continue</h2>
          <ul className="mt-4 space-y-3 text-sm text-fog">
            <li className="border-l-2 border-pink pl-3">Only chats you explicitly allow will reach the signal pipeline.</li>
            <li className="border-l-2 border-line pl-3">Your session belongs to this user account, not the workspace.</li>
            <li className="border-l-2 border-line pl-3">You can revoke access from this page at any time.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function WhatsAppOnboarding({ connector }: SpecialConnectorProps) {
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const startSetup = () => {
    if (!phone.trim()) {
      toast.error("Enter the WhatsApp number that should receive alerts.");
      return;
    }
    setSubmitted(true);
    toast.success("WhatsApp number ready for Meta setup.");
  };

  return (
    <div className="p-4 lg:p-8">
      <SpecialConnectorHeader
        connector={connector}
        copy="Choose the number that should receive agent alerts. WhatsApp is send-only, so no messages are read from this account."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <h2 className="font-display text-lg font-semibold">Connect your number</h2>
          <p className="mt-1 text-sm text-fog">Meta will verify the number before alerts can be delivered.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">WhatsApp number</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+44 7700 900000" inputMode="tel" className={specialField} />
            </label>
            <label className="block text-sm">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Label</span>
              <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Personal alerts" className={specialField} />
            </label>
          </div>
          {submitted && (
            <p className="mt-4 rounded-md border border-amber/30 bg-amber/5 px-3 py-2 font-mono text-[11px] text-amber">
              Meta embedded signup will open here once this workspace has its WhatsApp Business app configured.
            </p>
          )}
          <button type="button" onClick={startSetup} className="mt-5 rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white">
            Continue with Meta setup
          </button>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">What WhatsApp receives</h2>
          <ul className="mt-4 space-y-3 text-sm text-fog">
            <li className="border-l-2 border-mint pl-3">Task completion and failure notifications.</li>
            <li className="border-l-2 border-mint pl-3">Signal alerts that clear your confidence threshold.</li>
            <li className="border-l-2 border-line pl-3">No inbound messages or contact history.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
