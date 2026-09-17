-- PINK — 004: agent services (persistent, predefined AI workers)
-- Run after 001-003.
--
-- These are NOT connectors (external tools the chat agent reaches for)
-- and NOT the generic "automation" framework floated earlier and
-- explicitly rejected -- this is the real thing: one code file per agent
-- type (app/agent_services/<name>.py on the backend), sharing only this
-- lifecycle table and the daemon process, never a forced shared config
-- shape. `service_id` is a stable string key ('telegram-signal-monitor'
-- today) matching the module that implements it; `config` is whatever
-- shape that specific module needs -- there is no shared schema for it.

create table public.user_agent_services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  service_id text not null, -- e.g. 'telegram-signal-monitor'
  config jsonb not null default '{}'::jsonb,
  status text not null default 'paused', -- 'active' | 'paused'
  paused_reason text, -- e.g. 'credits_exhausted' -- set by the system, not just the user
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, service_id)
);

create index user_agent_services_active_idx
  on public.user_agent_services (service_id)
  where status = 'active';

alter table public.user_agent_services enable row level security;

grant select, insert, update on public.user_agent_services to authenticated;
grant all on public.user_agent_services to service_role;

create policy "own agent services read" on public.user_agent_services
  for select to authenticated using (auth.uid() = user_id);
create policy "own agent services insert" on public.user_agent_services
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own agent services update" on public.user_agent_services
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------------ signals
-- Every message that passed the cheap Layer-1 filter and got a real
-- confidence score, whether or not it ended up being sent as an alert.
-- This is both the audit trail and, per the "don't lose a failed send"
-- plan, where a delivery failure is recorded rather than silently dropped.
create table public.signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  agent_service_id uuid references public.user_agent_services (id) on delete set null,
  source text not null default 'telegram',
  channel text, -- the chat/channel name the message came from
  raw_text text not null,
  confidence_score numeric,
  model_reasoning text,
  alerted boolean not null default false,
  alert_error text,
  created_at timestamptz not null default now()
);

create index signals_user_id_idx on public.signals (user_id, created_at desc);

alter table public.signals enable row level security;

grant select on public.signals to authenticated;
grant all on public.signals to service_role;

create policy "own signals read" on public.signals
  for select to authenticated using (auth.uid() = user_id);
-- No insert/update/delete for `authenticated` -- signals are only ever
-- written by the backend (service role) from the daemon/scoring task,
-- same reasoning as telegram_sessions.