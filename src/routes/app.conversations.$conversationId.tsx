import { createFileRoute, Link } from "@tanstack/react-router";
import { MarkdownContent } from "@/components/app/markdown-content";
import { ConnectorChip, InlineTaskCard, Panel, TierBadge } from "@/components/pink/primitives";
import { useConversation, useTasks } from "@/lib/queries";
import { relativeTime, shortId, taskDuration } from "@/lib/format";

export const Route = createFileRoute("/app/conversations/$conversationId")({
  head: () => ({
    meta: [
      { title: "Conversation | PINK workspace" },
      { name: "description", content: "The full thread, the tools the agent called and the tasks it started." },
      { property: "og:title", content: "PINK conversation" },
      { property: "og:description", content: "Read a past agent session end to end." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConversationDetail,
});

function ConversationDetail() {
  const { conversationId } = Route.useParams();
  const { data, isLoading, error } = useConversation(conversationId);
  const { data: tasks = [] } = useTasks();

  const conversation = data?.conversation ?? null;
  const messages = data?.messages ?? [];
  const linked = tasks.filter((t) => t.conversation_id === conversationId);

  if (isLoading) {
    return <div className="p-8 text-sm text-mute">Loading conversation…</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-semibold">Conversation could not be loaded</h1>
        <p className="mt-2 text-fog">{error.message}</p>
        <Link to="/app/conversations" className="mt-4 inline-block font-mono text-sm text-pink hover:underline">
          ← Back to history
        </Link>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-semibold">Conversation not found</h1>
        <p className="mt-2 text-fog">It may have been deleted, or it belongs to another account.</p>
        <Link to="/app/conversations" className="mt-4 inline-block font-mono text-sm text-pink hover:underline">
          ← Back to history
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <Link to="/app/conversations" className="font-mono text-xs text-mute hover:text-white">
        ← Conversations
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{conversation.title}</h1>
        {conversation.tier_mix && <TierBadge tier={conversation.tier_mix} />}
        <span className="font-mono text-[11px] text-mute">
          {shortId(conversation.id, "CNV")} · {relativeTime(conversation.updated_at)} · {messages.length} messages
        </span>
        <Link
          to="/app/chat"
          search={{ conversation: conversation.id }}
          className="ml-auto rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
        >
          Continue in chat
        </Link>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {(conversation.connectors_used ?? []).map((id) => (
          <ConnectorChip key={id} id={id} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {messages.length === 0 && <p className="text-sm text-mute">This conversation has no messages yet.</p>}
          {messages.map((m) => (
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
                {m.role === "agent" ? (
                  <MarkdownContent content={m.content} />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">{m.content}</p>
                )}
                {(m.steps ?? []).map((s, i) => (
                  <div
                    key={`${s.connector}${s.action}${i}`}
                    className="flex items-center gap-2 font-mono text-xs text-fog"
                  >
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
                  meta={`${shortId(t.id)} · ${taskDuration(t)}`}
                />
              ))}
            </div>
          </Panel>
          <Panel>
            <h2 className="font-display text-lg font-semibold">Session facts</h2>
            <dl className="mt-4 space-y-2 font-mono text-xs text-fog">
              <div className="flex justify-between">
                <dt className="text-mute">Dominant tier</dt>
                <dd>{conversation.tier_mix ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Connectors</dt>
                <dd>{(conversation.connectors_used ?? []).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Tasks spawned</dt>
                <dd>{linked.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Started</dt>
                <dd>{relativeTime(conversation.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Last activity</dt>
                <dd>{relativeTime(conversation.updated_at)}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
