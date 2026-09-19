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

update public.connector_catalog
set default_transport = 'http',
    is_active = true,
    sort_order = 5,
    description = 'Connect a cTrader account so the agent can read market data, monitor positions '
      || 'and execute approved strategy actions through the connected broker bridge. '
      || 'The bridge must be reachable over the internet — host it or expose it with an ngrok '
      || 'tunnel; local addresses cannot be reached by the agent. cTrader is the default '
      || 'trading connector for chat and the Trading Agent.'
where id = 'ctrader';

-- Existing saved connections that still point at stdio are migrated to http so
-- they stop failing silently. Their command/args are cleared.
update public.mcp_connections
set transport = 'http',
    command = null,
    args = '{}'
where transport = 'stdio';
