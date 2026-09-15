import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Activity,
  CreditCard,
  Gauge,
  KeyRound,
  ListTree,
  MessageSquarePlus,
  MessagesSquare,
  Plug,
  Settings,
  Bell,
  UserRound,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, ActivityBars, Meter, StatusPill, TierBadge } from "@/components/pink/primitives";
import { useProfile, useTasks } from "@/lib/queries";
import { initials, signOut, useSession } from "@/lib/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "@tanstack/react-router";
import { planLabel, shortId, taskDuration } from "@/lib/format";

const primaryNav = [
  { to: "/app", label: "Overview", icon: Gauge, exact: true },
  { to: "/app/chat", label: "Chat", icon: MessagesSquare },
  { to: "/app/conversations", label: "Conversations", icon: ListTree },
  { to: "/app/tasks", label: "Tasks", icon: Activity },
  { to: "/app/connectors", label: "Connectors", icon: Plug },
] as const;

const accountNav = [
  { to: "/app/usage", label: "Usage", icon: Gauge },
  { to: "/app/billing", label: "Billing", icon: CreditCard },
  { to: "/app/settings/account", label: "Account", icon: UserRound },
  { to: "/app/settings/api-keys", label: "API keys", icon: KeyRound },
  { to: "/app/settings/notifications", label: "Notifications", icon: Bell },
] as const;

function NavItem({
  to,
  label,
  icon: Icon,
  exact,
}: {
  to: string;
  label: string;
  icon: typeof Gauge;
  exact?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-panel text-white" : "text-fog hover:bg-panel/60 hover:text-white",
      )}
    >
      <Icon className={cn("size-4", active ? "text-pink" : "text-mute")} />
      {label}
    </Link>
  );
}

function TaskActivityIndicator() {
  const { data: tasks = [] } = useTasks();
  const running = tasks.filter((t) => t.status === "running");
  const queued = tasks.filter((t) => t.status === "queued");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 rounded-md border border-line bg-ink2 px-3 py-2 text-left transition-colors hover:border-mint/40"
        >
          <ActivityBars />
          <span className="font-mono text-xs text-mint">{running.length} tasks running</span>
          <span className="font-mono text-xs text-mute">{queued.length} queued</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-line bg-ink2 p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Live activity</span>
          <Link to="/app/tasks" className="font-mono text-[11px] text-fog hover:text-white">
            All tasks →
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {running.length + queued.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-mute">Nothing running right now.</li>
          )}
          {[...running, ...queued].map((t) => (
            <li key={t.id}>
              <Link to="/app/tasks/$taskId" params={{ taskId: t.id }} className="block px-4 py-3 hover:bg-panel/60">
                <div className="flex items-center gap-2">
                  <StatusPill status={t.status} />
                  <TierBadge tier={t.tier} className="ml-auto" />
                </div>
                <p className="mt-1.5 text-xs text-white">{t.title}</p>
                <div className="mt-2">
                  <Meter value={t.progress} tone={t.status === "running" ? "violet" : "mute"} />
                </div>
                <p className="mt-1.5 font-mono text-[10px] text-mute">
                  {shortId(t.id)} · {taskDuration(t)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();
  const { user } = useSession();
  const navigate = useNavigate();
  const used = profile?.quota_used ?? 0;
  const limit = profile?.quota_limit ?? 500;
  const pct = Math.round((used / Math.max(1, limit)) * 100);
  return (
    <div className="flex min-h-screen bg-ink text-white">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-ink2 lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Link to="/" aria-label="PINK home">
            <Logo size="sm" />
          </Link>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
            {planLabel(profile?.plan)}
          </span>
        </div>

        <div className="p-3">
          <Link
            to="/app/chat"
            className="flex items-center justify-center gap-2 rounded-md bg-pink px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
          >
            <MessageSquarePlus className="size-4" />
            New conversation
          </Link>
        </div>

        <nav className="space-y-1 px-3">
          {primaryNav.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>

        <div className="mt-6 px-3">
          <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Account</p>
          <nav className="space-y-1">
            {accountNav.map((n) => (
              <NavItem key={n.to} {...n} />
            ))}
          </nav>
        </div>

        <div className="mt-auto space-y-3 border-t border-line p-4">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em]">
              <span className="text-mute">Requests</span>
              <span className="text-fog">
                {used} / {limit}
              </span>
            </div>
            <div className="mt-2">
              <Meter value={pct} tone={pct > 80 ? "pink" : "mute"} />
            </div>
            <Link to="/app/billing" className="mt-2 inline-block font-mono text-[11px] text-pink hover:underline">
              Upgrade for priority →
            </Link>
          </div>
          <div className="flex items-center gap-2.5 border-t border-line pt-3">
            <span className="grid size-7 place-items-center rounded-md bg-panel font-mono text-[11px] text-fog">
              {initials(user, profile?.full_name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-white">{profile?.full_name ?? user?.email ?? "Your account"}</p>
              <p className="truncate font-mono text-[10px] text-mute">{profile?.email ?? user?.email ?? ""}</p>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              onClick={async () => {
                await signOut();
                void navigate({ to: "/login" });
              }}
              className="ml-auto text-mute hover:text-white"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-ink/95 px-4 backdrop-blur lg:px-6">
          <Link to="/app" className="lg:hidden" aria-label="PINK dashboard">
            <Logo size="sm" withWordmark={false} />
          </Link>
          <Link
            to="/app/chat"
            className="flex items-center gap-2 rounded-md border border-line bg-ink2 px-3 py-2 text-sm text-fog transition-colors hover:border-pink/40 hover:text-white"
          >
            <MessageSquarePlus className="size-4 text-pink" />
            <span className="hidden sm:inline">New conversation</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <TaskActivityIndicator />
            <Link
              to="/app/settings/notifications"
              aria-label="Notification preferences"
              className="hidden rounded-md border border-line bg-ink2 p-2 text-mute transition-colors hover:text-white sm:block"
            >
              <Settings className="size-4" />
            </Link>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-ink2 px-4 py-2 lg:hidden">
          {[...primaryNav, ...accountNav].map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-fog hover:bg-panel hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  copy,
  actions,
}: {
  title: string;
  copy?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line px-4 py-6 lg:flex-row lg:items-center lg:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {copy && <p className="mt-2 max-w-2xl text-sm text-fog">{copy}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 lg:ml-auto">{actions}</div>}
    </div>
  );
}
