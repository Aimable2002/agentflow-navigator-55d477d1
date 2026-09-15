-- PINK — initial schema for the Supabase project
-- Run this in the Supabase SQL editor of https://vnnspuyxxqvcdeafzyoe.supabase.co
-- (Dashboard → SQL editor → New query → paste → Run).
--
-- Backing store for: profiles/quota, the MCP connector catalogue, per-user MCP
-- connections (stdio, SSE and streamable HTTP), conversations, messages,
-- background tasks + logs, usage, API keys, invoices and notification prefs.

-- ---------------------------------------------------------------- enums
create type public.model_tier as enum ('small', 'medium', 'best');
create type public.task_status as enum ('queued', 'running', 'completed', 'failed', 'cancelled');
create type public.log_level as enum ('info', 'warn', 'error', 'done');
create type public.mcp_transport as enum ('stdio', 'sse', 'http');
create type public.connection_status as enum ('disconnected', 'connected', 'degraded');

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  company text,
  timezone text default 'UTC',
  plan text not null default 'free',
  quota_limit integer not null default 500,
  quota_used integer not null default 0,
  quota_period_start timestamptz not null default date_trunc('month', now()),
  concurrent_limit integer not null default 5,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "own profile read" on public.profiles
  for select to authenticated using (auth.uid() = user_id);
create policy "own profile insert" on public.profiles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own profile update" on public.profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- connector catalogue
create table public.connector_catalog (
  id text primary key,
  name text not null,
  category text not null,
  tagline text not null,
  description text not null,
  default_transport public.mcp_transport not null default 'http',
  default_server_url text,
  docs_url text,
  scopes jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  sort_order integer not null default 100,
  is_active boolean not null default true
);

grant select on public.connector_catalog to anon, authenticated;
grant all on public.connector_catalog to service_role;
alter table public.connector_catalog enable row level security;

create policy "catalog is public" on public.connector_catalog
  for select to anon, authenticated using (is_active);

insert into public.connector_catalog
  (id, name, category, tagline, description, default_transport, default_server_url, scopes, actions, sort_order)
values
  ('mt5', 'MT5', 'Trading', 'Write, backtest and iterate Expert Advisors',
   'Connect a MetaTrader 5 terminal so the agent can author MQL5 Expert Advisors, compile them, run historical backtests across symbols and timeframes, and iterate on parameters until the strategy holds up.',
   'stdio', null,
   '[{"key":"market.read","label":"Read market history","detail":"Symbols, timeframes, tick data","granted":true},
     {"key":"strategy.run","label":"Compile & run strategies","detail":"Strategy tester, optimisation runs","granted":true},
     {"key":"account.read","label":"Read account state","detail":"Balance, equity, open positions","granted":true},
     {"key":"orders.write","label":"Place live orders","detail":"Execute trades on a live account","granted":false}]'::jsonb,
   '["Write an EA from a plain-English strategy brief","Backtest over a date range and report Sharpe, drawdown, win rate","Optimise parameters and compare runs side by side","Explain why a strategy underperformed"]'::jsonb,
   10),
  ('github', 'GitHub', 'Code', 'Files, commits, pull requests, CI',
   'Give the agent scoped access to repositories so it can read code, open branches, commit changes, raise pull requests and watch CI workflows through to green.',
   'http', 'https://api.githubcopilot.com/mcp/',
   '[{"key":"repo.read","label":"Read repository contents","detail":"Files, history, branches","granted":true},
     {"key":"repo.write","label":"Write commits & branches","detail":"Push to non-protected branches","granted":true},
     {"key":"pr.manage","label":"Manage pull requests","detail":"Open, comment, request review","granted":true},
     {"key":"actions.dispatch","label":"Trigger workflows","detail":"Dispatch and re-run CI jobs","granted":false}]'::jsonb,
   '["Open a pull request implementing an issue","Summarise what changed in the last release","Fix a failing CI job and push the patch","Audit a repo for stale dependencies"]'::jsonb,
   20),
  ('linear', 'Linear', 'Tracking', 'Issues, cycles and project state',
   'Let the agent file, triage and update issues so the work it performs is always reflected in your tracker — no manual copy-paste between the agent and the team board.',
   'sse', 'https://mcp.linear.app/sse',
   '[{"key":"issues.read","label":"Read issues & projects","detail":"Teams, cycles, labels","granted":true},
     {"key":"issues.write","label":"Create & update issues","detail":"Title, body, assignee, status","granted":true},
     {"key":"issues.comment","label":"Comment on issues","detail":"Post agent findings as comments","granted":true},
     {"key":"issues.delete","label":"Delete issues","detail":"Permanently remove issues","granted":false}]'::jsonb,
   '["File a bug with reproduction steps from a chat thread","Draft the next cycle from open customer requests","Post backtest results onto the tracking issue"]'::jsonb,
   30),
  ('telegram', 'Telegram', 'Messaging', 'Talk to the agent and get task alerts in chat',
   'Bridge a Telegram bot so the agent can message you when a background task finishes, send reports to a chat or group, and accept new instructions from your phone without opening the dashboard.',
   'http', null,
   '[{"key":"messages.send","label":"Send messages","detail":"Post updates to the chats you allow","granted":true},
     {"key":"messages.read","label":"Read incoming messages","detail":"Accept instructions sent to the bot","granted":true},
     {"key":"files.send","label":"Send files","detail":"Attach reports, logs and exports","granted":false},
     {"key":"chats.manage","label":"Manage chats","detail":"Join or leave groups on your behalf","granted":false}]'::jsonb,
   '["Ping me on Telegram when a backtest finishes","Send the weekly pipeline summary to a group","Start a task from a message on my phone","Forward failed task logs for a quick look"]'::jsonb,
   40),
  ('hubspot', 'HubSpot', 'CRM', 'Contacts, deals and pipeline hygiene',
   'Keep the pipeline clean without living in the CRM. The agent can enrich contacts, move deals, log activity and answer questions about pipeline health in plain language.',
   'http', 'https://mcp.hubspot.com/anthropic',
   '[{"key":"crm.read","label":"Read contacts & companies","detail":"Properties and associations","granted":false},
     {"key":"deals.write","label":"Read & update deals","detail":"Stage, amount, owner","granted":false},
     {"key":"activity.log","label":"Log activity","detail":"Notes, calls, emails","granted":false}]'::jsonb,
   '["Summarise the pipeline and flag stalled deals","Enrich new inbound contacts and assign an owner","Draft follow-ups for deals gone quiet"]'::jsonb,
   50),
  ('xero', 'Xero', 'Accounting', 'Bookkeeping, invoices and reconciliation',
   'Financial data is handled read-first: the agent reconciles, categorises and reports, and only writes when you grant explicit write scope for invoices and bills.',
   'http', 'https://mcp.xero.com/mcp',
   '[{"key":"accounting.read","label":"Read accounting data","detail":"Accounts, invoices, bank feeds","granted":false},
     {"key":"txn.categorise","label":"Categorise transactions","detail":"Suggest and apply account codes","granted":false},
     {"key":"invoices.write","label":"Create invoices & bills","detail":"Draft only, never approved","granted":false}]'::jsonb,
   '["Reconcile last month''s bank feed and list exceptions","Explain the movement in gross margin quarter over quarter","Chase overdue invoices with a drafted email"]'::jsonb,
   60),
  ('zapier', 'Zapier', 'Bridge', 'A bridge to thousands of other apps',
   'When there is no first-class connector, Zapier fills the gap. Expose the Zaps you choose and the agent can call them as tools — Slack, Notion, Sheets, anything you already automate.',
   'http', 'https://mcp.zapier.com/api/mcp/mcp',
   '[{"key":"zaps.list","label":"List exposed Zaps","detail":"Only Zaps you explicitly share","granted":false},
     {"key":"zaps.run","label":"Trigger Zaps","detail":"Run a shared Zap with arguments","granted":false}]'::jsonb,
   '["Post a daily agent digest into Slack","Append task results to a Google Sheet","Fan out a single request into an existing multi-app workflow"]'::jsonb,
   70),
  ('lovable', 'Lovable', 'Builds', 'Trigger and manage full-stack app builds',
   'The agent can kick off a Lovable build, follow it while it runs in the background, read the result and iterate — turning a described product into a deployed app.',
   'http', null,
   '[{"key":"projects.read","label":"Read projects","detail":"Project list and build history","granted":false},
     {"key":"builds.start","label":"Start builds","detail":"Send build instructions","granted":false},
     {"key":"publish","label":"Publish","detail":"Deploy to production","granted":false}]'::jsonb,
   '["Build an internal dashboard from a spec","Iterate on a page after a stakeholder review","Publish once the build passes review"]'::jsonb,
   80);

-- ---------------------------------------------------------------- mcp connections
create table public.mcp_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  connector_id text not null references public.connector_catalog (id),
  status public.connection_status not null default 'disconnected',
  transport public.mcp_transport not null default 'http',
  -- remote transports (sse / streamable http)
  server_url text,
  auth_header_name text default 'Authorization',
  auth_token text,
  -- stdio transport (a local bridge, e.g. the MT5 bridge)
  command text,
  args jsonb not null default '[]'::jsonb,
  env jsonb not null default '{}'::jsonb,
  account_label text,
  scopes jsonb not null default '[]'::jsonb,
  tool_count integer,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, connector_id)
);

create index mcp_connections_user_idx on public.mcp_connections (user_id);

-- auth_token stays server-only: the agent backend reads it with the service
-- role. Column-level grants keep it out of every browser query.
grant select (id, user_id, connector_id, status, transport, server_url, auth_header_name,
              command, args, account_label, scopes, tool_count, last_sync_at, last_error,
              created_at, updated_at)
  on public.mcp_connections to authenticated;
grant insert (user_id, connector_id, status, transport, server_url, auth_header_name, auth_token,
              command, args, env, account_label, scopes)
  on public.mcp_connections to authenticated;
grant update (status, transport, server_url, auth_header_name, auth_token, command, args, env,
              account_label, scopes, updated_at)
  on public.mcp_connections to authenticated;
grant delete on public.mcp_connections to authenticated;
grant all on public.mcp_connections to service_role;

alter table public.mcp_connections enable row level security;

create policy "own connections read" on public.mcp_connections
  for select to authenticated using (auth.uid() = user_id);
create policy "own connections insert" on public.mcp_connections
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own connections update" on public.mcp_connections
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own connections delete" on public.mcp_connections
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------- conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'New conversation',
  preview text,
  tier_mix public.model_tier,
  connectors_used text[] not null default '{}',
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_user_idx on public.conversations (user_id, updated_at desc);

grant select, insert, update, delete on public.conversations to authenticated;
grant all on public.conversations to service_role;
alter table public.conversations enable row level security;

create policy "own conversations" on public.conversations
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  job_id text,
  title text not null,
  connector_id text references public.connector_catalog (id),
  tier public.model_tier not null default 'medium',
  status public.task_status not null default 'queued',
  progress integer not null default 0,
  summary text,
  output text,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_idx on public.tasks (user_id, created_at desc);
create index tasks_job_idx on public.tasks (job_id);

grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;

create policy "own tasks" on public.tasks
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'agent', 'system')),
  content text not null default '',
  tier public.model_tier,
  steps jsonb not null default '[]'::jsonb,
  task_id uuid references public.tasks (id) on delete set null,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

grant select, insert, update, delete on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;

create policy "own messages" on public.messages
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- task logs
create table public.task_logs (
  id bigserial primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  level public.log_level not null default 'info',
  message text not null,
  created_at timestamptz not null default now()
);

create index task_logs_task_idx on public.task_logs (task_id, created_at);

grant select, insert on public.task_logs to authenticated;
grant all on public.task_logs to service_role;
alter table public.task_logs enable row level security;

create policy "own task logs read" on public.task_logs
  for select to authenticated using (auth.uid() = user_id);
create policy "own task logs insert" on public.task_logs
  for insert to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- usage
create table public.usage_events (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  tier public.model_tier not null,
  connector_id text references public.connector_catalog (id),
  requests integer not null default 1,
  tool_calls integer not null default 0,
  cost_usd numeric(10, 4) not null default 0,
  created_at timestamptz not null default now()
);

create index usage_events_user_idx on public.usage_events (user_id, created_at desc);

grant select, insert on public.usage_events to authenticated;
grant all on public.usage_events to service_role;
alter table public.usage_events enable row level security;

create policy "own usage read" on public.usage_events
  for select to authenticated using (auth.uid() = user_id);
create policy "own usage insert" on public.usage_events
  for insert to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- api keys
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  prefix text not null,
  key_hash text not null,
  scope text not null default 'full',
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index api_keys_user_idx on public.api_keys (user_id, created_at desc);

grant select (id, user_id, label, prefix, scope, last_used_at, revoked_at, created_at)
  on public.api_keys to authenticated;
grant insert (user_id, label, prefix, key_hash, scope) on public.api_keys to authenticated;
grant update (label, revoked_at) on public.api_keys to authenticated;
grant delete on public.api_keys to authenticated;
grant all on public.api_keys to service_role;

alter table public.api_keys enable row level security;

create policy "own api keys read" on public.api_keys
  for select to authenticated using (auth.uid() = user_id);
create policy "own api keys insert" on public.api_keys
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own api keys update" on public.api_keys
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own api keys delete" on public.api_keys
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------- invoices
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  number text not null,
  plan text not null,
  amount_usd numeric(10, 2) not null default 0,
  status text not null default 'paid',
  issued_at timestamptz not null default now(),
  invoice_url text
);

create index invoices_user_idx on public.invoices (user_id, issued_at desc);

grant select on public.invoices to authenticated;
grant all on public.invoices to service_role;
alter table public.invoices enable row level security;

create policy "own invoices read" on public.invoices
  for select to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------- notification prefs
create table public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  task_completed boolean not null default true,
  task_failed boolean not null default true,
  connector_degraded boolean not null default true,
  quota_warning boolean not null default true,
  weekly_digest boolean not null default false,
  product_updates boolean not null default false,
  channel_email boolean not null default true,
  channel_telegram boolean not null default false,
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.notification_preferences to authenticated;
grant all on public.notification_preferences to service_role;
alter table public.notification_preferences enable row level security;

create policy "own prefs" on public.notification_preferences
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- new user bootstrap
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (user_id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- quota helper
create or replace function public.increment_quota(_user_id uuid, _requests integer default 1)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set quota_used = case
           when quota_period_start < date_trunc('month', now()) then _requests
           else quota_used + _requests
         end,
         quota_period_start = greatest(quota_period_start, date_trunc('month', now())),
         updated_at = now()
   where user_id = _user_id;
$$;

revoke all on function public.increment_quota(uuid, integer) from public, anon, authenticated;
grant execute on function public.increment_quota(uuid, integer) to service_role;

-- ---------------------------------------------------------------- realtime
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.task_logs;
alter publication supabase_realtime add table public.messages;
