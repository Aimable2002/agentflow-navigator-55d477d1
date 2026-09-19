-- PINK — 007: apply the final connector classifications to an existing Supabase database.
-- Run this entire file in Supabase SQL Editor after migrations 001-005.
--
-- MCP connectors use mcp_connections and an MCP transport/URL.
-- Native connectors use their own provider-specific integration flow.

alter table public.connector_catalog
  add column if not exists kind text not null default 'mcp';

alter table public.connector_catalog
  drop constraint if exists connector_catalog_kind_check;

alter table public.connector_catalog
  add constraint connector_catalog_kind_check
  check (kind in ('mcp', 'native'));

alter table public.connector_catalog
  alter column default_transport drop not null;

-- MT5 is an MCP connector. The user supplies the reachable MCP server URL;
-- the frontend does not care whether it is hosted or exposed through a tunnel.
update public.connector_catalog
set kind = 'mcp',
    default_transport = 'http',
    description = 'Connect a MetaTrader 5 MCP server that can reach your terminal. '
      || 'The server URL must be reachable by the agent; whether you host it publicly '
      || 'or use a tunnel such as ngrok is up to you.'
where id = 'mt5';

-- cTrader uses cTrader Open API OAuth/account authorization, not MCP.
update public.connector_catalog
set kind = 'native',
    default_transport = null,
    docs_url = 'https://help.ctrader.com/open-api/account-authentication/',
    description = 'Connect a cTrader account through cTrader Open API OAuth and the '
      || 'native trading integration managed by the agent backend. cTrader is not '
      || 'an MCP server and does not use a server URL or MCP transport.'
where id = 'ctrader';

-- These integrations already have provider-specific flows and do not belong in
-- mcp_connections.
update public.connector_catalog
set kind = 'native',
    default_transport = null
where id in ('telegram', 'whatsapp', 'lovable');

-- These integrations remain MCP connectors.
update public.connector_catalog
set kind = 'mcp'
where id in ('github', 'linear', 'hubspot', 'xero', 'zapier', 'meta-ads');

-- Keep the legacy MT5 bridge reachable over the network if an older migration
-- created it with stdio. This does not create or alter user credentials.
update public.mcp_connections
set transport = 'http',
    command = null,
    args = '[]'::jsonb
where connector_id = 'mt5'
  and transport = 'stdio';
