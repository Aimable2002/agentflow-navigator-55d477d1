-- PINK — 003: connector config fixes + native (non-MCP) connector tables
-- Run after 001_init.sql and 002_add_task_mode.sql.

-- ------------------------------------------------------------- linear fix
-- mcp.linear.app/sse is the deprecated legacy transport; the live endpoint
-- is the streamable-http one at /mcp.
update public.connector_catalog
set default_transport = 'http',
    default_server_url = 'https://mcp.linear.app/mcp'
where id = 'linear';

-- Carry the fix to any connection rows that were saved with the old
-- default and were never customised by the user (a user-typed custom URL
-- is left untouched).
update public.mcp_connections
set transport = 'http',
    server_url = 'https://mcp.linear.app/mcp'
where connector_id = 'linear'
  and transport = 'sse'
  and server_url = 'https://mcp.linear.app/sse';

-- ------------------------------------------------------------- zapier fix
-- Two problems with the old seed: (1) the URL
-- (https://mcp.zapier.com/api/mcp/mcp) doesn't match Zapier's current docs
-- (https://mcp.zapier.com/api/v1/connect), and (2) more fundamentally,
-- Zapier does not have one shared server URL at all -- each user generates
-- their own unique MCP server (their own chosen Zaps/actions) at
-- mcp.zapier.com and gets back a URL specific to them. A shared
-- default_server_url structurally cannot work here, so it's cleared:
-- the connector detail page must require the user's own generated URL,
-- not just a token against a fixed one.
update public.connector_catalog
set default_server_url = null,
    description = 'When there is no first-class connector, Zapier fills the gap. '
      || 'Generate your own MCP server at mcp.zapier.com (choosing which Zaps to expose), '
      || 'then paste that server''s unique URL and token here — Zapier does not use one shared URL for every account.'
where id = 'zapier';

-- ---------------------------------------------------------- meta ads: promote
-- Previously a frontend-only fake row (never in this table, so saving a
-- connection for it violated the mcp_connections -> connector_catalog FK).
-- It's a real MCP server (https://mcp.facebook.com/ads, launched by Meta),
-- and it does support a per-user bearer token via a Business Manager
-- System User Access Token, so it fits the same generic
-- transport/url/token shape as GitHub -- no OAuth callback route needed
-- for this version.
insert into public.connector_catalog
  (id, name, category, tagline, description, default_transport, default_server_url, scopes, actions, sort_order)
values
  ('meta-ads', 'Meta Ads', 'Advertising', 'Campaigns, delivery and performance signals',
   'Connect Meta Ads to inspect campaign performance and keep Facebook and Instagram advertising work in one agent workflow. '
     || 'Use a System User Access Token generated in Meta Business Manager (Business Settings → Users → System Users), '
     || 'not your personal login token — it does not expire on its own the way a personal user token does. '
     || 'Grant it: ads_mcp_management, ads_read, ads_management, business_management, pages_show_list, instagram_basic.',
  'http', 'https://mcp.facebook.com/ads',
   '[{"key":"ads.read","label":"Read campaign data","detail":"Campaigns, ad sets, ads and delivery","granted":true},
     {"key":"insights.read","label":"Read performance insights","detail":"Spend, reach, clicks and conversions","granted":true},
     {"key":"ads.write","label":"Manage ads","detail":"Create or update campaigns and ads","granted":false}]'::jsonb,
   '["Summarise campaign performance","Compare Facebook and Instagram delivery","Flag underperforming ad sets"]'::jsonb,
   60)
on conflict (id) do update set
  default_transport = excluded.default_transport,
  default_server_url = excluded.default_server_url,
  description = excluded.description,
  scopes = excluded.scopes,
  is_active = true;

-- ------------------------------------------------------------ whatsapp: promote
-- Also previously a frontend-only fake row. Kept as a real catalog row
-- purely for listing/display in the Connectors page; unlike every other
-- row here, transport/server_url are irrelevant and unused for it --
-- WhatsApp is not an MCP server. Its actual credentials (access token,
-- phone number id, business account id, alert recipient) live in the
-- dedicated whatsapp_credentials table below, never in mcp_connections,
-- because they don't fit a single-url/single-token shape.
insert into public.connector_catalog
  (id, name, category, tagline, description, default_transport, default_server_url, scopes, actions, sort_order)
values
  ('whatsapp', 'WhatsApp', 'Messaging', 'Receive task and signal alerts on WhatsApp',
   'Connect a WhatsApp Business number for send-only alerts when tasks finish, fail, or a monitored signal clears its threshold. '
     || 'Read access to your existing chats, groups or communities is not supported — the official WhatsApp Business API has no way to do that.',
  'http', null,
   '[{"key":"messages.send","label":"Send alerts","detail":"Deliver task and signal notifications","granted":true}]'::jsonb,
   '["Send task completion alerts","Send task failure alerts","Send threshold-clearing signal alerts"]'::jsonb,
   80)
on conflict (id) do update set
  description = excluded.description,
  scopes = excluded.scopes,
  is_active = true;

-- -------------------------------------------------------- hubspot: hide only
-- Removed from the connector *options* shown to users, per decision, but
-- the catalog row and any existing user connections are left intact
-- (is_active stays true) in case this is revisited later. The actual hide
-- happens client-side in disabledConnectorIds, matching how mt5/xero/
-- lovable are already handled -- no schema change needed for this at all.

-- ---------------------------------------------------- telegram_sessions
-- Telegram is not an MCP server -- there is no url/transport/token shape
-- for it. A "connection" here is an encrypted MTProto session string
-- (Telethon StringSession), established through an interactive OTP flow,
-- not a form the generic connector page can fill in. This table is
-- intentionally separate from mcp_connections.
create table public.telegram_sessions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  encrypted_session text,
  status text not null default 'disconnected', -- 'connected' | 'disconnected'
  monitored_chats jsonb not null default '[]'::jsonb,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.telegram_sessions enable row level security;

-- Users can see connection status/phone/monitored chats for their own row,
-- but never the encrypted session itself -- that column is intentionally
-- withheld even from the owning user via column-level grants, since it is
-- a live credential equivalent to their Telegram login. Only the backend,
-- via the service role, ever reads encrypted_session.
grant select (user_id, phone, status, monitored_chats, last_error, created_at, updated_at)
  on public.telegram_sessions to authenticated;
grant all on public.telegram_sessions to service_role;

create policy "own telegram session read" on public.telegram_sessions
  for select to authenticated using (auth.uid() = user_id);
-- No insert/update/delete policies for `authenticated`: sessions are only
-- ever written by the backend (service role) during the OTP login flow,
-- never directly from the browser.

-- ---------------------------------------------------- whatsapp_credentials
-- Same reasoning as telegram_sessions: three separate credential values
-- plus a recipient number, not a single bearer token against a shared
-- URL, so it does not belong in mcp_connections.
create table public.whatsapp_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  access_token text,
  phone_number_id text,
  business_account_id text,
  alert_recipient text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_credentials enable row level security;

-- access_token is withheld from the browser the same way auth_token is on
-- mcp_connections -- users can see everything except the token itself.
grant select (user_id, phone_number_id, business_account_id, alert_recipient, created_at, updated_at)
  on public.whatsapp_credentials to authenticated;
grant all on public.whatsapp_credentials to service_role;

create policy "own whatsapp credentials read" on public.whatsapp_credentials
  for select to authenticated using (auth.uid() = user_id);
-- Writes go through the backend's /v1/whatsapp/credentials endpoint
-- (service role), not a direct browser upsert, so the access token is
-- never round-tripped through client-side Supabase calls at all.