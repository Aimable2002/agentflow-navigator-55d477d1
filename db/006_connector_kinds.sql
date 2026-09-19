-- PINK — 006: distinguish MCP connectors from native integrations.
-- Native integrations use their provider's own OAuth/API/session flow and do
-- not belong in mcp_connections.

alter table public.connector_catalog
  add column if not exists kind text not null default 'mcp';

alter table public.connector_catalog
  drop constraint if exists connector_catalog_kind_check;

alter table public.connector_catalog
  add constraint connector_catalog_kind_check check (kind in ('mcp', 'native'));

alter table public.connector_catalog
  alter column default_transport drop not null;

update public.connector_catalog
set kind = 'native',
    default_transport = null
where id in ('mt5', 'ctrader', 'telegram', 'whatsapp', 'lovable');

update public.connector_catalog
set kind = 'mcp'
where id in ('github', 'linear', 'hubspot', 'xero', 'zapier', 'meta-ads');

update public.connector_catalog
set description = 'Connect a MetaTrader 5 account through the native trading integration managed by the agent backend. '
      || 'MT5 is not an MCP server and does not use a server URL or MCP transport.',
    default_transport = null
where id = 'mt5';

update public.connector_catalog
set description = 'Connect a cTrader account through cTrader Open API OAuth and the native trading integration managed by the agent backend. '
      || 'cTrader is not an MCP server and does not use a server URL or MCP transport.',
    default_transport = null,
    docs_url = 'https://help.ctrader.com/open-api/account-authentication/'
where id = 'ctrader';

update public.connector_catalog
set default_transport = null
where id in ('telegram', 'whatsapp', 'lovable');

-- Older migrations represented native trading bridges as MCP connections.
-- Leave those rows intact for backend-owned migration/cleanup, but the client
-- no longer reads them as MCP connections.