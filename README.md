# AgentFlow Navigator

name this platform PINK

Build the full frontend for a production-grade AI agent platform. This is not a demo — treat every page as something a real paying customer will use. Mock data is acceptable where a live backend isn't connected yet, but the presentation, polish, and completeness of every page must be production level, not placeholder-looking.

What this platform is

This is an agentic AI platform that routes user requests across multiple AI model tiers (small, medium, best) to balance cost and quality automatically, and connects to external tools and apps via MCP (Model Context Protocol) connectors so the AI agent can actually take action in those tools — not just talk about them.

The connected tools/services this platform supports:

MT5 (trading — EA writing, backtesting, strategy iteration)

GitHub (code, files, commits, pull requests, CI/CD workflows)

Linear (issue and task tracking)

HubSpot (CRM)

Xero (accounting and bookkeeping)

Zapier (bridge to thousands of additional apps)

Lovable itself (the platform can trigger and manage full-stack app builds)

Users connect the tools they want, then interact with an AI agent (via chat) that can reason, call tools in those connected apps, and carry out multi-step work — including work that runs in the background and takes time to complete (e.g. a trading backtest, a code build, a data sync).

Who uses this

Both technical and non-technical users. Developers may use MT5/GitHub connectors. Business users may use HubSpot/Xero. The platform needs to feel approachable to a newcomer while still being credible to a technical evaluator.

Pricing model to reflect in the UI

Free tier and paid tier(s) exist. Free tier requests are served with best-effort priority; paid tier requests get priority processing. There is a usage/quota concept (free tier has limits; paid tier has higher or unlimited allowances depending on plan). Exact pricing numbers can be placeholder/mock — the important thing is the plan comparison and upgrade path are real, clear, and convincing.

Required pages

Public / marketing

Landing page — this is the primary first-impression page for new visitors, needs to sell the product's value clearly

Pricing page — plan comparison, free vs paid tiers, upgrade CTA

Features / service page — explains what the platform does and its core capabilities (tiered AI routing, MCP connectors, background agent tasks)

Use cases page — showcases the supported connectors (MT5, GitHub, Linear, HubSpot, Xero, Zapier, Lovable) and what's possible with each

How it works page — explains the concept of tiered model routing and connected tools in a way a non-technical visitor can follow

About page

Support / help center page — FAQ and contact paths

Contact page

Documentation page(s) — getting started, connector setup guides (content can be placeholder/mock)

Legal pages — Terms of Service, Privacy Policy

404 / not found page

Auth

Sign up

Log in

Forgot password / reset password

Email verification

Onboarding flow — guides a brand-new user to pick a plan and connect their first tool before landing in the main dashboard

Core app / dashboard (all pages below share a persistent app shell — see "Global experience" section)

Dashboard home / overview — snapshot of account activity, connected tools, recent agent activity, usage at a glance

Chat / agent interface — the primary way users interact with the AI agent; supports ongoing conversation and shows when the agent has taken an action or started a background task

Conversation history — list of past chat sessions

Conversation detail — a single past conversation, viewable in full

Connectors page — shows all available connectors (MT5, GitHub, Linear, HubSpot, Xero, Zapier, Lovable), which are connected vs. available to connect, and connection status

Connector detail / configuration page — settings and permission scope for a single connected tool

Tasks / background jobs page — a dedicated view of everything the agent is running or has run in the background (e.g. a backtest, a code build, a data sync), with status (queued, running, completed, failed) and which model tier handled it

Task detail page — full detail and output/log of a single background task, with retry (if failed) and cancel (if running) actions

Usage & billing overview — current usage against plan quota, cost breakdown

Billing / subscription management — plan selection, payment method, invoice history

Account settings — profile, email, password

API keys settings — for users who want programmatic access

Notification preferences settings

Global experience (applies across the entire dashboard, not a separate page)

Every dashboard page shares one consistent, persistent shell so the user never loses context:

Navigation to every core dashboard area (chat, tasks, connectors, billing, settings) must be reachable from anywhere in one action

A persistent, always-visible indicator of background task activity (e.g. "2 tasks running") that gives a quick-glance view without leaving the current page, with a path into the full Tasks page for detail

A persistent way to start a new agent conversation/action from anywhere, not only from one dedicated starting page

When the agent starts a background task from within a chat conversation, that conversation should show an inline status reference to the task (not force the user to separately hunt for it on the Tasks page) — the two surfaces should feel connected, not siloed

This platform should feel like a single coherent guided system — the kind of experience where a user always knows where they are, what the agent is doing, and what to do next — similar in spirit to how modern agentic coding and automation platforms tie chat, background execution, and configuration together into one continuous experience, rather than isolated disconnected pages.

Design direction

You have full creative ownership of the visual design, layout, component structure, and page organization. Do not treat this as a generic SaaS template — this is an AI-native, agent-driven product, and the design should communicate that: intelligence, automation, and trustworthy handling of real user actions (trading, code, financial data) across connected third-party tools. Make deliberate, considered design choices rather than defaulting to the most common dashboard pattern. Mock data is fine throughout, but every page should look and feel like a finished, live product a customer could use today.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/69938974-707b-4626-bfff-81d699a8f886).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
