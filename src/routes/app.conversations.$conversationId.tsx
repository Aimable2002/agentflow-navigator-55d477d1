import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ConnectorChip, InlineTaskCard, Panel, TierBadge } from "@/components/pink/primitives";
import { conversationById, tasks } from "@/lib/mock";

export const Route = createFileRoute("/app/conversations/$conversationId")({
  loader: ({ params }) => {
    const conversation = conversationById(params.conversationId);
    if (!conversation) throw notFound();
    return { conversation };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Conversation not found | PINK" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${loaderData.conversation.title} | PINK conversation` },
        { name: "description", content: loaderData.conversation.preview },
        { property: "og:title", content: `${loaderData.conversation.title} — PINK` },
        { property: "og:description", content: loaderData.conversation.preview },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold">Conversation not found</h1>
      <p className="mt-2 text-fog">It may have been deleted or fallen outside your plan's history window.</p>
      <Link to="/app/conversations" className="mt-4 inline-block font-mono text-sm text-pink hover:underline">
        ← Back to history
      </Link>
    </div>
  ),
  component: ConversationDetail,
});

function ConversationDetail() {
  const { conversation } = Route.useLoaderData();
  const linked = tasks.filter((t) => t.conversationId === conversation.id);

  return (
    <div className="p-4 lg:p-8">
      <Link to="/app/conversations" className="font-mono text-xs text-mute hover:text-white">
        ← Conversations
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{conversation.title}</h1>
        <TierBadge tier={conversation.tierMix} />
        <span className="font-mono text-[11px] text-mute">
          {conversation.id} · {conversation.updated} · {conversation.messages} messages
        </span>
        <Link
          to="/app/chat"
          className="ml-auto rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
        >
          Continue in chat
        </Link>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {conversation.connectorsUsed.map((id) => (
          <ConnectorChip key={id} id={id} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {conversation.thread.map((m) => (
            <div key={m.id} className="flex gap-3">
              <span
                className={
                  m.role === "user"
                    ? "mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-panel font-mono text-[11px] text-fog"
                    : "mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-pink font-mono text-[11px] font-semibold text-ink"
                }
              >
                {m.role === "user" ? "YOU" : "P"}
              </span>
              <div className="min-w-0 space-y-3">
                {m.tier && <TierBadge tier={m.tier} />}
                <p className="text-sm leading-relaxed text-white/90">{m.text}</p>
                {m.steps?.map((s) => (
                  <div key={`${s.connector}${s.action}`} className="flex items-center gap-2 font-mono text-xs text-fog">
                    <span className="size-1.5 rounded-full bg-mint" /> {s.connector} · {s.action}{" "}
                    <span className="text-mute">{s.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Tasks from this session</h2>
            <div className="mt-4 space-y-3">
              {linked.length === 0 && <p className="text-sm text-fog">No background tasks were started here.</p>}
              {linked.map((t) => (
                <InlineTaskCard
                  key={t.id}
                  taskId={t.id}
                  title={t.title}
                  tier={t.tier}
                  status={t.status}
                  progress={t.progress}
                  meta={`${t.id} · ${t.duration}`}
                />
              ))}
            </div>
          </Panel>
          <Panel>
            <h2 className="font-display text-lg font-semibold">Session facts</h2>
            <dl className="mt-4 space-y-2 font-mono text-xs text-fog">
              <div className="flex justify-between">
                <dt className="text-mute">Dominant tier</dt>
                <dd>{conversation.tierMix}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Connectors</dt>
                <dd>{conversation.connectorsUsed.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Tasks spawned</dt>
                <dd>{linked.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Last activity</dt>
                <dd>{conversation.updated}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
