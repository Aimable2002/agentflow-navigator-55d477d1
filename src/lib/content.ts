/**
 * Static product content: plan definitions, the comparison matrix, help-centre
 * questions, docs pages and tier labels. This is marketing/reference copy that
 * belongs in the app, not user data — everything user-specific comes from
 * Supabase or the agent backend.
 */
import type { Tier } from "./types";

export const tierMeta: Record<Tier, { label: string; blurb: string; use: string; note: string; className: string }> = {
  small: {
    label: "small",
    blurb: "Fast, cheap model for lookups, formatting and short answers.",
    use: "Status checks, summaries, single tool calls",
    note: "Lookups, formatting, single tool calls",
    className: "text-mint",
  },
  medium: {
    label: "medium",
    blurb: "Balanced model for multi-step work with a few tool calls.",
    use: "Issue triage, data sync, code edits",
    note: "Multi-step work with a few tool calls",
    className: "text-amber",
  },
  best: {
    label: "best",
    blurb: "Highest-capability model for hard reasoning and long chains.",
    use: "Strategy design, architecture, tricky debugging",
    note: "Hard reasoning and long tool chains",
    className: "text-pink",
  },
};

/**
 * Names shown on public marketing pages, where no session exists. The live
 * catalogue in the app comes from the `connector_catalog` table.
 */
export type MarketingConnector = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  actions: string[];
};

export const marketingConnectors: MarketingConnector[] = [
  {
    id: "mt5",
    name: "MT5",
    category: "Trading",
    tagline: "Write, backtest and iterate Expert Advisors",
    description:
      "The agent writes MQL5 Expert Advisors, runs them through the strategy tester, reads the report and iterates on the parameters until the numbers hold up.",
    actions: ["Write an EA from a described edge", "Run a backtest over a date range", "Tune parameters and re-test", "Summarise drawdown and expectancy"],
  },
  {
    id: "github",
    name: "GitHub",
    category: "Code",
    tagline: "Files, commits, pull requests, CI",
    description:
      "Read the repository, make a change on a branch, open a pull request and watch the checks. When CI fails, the agent reads the logs and pushes a fix.",
    actions: ["Read files and history", "Commit on a branch", "Open and update pull requests", "Diagnose failing CI runs"],
  },
  {
    id: "linear",
    name: "Linear",
    category: "Tracking",
    tagline: "Issues, cycles and project state",
    description:
      "Turn findings into tracked work. The agent files issues with the context it gathered, moves them through states and reports on cycle progress.",
    actions: ["Create and update issues", "Attach results to an issue", "Move issues through states", "Report on a cycle"],
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "Messaging",
    tagline: "Talk to the agent and get task alerts in chat",
    description:
      "Get a message the moment a background task finishes or fails, and reply in the same chat to send the agent its next instruction.",
    actions: ["Notify on task completion", "Alert on failures", "Accept new instructions from chat", "Send daily digests"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    tagline: "Contacts, deals and pipeline hygiene",
    description:
      "Read the pipeline, flag deals that have gone quiet, clean up duplicate records and draft the follow-ups that are overdue.",
    actions: ["Summarise the pipeline", "Flag stalled deals", "Update contacts and deals", "Draft follow-ups"],
  },
  {
    id: "xero",
    name: "Xero",
    category: "Accounting",
    tagline: "Bookkeeping, invoices and reconciliation",
    description:
      "Reconcile a period, categorise what is obvious and hand back a short list of the transactions that genuinely need a human decision.",
    actions: ["Reconcile a period", "Categorise transactions", "Chase unpaid invoices", "Produce a month-end summary"],
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Bridge",
    tagline: "A bridge to thousands of other apps",
    description:
      "Anything without a first-class connector can still be reached. The agent triggers your Zaps and reads their results back into the conversation.",
    actions: ["Trigger a Zap", "Pass structured data through", "Read the run result", "Chain several apps in one job"],
  },
  {
    id: "lovable",
    name: "Lovable",
    category: "Builds",
    tagline: "Trigger and manage full-stack app builds",
    description:
      "Describe an app or a change and the agent drives the build end to end, then reports back with what shipped and what needs review.",
    actions: ["Start a full-stack build", "Apply a described change", "Read build status", "Summarise what shipped"],
  },
];

export const connectorLabels: Record<string, string> = {
  mt5: "MT5",
  github: "GitHub",
  linear: "Linear",
  telegram: "Telegram",
  hubspot: "HubSpot",
  xero: "Xero",
  zapier: "Zapier",
  lovable: "Lovable",
};

export type Plan = {
  id: "free" | "pro" | "scale";
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  /** Short marketing line, alias of tagline for card layouts. */
  blurb: string;
  quota: string;
  priority: string;
  cta: string;
  featured?: boolean;
  includes: string[];
  /** Alias of includes, used by the pricing and onboarding cards. */
  features: string[];
  limits: string[];
};

const basePlans: (Omit<Plan, "blurb" | "features" | "limits"> & { limits?: string[] })[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Enough to run real work and judge the routing for yourself.",
    quota: "500 agent requests / month",
    priority: "Best-effort priority — free requests run when capacity is free.",
    cta: "Start free",
    includes: [
      "500 requests per month",
      "25 best-tier requests per month",
      "2 connectors",
      "5 background tasks at once",
      "7 days of task history",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    cadence: "per month",
    tagline: "For people who put the agent in their daily loop.",
    quota: "10,000 agent requests / month",
    priority: "Priority processing — every request skips the free queue.",
    cta: "Upgrade to Pro",
    featured: true,
    includes: [
      "10,000 requests per month",
      "Unmetered best-tier routing",
      "All connectors, including Telegram alerts",
      "25 background tasks at once",
      "90 days of task history and logs",
      "API keys and webhooks",
      "Email support, 1 business day",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: "$199",
    cadence: "per month",
    tagline: "For teams running the agent against production systems.",
    quota: "Unlimited fair-use requests",
    priority: "Reserved best-tier capacity — no queue, even at peak.",
    cta: "Talk to us",
    includes: [
      "Unlimited requests, fair use",
      "Reserved best-tier capacity",
      "100 background tasks at once",
      "Unlimited history and audit log",
      "SSO and scoped team roles",
      "Private connector endpoints",
      "Shared channel support",
    ],
  },
];

export const plans: Plan[] = basePlans.map((p) => ({
  ...p,
  blurb: p.tagline,
  features: p.includes,
  limits: p.limits ?? [],
}));

export const planGroups: { group: string; rows: { label: string; free: string; pro: string; scale: string }[] }[] = [
  {
    group: "Agent requests",
    rows: [
      { label: "Requests per month", free: "500", pro: "10,000", scale: "Unlimited, fair use" },
      { label: "Best-tier routing", free: "25 / month", pro: "Unmetered", scale: "Reserved capacity" },
      { label: "Queue priority", free: "Best effort", pro: "Priority", scale: "Reserved" },
      { label: "Automatic tier routing", free: "Yes", pro: "Yes", scale: "Yes" },
      { label: "Manual tier override", free: "—", pro: "Yes", scale: "Yes" },
    ],
  },
  {
    group: "Connectors",
    rows: [
      { label: "Connected tools", free: "2", pro: "All", scale: "All + private" },
      { label: "Remote MCP servers (SSE / HTTP)", free: "Yes", pro: "Yes", scale: "Yes" },
      { label: "Local bridges (stdio)", free: "1", pro: "Unlimited", scale: "Unlimited" },
      { label: "Per-scope permissions", free: "Yes", pro: "Yes", scale: "Yes + policy" },
    ],
  },
  {
    group: "Background work",
    rows: [
      { label: "Concurrent tasks", free: "5", pro: "25", scale: "100" },
      { label: "Task history", free: "7 days", pro: "90 days", scale: "Unlimited" },
      { label: "Live logs and retry", free: "Yes", pro: "Yes", scale: "Yes" },
      { label: "Telegram task alerts", free: "—", pro: "Yes", scale: "Yes" },
    ],
  },
  {
    group: "Platform",
    rows: [
      { label: "API keys", free: "—", pro: "Yes", scale: "Yes" },
      { label: "Audit log", free: "—", pro: "—", scale: "Yes" },
      { label: "SSO", free: "—", pro: "—", scale: "Yes" },
      { label: "Support", free: "Community", pro: "Email, 1 day", scale: "Shared channel" },
    ],
  },
];

/** Flat comparison rows, used by the pricing table. */
export const planMatrix: { row: string; free: string; pro: string; scale: string }[] = planGroups.flatMap((g) =>
  g.rows.map((r) => ({ row: r.label, free: r.free, pro: r.pro, scale: r.scale })),
);

export const faqs: { q: string; a: string }[] = [
  {
    q: "How does PINK decide which model handles my request?",
    a: "Every request is scored for difficulty before it runs. Simple lookups go to the small tier, multi-step work with tool calls goes to medium, and genuinely hard reasoning goes to the best tier. You see the tier that handled each message in the conversation, and you can pin a tier manually on paid plans.",
  },
  {
    q: "What is an MCP connector?",
    a: "Model Context Protocol is an open standard for exposing tools to an AI agent. A connector is one scoped link to one of your accounts. PINK speaks all three transports: remote servers over SSE or streamable HTTP (Linear, GitHub, HubSpot, Xero, Zapier), and local bridges over stdio for things that run on your machine, like MetaTrader 5.",
  },
  {
    q: "Can I connect a hosted MCP server I run myself?",
    a: "Yes. On any connector, choose the remote transport, paste the server URL and the authorisation header the server expects. PINK stores the token server-side, never in the browser, and lists the tools the server advertises once the handshake succeeds.",
  },
  {
    q: "What can the agent actually do without asking me?",
    a: "Only what your scopes allow. Each connector has individual permissions and sensitive ones — live orders in MT5, deleting issues, publishing a build — stay off until you switch them on. Revoking a scope stops it mid-flight.",
  },
  {
    q: "What happens on the free plan when capacity is tight?",
    a: "Free requests run with best-effort priority: they still run, but they queue behind paid traffic at peak. Paid plans get priority processing, and Scale gets reserved best-tier capacity so nothing queues.",
  },
  {
    q: "How do background tasks work?",
    a: "Anything long-running — a backtest, a build, a data sync — is queued server-side and keeps running after you close the tab. The task indicator in the sidebar is always visible, each task keeps its full log, and the originating chat message links straight to it.",
  },
  {
    q: "Where does my data live?",
    a: "Conversations, tasks and connector records live in your own database. Connector tokens are stored server-side with restricted access and are only read by the agent runtime when a tool call needs them.",
  },
  {
    q: "Can I use PINK from my phone or from Telegram?",
    a: "Yes. The dashboard is responsive, and the Telegram connector lets the agent message you when a task finishes and accept new instructions from a chat.",
  },
];

export type DocSection = {
  slug: string;
  title: string;
  summary: string;
  reading: string;
  body: { h: string; p: string }[];
};

export const docSections: DocSection[] = [
  {
    slug: "quickstart",
    title: "Quickstart",
    summary: "From sign-up to a first agent task in about five minutes.",
    reading: "4 min",
    body: [
      {
        h: "Create an account",
        p: "Sign up with email, confirm the link we send, then pick a plan. The free plan needs no card and is enough to run real work.",
      },
      {
        h: "Connect your first tool",
        p: "Onboarding asks for one connector. Pick the tool you already work in — GitHub if you write code, HubSpot or Xero if you run a business, MT5 if you trade.",
      },
      {
        h: "Ask for something real",
        p: "Describe the outcome, not the steps. The agent picks a model tier, plans the tool calls, and shows you each one as it happens.",
      },
      {
        h: "Follow the work",
        p: "If the request is long-running it becomes a background task. Close the tab if you like — the task indicator in the sidebar and the task page keep the full picture.",
      },
    ],
  },
  {
    slug: "model-routing",
    title: "Model routing",
    summary: "How difficulty scoring maps a request onto the small, medium and best tiers.",
    reading: "6 min",
    body: [
      {
        h: "Difficulty scoring",
        p: "A fast classifier reads the request and returns a difficulty score before any expensive model runs. The score is compared against two thresholds to choose a tier.",
      },
      {
        h: "The three tiers",
        p: "Small handles lookups, formatting and single tool calls. Medium handles multi-step work. Best handles long reasoning chains, ambiguous specs and hard debugging.",
      },
      {
        h: "Why it saves money",
        p: "Most requests in real workloads are not hard. Routing them away from a frontier model cuts cost by an order of magnitude without you noticing a quality difference on the easy ones.",
      },
      {
        h: "Overriding the choice",
        p: "On paid plans you can pin a tier for a conversation when you know the work is harder than it looks.",
      },
    ],
  },
  {
    slug: "connectors",
    title: "Connectors and MCP",
    summary: "Remote MCP servers over SSE and streamable HTTP, plus local stdio bridges.",
    reading: "7 min",
    body: [
      {
        h: "Three transports",
        p: "PINK connects to remote MCP servers over Server-Sent Events or streamable HTTP — the way hosted connectors ship — and to local servers over stdio for tools that must run on your own machine.",
      },
      {
        h: "Connecting a hosted server",
        p: "Choose the remote transport, paste the server URL, and give the authorisation header the provider expects. PINK performs the MCP handshake, lists the tools the server advertises, and records the tool count on the connector.",
      },
      {
        h: "Connecting a local bridge",
        p: "For stdio, give the command and arguments that start the server plus any environment values it needs. This is how the MT5 bridge runs next to your terminal.",
      },
      {
        h: "Scopes",
        p: "Every connector exposes individual permissions. Sensitive ones are off by default and can be revoked at any time; running tasks that relied on a revoked scope stop.",
      },
    ],
  },
  {
    slug: "background-tasks",
    title: "Background tasks",
    summary: "Queued server-side work with live logs, retry and cancellation.",
    reading: "5 min",
    body: [
      {
        h: "When a request becomes a task",
        p: "Anything that takes longer than a chat turn — a backtest, a build, a large sync — is queued instead of held open in the browser.",
      },
      {
        h: "Priority",
        p: "Paid requests go on a priority queue; free requests go on a best-effort queue that runs when capacity allows.",
      },
      {
        h: "Logs, retry, cancel",
        p: "Each task streams a timestamped log. Failed tasks can be retried with the same inputs, and running tasks can be cancelled without losing the log.",
      },
      {
        h: "Back to the conversation",
        p: "Every task links to the message that started it, and that message shows the task's live status inline.",
      },
    ],
  },
  {
    slug: "chat",
    title: "Working in chat",
    summary: "How to brief the agent so it plans well and calls the right tools.",
    reading: "4 min",
    body: [
      {
        h: "Describe outcomes",
        p: "Say what you want to be true when the work is done. The agent plans the steps and tells you which tools it intends to touch.",
      },
      {
        h: "Give it the constraints",
        p: "Date ranges, repositories, accounts, symbols, thresholds. Constraints are what let the agent avoid a clarifying round trip.",
      },
      {
        h: "Read the step list",
        p: "Each agent turn lists the tool calls it made and the connector each one hit, so you can audit what happened without reading raw logs.",
      },
      {
        h: "Keep threads focused",
        p: "One goal per conversation keeps context tight, keeps routing accurate and makes history searchable.",
      },
    ],
  },
  {
    slug: "usage-and-quota",
    title: "Usage and quota",
    summary: "What counts as a request, and how quota and priority interact.",
    reading: "3 min",
    body: [
      {
        h: "What counts",
        p: "One agent turn is one request, whatever tier handled it and however many tool calls it needed.",
      },
      {
        h: "Tier breakdown",
        p: "The usage page splits requests by tier and by connector so you can see where cost concentrates.",
      },
      {
        h: "Running out",
        p: "When quota is exhausted, queued work finishes but new requests wait until the cycle renews or you upgrade.",
      },
    ],
  },
  {
    slug: "api",
    title: "API and keys",
    summary: "Drive the agent from your own systems with a scoped key.",
    reading: "5 min",
    body: [
      {
        h: "Creating a key",
        p: "Create a key in settings, choose its scope, and copy it once — only a prefix is stored after that.",
      },
      {
        h: "Starting a run",
        p: "Post a prompt to the agent endpoint with your key as a bearer token. You get a job id back immediately.",
      },
      {
        h: "Polling",
        p: "Poll the job endpoint for status, or subscribe to task updates in your own database and skip polling entirely.",
      },
    ],
  },
  {
    slug: "security",
    title: "Security",
    summary: "Where credentials live, and what the agent can never do on its own.",
    reading: "5 min",
    body: [
      {
        h: "Token storage",
        p: "Connector tokens are stored server-side with restricted column access and are never returned to the browser.",
      },
      {
        h: "Least privilege",
        p: "Connectors ship with sensitive scopes off. The agent can only call tools covered by a granted scope, and the check runs on every tool call, not just at connect time.",
      },
      {
        h: "Isolation",
        p: "Row-level security scopes every conversation, task and connector record to the account that owns it.",
      },
      {
        h: "Safety limits",
        p: "The agent runtime caps iterations and total runtime per task, so a loop cannot burn quota indefinitely.",
      },
    ],
  },
];

export function docBySlug(slug: string): DocSection | undefined {
  return docSections.find((d) => d.slug === slug);
}
