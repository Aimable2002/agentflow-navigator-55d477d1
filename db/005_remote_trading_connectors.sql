-- PINK — 005: trading connectors are network-reachable only, plus cTrader as
-- the default trading connector.
--
-- The hosted agent cannot spawn a process on the user's machine, so the stdio
-- transport is meaningless for MT5 and cTrader (and for every other connector).
-- Both rows therefore default to streamable HTTP, and the copy tells users to
-- host the bridge or expose it through an ngrok tunnel.

update public.connector_catalog
set default_transport = 'http',
    description = 'Connect a MetaTrader 5 terminal so the agent can author MQL5 Expert Advisors, '
      || 'compile them, run historical backtests and iterate on parameters. '
      || 'The MT5 bridge must be reachable over the internet: host it yourself or expose '
      || 'your local terminal with an ngrok tunnel, then paste that public URL here. '
      || 'Local addresses (localhost, 127.0.0.1, LAN IPs) cannot be reached by the agent.'
where id = 'mt5';

-- cTrader was never inserted into the live catalogue, so this adds it (and
-- keeps it in sync if it is already there).
insert into public.connector_catalog
  (id, name, category, tagline, description, default_transport, default_server_url, scopes, actions, sort_order)
values
  ('ctrader', 'cTrader', 'Trading', 'Live market data, execution and strategy orchestration',
   'Connect a cTrader account so the agent can read market data, monitor positions and execute '
     || 'approved strategy actions through the connected broker bridge. The bridge must be reachable '
     || 'over the internet — host it or expose it with an ngrok tunnel; local addresses cannot be '
     || 'reached by the agent. cTrader is the default trading connector for chat and the Trading Agent.',
   'http', null,
   '[{"key":"market.read","label":"Read market data","detail":"Symbols, candles and pricing","granted":true},
     {"key":"account.read","label":"Read account state","detail":"Balance, equity, positions","granted":true},
     {"key":"orders.write","label":"Place or manage orders","detail":"Execute approved trade actions","granted":false}]'::jsonb,
   '["Review the current market context for a pair","Compare a proposed setup against live account state","Execute approved trade actions from a validated plan"]'::jsonb,
   5)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  tagline = excluded.tagline,
  description = excluded.description,
  default_transport = excluded.default_transport,
  scopes = excluded.scopes,
  actions = excluded.actions,
  sort_order = excluded.sort_order,
  is_active = true;

-- Existing saved connections that still point at stdio are migrated to http so
-- they stop failing silently. Their command/args are cleared.
update public.mcp_connections
set transport = 'http',
    command = null,
    args = '{}'
where transport = 'stdio';
