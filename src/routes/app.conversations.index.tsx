import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { ConnectorChip, TierBadge } from "@/components/pink/primitives";
import { conversations } from "@/lib/mock";

export const Route = createFileRoute("/app/conversations/")({
  head: () => ({
    meta: [
      { title: "Conversation history | PINK workspace" },
      { name: "description", content: "Every past conversation with the PINK agent, with the tools and tiers used." },
      { property: "og:title", content: "PINK conversation history" },
      { property: "og:description", content: "Search past agent sessions and reopen any thread in full." },
    ],
  }),
  component: Conversations,
});

function Conversations() {
  return (
    <>
      <PageHeader
        title="Conversations"
        copy="Every session is kept with the connectors it touched and the tier that handled it."
        actions={
          <Link
            to="/app/chat"
            className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
          >
            New conversation
          </Link>
        }
      />
      <div className="p-4 lg:p-8">
        <div className="overflow-hidden rounded-lg border border-line">
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-line bg-panel px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
            <span>Session</span>
            <span>Updated</span>
          </div>
          <ul className="divide-y divide-line">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  to="/app/conversations/$conversationId"
                  params={{ conversationId: c.id }}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-panel/60"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-semibold text-white">{c.title}</h2>
                      <TierBadge tier={c.tierMix} />
                    </div>
                    <p className="mt-1 truncate text-sm text-fog">{c.preview}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] text-mute">{c.id}</span>
                      {c.connectorsUsed.map((id) => (
                        <ConnectorChip key={id} id={id} />
                      ))}
                      <span className="font-mono text-[10px] text-mute">{c.messages} messages</span>
                    </div>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] text-mute">{c.updated}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
