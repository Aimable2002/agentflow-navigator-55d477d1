export type Tier = "small" | "medium" | "best";

export type TaskStatus = "queued" | "running" | "completed" | "failed";

export type ConnectorId =
  | "mt5"
  | "github"
  | "linear"
  | "hubspot"
  | "xero"
  | "zapier"
  | "lovable";

export type Connector = {
  id: ConnectorId;
  name: string;
  category: string;
  tagline: string;
  description: string;
  connected: boolean;
  account?: string;
  scopes: { label: string; detail: string; granted: boolean }[];
  actions: string[];
  lastSync?: string;
  health?: "healthy" | "degraded";
};

export const connectors: Connector[] = [
  {
    id: "mt5",
    name: "MT5",
    category: "Trading",
    tagline: "Write, backtest and iterate Expert Advisors",
    description:
      "Connect a MetaTrader 5 terminal so the agent can author MQL5 Expert Advisors, compile them, run historical backtests across symbols and timeframes, and iterate on parameters until the strategy holds up.",
    connected: true,
    account: "MT5 · ICMarkets-Demo 51204882",
    lastSync: "2 minutes ago",
    health: "healthy",
    scopes: [
      { label: "Read market history", detail: "Symbols, timeframes, tick data", granted: true },
      { label: "Compile & run strategies", detail: "Strategy tester, optimisation runs", granted: true },
      { label: "Read account state", detail: "Balance, equity, open positions", granted: true },
      { label: "Place live orders", detail: "Execute trades on a live account", granted: false },
    ],
    actions: [
      "Write an EA from a plain-English strategy brief",
      "Backtest over a date range and report Sharpe, drawdown, win rate",
      "Optimise parameters and compare runs side by side",
      "Explain why a strategy underperformed",
    ],
  },
  {
    id: "github",
    name: "GitHub",
    category: "Code",
    tagline: "Files, commits, pull requests, CI",
    description:
      "Give the agent scoped access to repositories so it can read code, open branches, commit changes, raise pull requests and watch CI workflows through to green.",
    connected: true,
    account: "github · acme-labs (4 repos)",
    lastSync: "9 minutes ago",
    health: "healthy",
    scopes: [
      { label: "Read repository contents", detail: "Files, history, branches", granted: true },
      { label: "Write commits & branches", detail: "Push to non-protected branches", granted: true },
      { label: "Manage pull requests", detail: "Open, comment, request review", granted: true },
      { label: "Trigger workflows", detail: "Dispatch and re-run CI jobs", granted: false },
    ],
    actions: [
      "Open a pull request implementing an issue",
      "Summarise what changed in the last release",
      "Fix a failing CI job and push the patch",
      "Audit a repo for stale dependencies",
    ],
  },
  {
    id: "linear",
    name: "Linear",
    category: "Tracking",
    tagline: "Issues, cycles and project state",
    description:
      "Let the agent file, triage and update issues so the work it performs is always reflected in your tracker — no manual copy-paste between the agent and the team board.",
    connected: true,
    account: "linear · Acme Labs / ENG",
    lastSync: "31 minutes ago",
    health: "healthy",
    scopes: [
      { label: "Read issues & projects", detail: "Teams, cycles, labels", granted: true },
      { label: "Create & update issues", detail: "Title, body, assignee, status", granted: true },
      { label: "Comment on issues", detail: "Post agent findings as comments", granted: true },
      { label: "Delete issues", detail: "Permanently remove issues", granted: false },
    ],
    actions: [
      "File a bug with reproduction steps from a chat thread",
      "Draft the next cycle from open customer requests",
      "Post backtest results onto the tracking issue",
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    tagline: "Contacts, deals and pipeline hygiene",
    description:
      "Keep the pipeline clean without living in the CRM. The agent can enrich contacts, move deals, log activity and answer questions about pipeline health in plain language.",
    connected: false,
    scopes: [
      { label: "Read contacts & companies", detail: "Properties and associations", granted: false },
      { label: "Read & update deals", detail: "Stage, amount, owner", granted: false },
      { label: "Log activity", detail: "Notes, calls, emails", granted: false },
    ],
    actions: [
      "Summarise the pipeline and flag stalled deals",
      "Enrich new inbound contacts and assign an owner",
      "Draft follow-ups for deals gone quiet",
    ],
  },
  {
    id: "xero",
    name: "Xero",
    category: "Accounting",
    tagline: "Bookkeeping, invoices and reconciliation",
    description:
      "Financial data is handled read-first: the agent reconciles, categorises and reports, and only writes when you grant explicit write scope for invoices and bills.",
    connected: true,
    account: "xero · Acme Labs Pty Ltd",
    lastSync: "1 hour ago",
    health: "degraded",
    scopes: [
      { label: "Read accounting data", detail: "Accounts, invoices, bank feeds", granted: true },
      { label: "Categorise transactions", detail: "Suggest and apply account codes", granted: true },
      { label: "Create invoices & bills", detail: "Draft only, never approved", granted: false },
    ],
    actions: [
      "Reconcile last month's bank feed and list exceptions",
      "Explain the movement in gross margin quarter over quarter",
      "Chase overdue invoices with a drafted email",
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Bridge",
    tagline: "A bridge to thousands of other apps",
    description:
      "When there is no first-class connector, Zapier fills the gap. Expose the Zaps you choose and the agent can call them as tools — Slack, Notion, Sheets, anything you already automate.",
    connected: false,
    scopes: [
      { label: "List exposed Zaps", detail: "Only Zaps you explicitly share", granted: false },
      { label: "Trigger Zaps", detail: "Run a shared Zap with arguments", granted: false },
    ],
    actions: [
      "Post a daily agent digest into Slack",
      "Append task results to a Google Sheet",
      "Fan out a single request into an existing multi-app workflow",
    ],
  },
  {
    id: "lovable",
    name: "Lovable",
    category: "Builds",
    tagline: "Trigger and manage full-stack app builds",
    description:
      "The agent can kick off a Lovable build, follow it while it runs in the background, read the result and iterate — turning a described product into a deployed app.",
    connected: false,
    scopes: [
      { label: "Read projects", detail: "Project list and build history", granted: false },
      { label: "Start builds", detail: "Send build instructions", granted: false },
      { label: "Publish", detail: "Deploy to production", granted: false },
    ],
    actions: [
      "Build an internal dashboard from a spec",
      "Iterate on a page after a stakeholder review",
      "Publish once the build passes review",
    ],
  },
];

export const connectorById = (id: string) => connectors.find((c) => c.id === id);

export type Task = {
  id: string;
  title: string;
  connector: ConnectorId;
  tier: Tier;
  status: TaskStatus;
  progress: number;
  started: string;
  duration: string;
  conversationId: string;
  summary: string;
  logs: { t: string; level: "info" | "warn" | "error" | "done"; msg: string }[];
  output?: string;
};

export const tasks: Task[] = [
  {
    id: "TSK-1421",
    title: "Backtest mean-reversion EA · EURUSD M15",
    connector: "mt5",
    tier: "best",
    status: "running",
    progress: 66,
    started: "4m 12s ago",
    duration: "est. 2m 40s left",
    conversationId: "CNV-204",
    summary:
      "Compiling eurusd_ma.mq5, then running the strategy tester over 2023-01 → 2024-06 with 18 parameter permutations.",
    logs: [
      { t: "00:00", level: "info", msg: "task accepted · routed to best tier (strategy reasoning)" },
      { t: "00:04", level: "info", msg: "mt5 · connected to ICMarkets-Demo 51204882" },
      { t: "00:11", level: "info", msg: "mt5 · compile eurusd_ma.mq5 → 0 errors, 2 warnings" },
      { t: "00:19", level: "warn", msg: "tick data for 2023-03 partially cached, downloading" },
      { t: "01:48", level: "info", msg: "strategy tester · permutation 7/18 complete" },
      { t: "04:02", level: "info", msg: "strategy tester · permutation 12/18 complete" },
    ],
  },
  {
    id: "TSK-1420",
    title: "Build internal ops dashboard",
    connector: "lovable",
    tier: "medium",
    status: "running",
    progress: 38,
    started: "11m ago",
    duration: "est. 6m left",
    conversationId: "CNV-203",
    summary: "Generating pages, wiring mock data and applying the shared design system.",
    logs: [
      { t: "00:00", level: "info", msg: "task accepted · routed to medium tier (multi-step build)" },
      { t: "00:22", level: "info", msg: "lovable · project ops-dashboard created" },
      { t: "03:10", level: "info", msg: "lovable · 6 of 14 pages generated" },
    ],
  },
  {
    id: "TSK-1419",
    title: "Sync new inbound contacts to pipeline",
    connector: "hubspot",
    tier: "small",
    status: "queued",
    progress: 0,
    started: "queued 40s ago",
    duration: "waiting for connector",
    conversationId: "CNV-202",
    summary: "Waiting on HubSpot connection before the agent can enrich and assign 46 contacts.",
    logs: [{ t: "00:00", level: "warn", msg: "hubspot connector not connected · task held" }],
  },
  {
    id: "TSK-1417",
    title: "Fix failing CI workflow on release branch",
    connector: "github",
    tier: "medium",
    status: "completed",
    progress: 100,
    started: "2 hours ago",
    duration: "3m 08s",
    conversationId: "CNV-201",
    summary: "Patched the flaky snapshot test, pushed to a branch and opened PR #482.",
    output:
      "PR #482 · fix(ci): stabilise snapshot serialiser\n\n· 2 files changed, 31 insertions, 8 deletions\n· CI: 14/14 checks passing\n· Reviewer requested: @dana",
    logs: [
      { t: "00:00", level: "info", msg: "task accepted · routed to medium tier" },
      { t: "00:12", level: "info", msg: "github · read workflow run 8812 logs" },
      { t: "01:04", level: "info", msg: "github · branch fix/ci-snapshot created" },
      { t: "02:41", level: "info", msg: "github · pull request #482 opened" },
      { t: "03:08", level: "done", msg: "all checks green · task completed" },
    ],
  },
  {
    id: "TSK-1414",
    title: "Reconcile February bank feed",
    connector: "xero",
    tier: "small",
    status: "completed",
    progress: 100,
    started: "yesterday",
    duration: "1m 22s",
    conversationId: "CNV-198",
    summary: "412 transactions categorised, 6 exceptions raised for review.",
    output:
      "412 transactions reconciled\n6 exceptions require a human decision\n· 3 unmatched card payments (AUD 1,284.10)\n· 2 duplicate supplier bills\n· 1 FX rounding variance",
    logs: [
      { t: "00:00", level: "info", msg: "task accepted · routed to small tier (classification)" },
      { t: "00:48", level: "info", msg: "xero · 412 transactions read" },
      { t: "01:22", level: "done", msg: "6 exceptions written to review queue" },
    ],
  },
  {
    id: "TSK-1411",
    title: "Optimise EA parameters · XAUUSD H1",
    connector: "mt5",
    tier: "best",
    status: "failed",
    progress: 74,
    started: "yesterday",
    duration: "failed after 8m 51s",
    conversationId: "CNV-197",
    summary: "The terminal dropped the connection mid-optimisation. Safe to retry — progress is not reused.",
    output:
      "Error: terminal connection lost at permutation 41/56\nLast good checkpoint: permutation 40 (Sharpe 1.08)",
    logs: [
      { t: "00:00", level: "info", msg: "task accepted · routed to best tier" },
      { t: "05:30", level: "info", msg: "strategy tester · permutation 40/56 complete" },
      { t: "08:51", level: "error", msg: "mt5 · terminal connection lost (code 10014)" },
    ],
  },
];

export const taskById = (id: string) => tasks.find((t) => t.id === id);

export type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  steps?: { connector: ConnectorId; action: string; detail: string }[];
  taskId?: string;
  tier?: Tier;
};

export type Conversation = {
  id: string;
  title: string;
  connectorsUsed: ConnectorId[];
  updated: string;
  messages: number;
  tierMix: Tier;
  preview: string;
  thread: ChatMessage[];
};

export const conversations: Conversation[] = [
  {
    id: "CNV-204",
    title: "Mean-reversion EA · backtest and file results",
    connectorsUsed: ["mt5", "linear"],
    updated: "4 minutes ago",
    messages: 8,
    tierMix: "best",
    preview: "Backtest my mean-reversion EA on EURUSD M15 and open a Linear ticket with the results.",
    thread: [
      {
        id: "m1",
        role: "user",
        text: "Backtest my mean-reversion EA on EURUSD M15 and open a Linear ticket with the results.",
      },
      {
        id: "m2",
        role: "agent",
        tier: "best",
        text: "Routing to the best tier for strategy reasoning. I'll compile the EA, run the tester over 2023-01 → 2024-06, then file the outcome in Linear.",
        steps: [
          { connector: "mt5", action: "load strategy", detail: "eurusd_ma.mq5" },
          { connector: "mt5", action: "run backtest", detail: "2023-01 → 2024-06" },
          { connector: "linear", action: "create issue", detail: "STRAT-482" },
        ],
        taskId: "TSK-1421",
      },
    ],
  },
  {
    id: "CNV-203",
    title: "Internal ops dashboard build",
    connectorsUsed: ["lovable", "github"],
    updated: "11 minutes ago",
    messages: 12,
    tierMix: "medium",
    preview: "Build an internal ops dashboard that reads from our staging API.",
    thread: [
      { id: "m1", role: "user", text: "Build an internal ops dashboard that reads from our staging API." },
      {
        id: "m2",
        role: "agent",
        tier: "medium",
        text: "Started the build in the background — 14 pages planned. I'll push the repo to GitHub when the first pass is done.",
        steps: [
          { connector: "lovable", action: "create project", detail: "ops-dashboard" },
          { connector: "github", action: "prepare repo", detail: "acme-labs/ops-dashboard" },
        ],
        taskId: "TSK-1420",
      },
    ],
  },
  {
    id: "CNV-201",
    title: "Release branch CI failure",
    connectorsUsed: ["github"],
    updated: "2 hours ago",
    messages: 6,
    tierMix: "medium",
    preview: "CI is red on release/1.8 — find out why and fix it.",
    thread: [
      { id: "m1", role: "user", text: "CI is red on release/1.8 — find out why and fix it." },
      {
        id: "m2",
        role: "agent",
        tier: "medium",
        text: "The snapshot serialiser was non-deterministic. Patched it, pushed a branch and opened PR #482 — all 14 checks are green.",
        steps: [
          { connector: "github", action: "read workflow", detail: "run 8812" },
          { connector: "github", action: "open pull request", detail: "#482" },
        ],
        taskId: "TSK-1417",
      },
    ],
  },
  {
    id: "CNV-198",
    title: "February bookkeeping reconciliation",
    connectorsUsed: ["xero"],
    updated: "yesterday",
    messages: 4,
    tierMix: "small",
    preview: "Reconcile February and tell me what needs a human decision.",
    thread: [
      { id: "m1", role: "user", text: "Reconcile February and tell me what needs a human decision." },
      {
        id: "m2",
        role: "agent",
        tier: "small",
        text: "412 transactions reconciled. Six exceptions need you: three unmatched card payments, two duplicate supplier bills, one FX rounding variance.",
        steps: [{ connector: "xero", action: "reconcile", detail: "412 transactions" }],
        taskId: "TSK-1414",
      },
    ],
  },
  {
    id: "CNV-197",
    title: "XAUUSD parameter optimisation",
    connectorsUsed: ["mt5"],
    updated: "yesterday",
    messages: 9,
    tierMix: "best",
    preview: "Optimise the gold strategy across 56 permutations.",
    thread: [
      { id: "m1", role: "user", text: "Optimise the gold strategy across 56 permutations." },
      {
        id: "m2",
        role: "agent",
        tier: "best",
        text: "The terminal dropped at permutation 41. Nothing was lost on your side — retry when the terminal is back up.",
        steps: [{ connector: "mt5", action: "optimise", detail: "56 permutations" }],
        taskId: "TSK-1411",
      },
    ],
  },
];

export const conversationById = (id: string) => conversations.find((c) => c.id === id);

export const tierMeta: Record<Tier, { label: string; note: string; className: string }> = {
  small: { label: "Small", note: "fast · cheap", className: "text-mint" },
  medium: { label: "Medium", note: "balanced", className: "text-amber" },
  best: { label: "Best", note: "deep reasoning", className: "text-pink" },
};

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Enough to run real work and see the routing for yourself.",
    quota: "500 agent requests / month",
    priority: "Best-effort priority",
    featured: false,
    cta: "Start free",
    features: [
      "500 agent requests per month",
      "Small and medium model tiers",
      "2 connected tools",
      "5 concurrent background tasks",
      "7-day task history",
      "Community support",
    ],
    limits: ["Best tier capped at 25 requests / month", "Queued behind paid traffic at peak"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    cadence: "per user / month",
    blurb: "For individuals shipping daily with the agent in the loop.",
    quota: "10,000 agent requests / month",
    priority: "Priority processing",
    featured: true,
    cta: "Upgrade to Pro",
    features: [
      "10,000 agent requests per month",
      "All three model tiers, unmetered routing",
      "All 7 connectors",
      "25 concurrent background tasks",
      "90-day task history and logs",
      "API keys for programmatic access",
      "Email support, 1 business day",
    ],
    limits: ["Overage billed at $4 / 1,000 requests"],
  },
  {
    id: "scale",
    name: "Scale",
    price: "$199",
    cadence: "per user / month",
    blurb: "For teams running the agent against production systems.",
    quota: "Unlimited fair-use requests",
    priority: "Highest priority + reserved capacity",
    featured: false,
    cta: "Talk to us",
    features: [
      "Unlimited fair-use agent requests",
      "Reserved best-tier capacity",
      "Unlimited connectors and workspaces",
      "100 concurrent background tasks",
      "Unlimited task history with export",
      "Audit log and scope approvals",
      "SSO / SAML and role-based access",
      "Shared Slack channel, 4h response",
    ],
    limits: [],
  },
];

export const planMatrix = [
  { row: "Agent requests / month", free: "500", pro: "10,000", scale: "Unlimited (fair use)" },
  { row: "Queue priority", free: "Best effort", pro: "Priority", scale: "Highest + reserved" },
  { row: "Small tier", free: "Included", pro: "Included", scale: "Included" },
  { row: "Medium tier", free: "Included", pro: "Included", scale: "Included" },
  { row: "Best tier", free: "25 / month", pro: "Unmetered", scale: "Reserved capacity" },
  { row: "Connectors", free: "2", pro: "All 7", scale: "All 7 + custom MCP" },
  { row: "Concurrent background tasks", free: "5", pro: "25", scale: "100" },
  { row: "Task history", free: "7 days", pro: "90 days", scale: "Unlimited + export" },
  { row: "API keys", free: "—", pro: "3 keys", scale: "Unlimited" },
  { row: "Audit log", free: "—", pro: "—", scale: "Included" },
  { row: "SSO / SAML", free: "—", pro: "—", scale: "Included" },
  { row: "Support", free: "Community", pro: "Email · 1 day", scale: "Slack · 4 hours" },
];

export const usage = {
  plan: "Free",
  requestsUsed: 412,
  requestsLimit: 500,
  renewsOn: "1 April",
  concurrent: 2,
  concurrentLimit: 5,
  spend: "$0.00",
  byTier: [
    { tier: "small" as Tier, requests: 246, share: 60, cost: "$0.62" },
    { tier: "medium" as Tier, requests: 141, share: 34, cost: "$3.10" },
    { tier: "best" as Tier, requests: 25, share: 6, cost: "$4.75" },
  ],
  byConnector: [
    { id: "mt5" as ConnectorId, calls: 184 },
    { id: "github" as ConnectorId, calls: 121 },
    { id: "xero" as ConnectorId, calls: 63 },
    { id: "linear" as ConnectorId, calls: 44 },
  ],
  daily: [
    { day: "Mon", small: 34, medium: 18, best: 3 },
    { day: "Tue", small: 41, medium: 22, best: 4 },
    { day: "Wed", small: 28, medium: 31, best: 6 },
    { day: "Thu", small: 52, medium: 19, best: 2 },
    { day: "Fri", small: 44, medium: 26, best: 5 },
    { day: "Sat", small: 21, medium: 12, best: 3 },
    { day: "Sun", small: 26, medium: 13, best: 2 },
  ],
};

export const invoices = [
  { id: "INV-0007", date: "1 Mar 2026", amount: "$0.00", plan: "Free", status: "Paid" },
  { id: "INV-0006", date: "1 Feb 2026", amount: "$0.00", plan: "Free", status: "Paid" },
  { id: "INV-0005", date: "1 Jan 2026", amount: "$49.00", plan: "Pro", status: "Paid" },
  { id: "INV-0004", date: "1 Dec 2025", amount: "$49.00", plan: "Pro", status: "Paid" },
];

export const apiKeys = [
  {
    id: "key_live_8fa2",
    label: "Local development",
    prefix: "pk_live_8fa2…9c11",
    created: "12 Feb 2026",
    lastUsed: "6 minutes ago",
    scope: "Full access",
  },
  {
    id: "key_live_31bd",
    label: "CI pipeline",
    prefix: "pk_live_31bd…4e07",
    created: "3 Jan 2026",
    lastUsed: "2 days ago",
    scope: "Tasks: read",
  },
];

export const faqs = [
  {
    q: "What does “tiered model routing” actually mean?",
    a: "Every request is graded before it runs. A quick lookup goes to a small, fast model. A multi-step workflow goes to a mid-sized model. Genuinely hard work — a trading strategy, a full build — goes to the strongest model available. You get the quality where it matters and pay small-model prices for the rest.",
  },
  {
    q: "Can I choose the tier myself?",
    a: "Yes. Routing is automatic by default, but you can pin a conversation or a single message to a tier if you want to force the cheap path or the deep path.",
  },
  {
    q: "What is MCP and why does it matter?",
    a: "Model Context Protocol is an open standard for exposing tools to an AI agent. It means PINK talks to MT5, GitHub, Linear, HubSpot, Xero, Zapier and Lovable through one consistent interface — and adding a new tool doesn't require a new integration in your app.",
  },
  {
    q: "How are permissions handled for sensitive tools?",
    a: "Every connector is scope-by-scope. Trading connectors are read-and-test only until you explicitly grant live order placement. Accounting write access is off by default. Each scope is listed on the connector page and revocable at any time.",
  },
  {
    q: "What happens to a long-running job if I close the tab?",
    a: "Nothing. Background tasks run server-side. The activity indicator in the app shell picks them up again when you return, and the originating conversation keeps a live reference to the task.",
  },
  {
    q: "What is the difference between free and paid priority?",
    a: "Free requests are served best-effort: at busy times they queue behind paid traffic. Paid plans get priority processing, and Scale reserves best-tier capacity so heavy jobs start immediately.",
  },
  {
    q: "Can I use PINK without writing code?",
    a: "Yes. Most people never touch an API key — they connect a tool, describe the outcome in chat and review what the agent did. API keys exist for the people who want them.",
  },
  {
    q: "Where is my data stored?",
    a: "Conversations, task logs and connector tokens are stored encrypted at rest. Tokens are scoped per connector and never exposed to the model context.",
  },
];

export const docSections = [
  {
    slug: "getting-started",
    title: "Getting started",
    summary: "Create a workspace, connect your first tool and run your first agent task.",
    reading: "6 min",
    body: [
      { h: "1. Create your workspace", p: "Sign up with email or SSO. A workspace is the boundary for connectors, tasks, usage and billing — most people need exactly one." },
      { h: "2. Pick a plan", p: "Start on Free. You get 500 requests a month and 25 best-tier requests, which is enough to evaluate routing honestly. Upgrade later without losing history." },
      { h: "3. Connect a tool", p: "Open Connectors and authorise the tool you care about most. Grant the narrowest scope that lets the agent do the job; you can widen it later." },
      { h: "4. Describe an outcome", p: "In chat, describe the result you want rather than the steps. The agent grades the request, picks a tier, calls the tools it needs and reports back." },
      { h: "5. Let it run", p: "Anything slow becomes a background task. Keep working — the shell shows live task count, and the conversation keeps an inline reference to the task." },
    ],
  },
  {
    slug: "model-routing",
    title: "Model routing",
    summary: "How requests are graded and which tier ends up handling them.",
    reading: "5 min",
    body: [
      { h: "Grading", p: "A small classifier reads the request, the conversation context and the tools in scope, then scores complexity, risk and expected step count." },
      { h: "Tier selection", p: "Low scores go to the small tier. Mid scores go to medium. High complexity or high consequence — money, production code, live trading — is escalated to best." },
      { h: "Escalation mid-task", p: "If a medium-tier run stalls or contradicts itself, the task is re-dispatched to best automatically and the escalation is recorded on the task page." },
      { h: "Pinning a tier", p: "Pass a tier explicitly in chat or via the API when you already know what the work needs." },
    ],
  },
  {
    slug: "connect-mt5",
    title: "Connect MT5",
    summary: "Bridge a MetaTrader 5 terminal for EA authoring and backtesting.",
    reading: "8 min",
    body: [
      { h: "Requirements", p: "MetaTrader 5 build 4200 or newer, a demo or live account, and the PINK bridge running on the same machine as the terminal." },
      { h: "Install the bridge", p: "Download the bridge, run it, and paste the pairing code shown in the Connectors page. The bridge speaks MCP over an outbound connection only — no inbound ports." },
      { h: "Scopes", p: "Market history and strategy testing are enabled by default. Live order placement is a separate scope and is off until you turn it on explicitly." },
      { h: "First backtest", p: "Ask for a backtest in plain language: symbol, timeframe, date range and what you consider success. The agent compiles, runs and reports Sharpe, drawdown and win rate." },
    ],
  },
  {
    slug: "connect-github",
    title: "Connect GitHub",
    summary: "Scoped repository access for commits, pull requests and CI.",
    reading: "4 min",
    body: [
      { h: "Authorise", p: "Install the PINK GitHub app and select only the repositories the agent should see. Organisation owners can restrict this further." },
      { h: "Branch protection", p: "The agent never pushes to a protected branch. It opens a branch and a pull request, so a human review stays in the loop." },
      { h: "CI access", p: "Workflow dispatch is a separate scope. With it granted, the agent can re-run failed jobs and follow them to green as a background task." },
    ],
  },
  {
    slug: "connect-business-tools",
    title: "Connect HubSpot, Xero and Zapier",
    summary: "Business connectors, permission defaults and safe write access.",
    reading: "7 min",
    body: [
      { h: "HubSpot", p: "OAuth into your portal and choose the object types in scope. Deal-stage writes are opt-in per pipeline." },
      { h: "Xero", p: "Read access covers accounts, invoices and bank feeds. Creating invoices or bills is draft-only and never auto-approved." },
      { h: "Zapier", p: "Share individual Zaps with PINK and they appear as callable tools. Nothing is exposed until you share it." },
    ],
  },
  {
    slug: "background-tasks",
    title: "Background tasks",
    summary: "Lifecycle, statuses, retries and how tasks link back to chat.",
    reading: "5 min",
    body: [
      { h: "Lifecycle", p: "Queued → running → completed or failed. Queue time depends on plan priority and how many tasks you already have in flight." },
      { h: "Retry and cancel", p: "Failed tasks can be retried from the task page and start clean. Running tasks can be cancelled; partial output is kept." },
      { h: "Chat linkage", p: "Every task records the conversation that created it, and that conversation renders a live task card — the two surfaces are never siloed." },
    ],
  },
  {
    slug: "api-access",
    title: "API access",
    summary: "Create keys and drive the agent programmatically.",
    reading: "6 min",
    body: [
      { h: "Keys", p: "Create a key in Settings → API keys. Keys are shown once. Scope them to read-only where you can." },
      { h: "Starting a run", p: "POST a request with your prompt, optional tier pin and the connectors allowed for the run. You get a task id back immediately." },
      { h: "Polling and webhooks", p: "Poll the task id or register a webhook to be told when the task reaches a terminal state." },
    ],
  },
];

export const docBySlug = (slug: string) => docSections.find((d) => d.slug === slug);
