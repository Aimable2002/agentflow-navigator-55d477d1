export type Tier = "small" | "medium" | "best";

export type TaskStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type LogLevel = "info" | "warn" | "error" | "done";

export type McpTransport = "stdio" | "sse" | "http";

export type ConnectionStatus = "disconnected" | "connected" | "degraded";

/** Connector ids are catalogue rows in the database, so this is a string. */
export type ConnectorId = string;

export type ConnectorScope = {
  key: string;
  label: string;
  detail: string;
  granted: boolean;
};

export type CatalogConnector = {
  id: ConnectorId;
  name: string;
  category: string;
  tagline: string;
  description: string;
  default_transport: McpTransport;
  default_server_url: string | null;
  docs_url: string | null;
  scopes: ConnectorScope[];
  actions: string[];
  sort_order: number;
};

export type McpConnection = {
  id: string;
  user_id: string;
  connector_id: ConnectorId;
  status: ConnectionStatus;
  transport: McpTransport;
  server_url: string | null;
  auth_header_name: string | null;
  command: string | null;
  args: string[];
  account_label: string | null;
  scopes: ConnectorScope[];
  tool_count: number | null;
  last_sync_at: string | null;
  last_error: string | null;
};

/** Catalogue entry merged with the signed-in user's connection, if any. */
export type ConnectorView = CatalogConnector & {
  connection: McpConnection | null;
  connected: boolean;
  status: ConnectionStatus;
  transport: McpTransport;
  scopes: ConnectorScope[];
};

export type Profile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  timezone: string | null;
  plan: string;
  quota_limit: number;
  quota_used: number;
  quota_period_start: string;
  concurrent_limit: number;
  onboarded: boolean;
};

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  preview: string | null;
  tier_mix: Tier | null;
  connectors_used: ConnectorId[];
  message_count: number;
  created_at: string;
  updated_at: string;
};

export type MessageStep = {
  connector: ConnectorId;
  action: string;
  detail?: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "agent" | "system";
  content: string;
  tier: Tier | null;
  steps: MessageStep[];
  task_id: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  conversation_id: string | null;
  job_id: string | null;
  title: string;
  connector_id: ConnectorId | null;
  tier: Tier;
  status: TaskStatus;
  progress: number;
  summary: string | null;
  output: string | null;
  error: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskLog = {
  id: number;
  task_id: string;
  level: LogLevel;
  message: string;
  created_at: string;
};

export type UsageEvent = {
  id: number;
  tier: Tier;
  connector_id: ConnectorId | null;
  requests: number;
  tool_calls: number;
  cost_usd: number;
  created_at: string;
};

export type ApiKey = {
  id: string;
  label: string;
  prefix: string;
  scope: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  number: string;
  plan: string;
  amount_usd: number;
  status: string;
  issued_at: string;
  invoice_url: string | null;
};

export type NotificationPreferences = {
  user_id: string;
  task_completed: boolean;
  task_failed: boolean;
  connector_degraded: boolean;
  quota_warning: boolean;
  weekly_digest: boolean;
  product_updates: boolean;
  channel_email: boolean;
  channel_telegram: boolean;
};
