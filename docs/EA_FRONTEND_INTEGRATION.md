# MT5 EA frontend integration

## Environment

- `VITE_PINK_API_URL`: backend base URL used by the same-origin server proxy. Protected requests forward the signed-in Supabase `Authorization: Bearer <access-token>` header.
- `VITE_MT5_EA_DOWNLOAD_URL`: trusted EA release URL. Leave unset until a real release is published. The UI then shows `EA release not published yet` and disables download.
- Supabase client settings remain `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never put service-role or provider secrets in the frontend.

## Frontend routes

- `/app/agent-services`: Phase 1 service index.
- `/app/agent-services/telegram-signal-monitor`: Telegram monitor configuration and parsed signals.
- `/app/agent-services/trading-agent`: Trading Agent configuration and generated signals.
- `/app/agent-services/mt5-ea`: MT5 order queue, execution history, installation setup, release download, and safety state.

## Backend API

The server proxy in `src/lib/pink.functions.ts` forwards the authenticated request to:

- `GET /v1/ea/orders?limit=50&client_id={installation_id}`
- `POST /v1/ea/orders/{order_id}/claim?client_id={installation_id}`
- `POST /v1/ea/orders/{order_id}/execution`

The browser does not execute trades. The EA claims and executes orders, then posts the receipt. A signal is never presented as successfully traded without an execution receipt.

## Supabase tables

- `trade_orders`: authoritative user-scoped order queue and status.
- `trade_executions`: broker receipts joined to an order.
- `signals`: original parsed signal and raw Telegram message.

The history query uses the authenticated Supabase client and RLS. `trade_orders` Realtime events invalidate queries only; the UI refetches the authoritative rows. Focus, reconnect, and network recovery also refetch. If Realtime cannot connect, the order query keeps a conservative polling fallback.

Apply `migrations/004_ea_trade_execution.sql` and publish `public.trade_orders` for Realtime before enabling the workflow.

## Backend follow-ups

The `dev` backend does not currently expose endpoints for EA installation registration, heartbeat/last-seen, MT5 account or broker metadata, EA version, global execution pause, per-installation pause, or execution-history over the EA API. The UI marks these as unavailable rather than fabricating values. The local installation ID and paused marker are frontend preferences only and do not protect an account or stop dispatch.

Smallest additions needed:

1. Authenticated installation CRUD/heartbeat endpoint with installation ID, MT5 account, broker/server, version, last heartbeat, and enabled state.
2. Authenticated global and per-installation pause endpoint enforced by order creation/claim logic.
3. Authenticated paginated execution-history endpoint if direct RLS history reads should not remain part of the frontend contract.
4. A signed release URL or trusted public release URL for `ea-releases/mt5/pink-ai-ea.ex5`.
