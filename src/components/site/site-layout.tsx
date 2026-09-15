import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/pink/primitives";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/use-cases", label: "Use cases" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/docs", label: "Docs" },
  { to: "/pricing", label: "Pricing" },
] as const;

function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
        <Link to="/" aria-label="PINK home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-fog lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="transition-colors hover:text-white"
              activeProps={{ className: "text-white" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link to="/login" className="hidden text-sm text-fog transition-colors hover:text-white sm:inline">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-pink px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-white"
          >
            Start free
          </Link>
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="text-fog lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-ink2 px-6 py-4 lg:hidden">
          <ul className="space-y-3 text-sm text-fog">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/login" onClick={() => setOpen(false)} className="hover:text-white">
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Logo size="sm" />
          <span className="font-mono text-xs text-mute">/ agentic ai platform</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-fog">
          <Link to="/docs" className="hover:text-white">
            Docs
          </Link>
          <Link to="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link to="/about" className="hover:text-white">
            About
          </Link>
          <Link to="/support" className="hover:text-white">
            Support
          </Link>
          <Link to="/contact" className="hover:text-white">
            Contact
          </Link>
          <Link to="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-white">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-pink">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight lg:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fog">{copy}</p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="border-t border-line bg-ink2">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-14 lg:flex-row lg:items-center">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
            Put the agent to work in the tools you already run.
          </h2>
          <p className="mt-3 max-w-xl text-fog">
            Free tier, no card. Connect one tool and give it something real to do.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <Link
            to="/signup"
            className="rounded-md bg-pink px-5 py-3 font-medium text-ink transition-colors hover:bg-white"
          >
            Start building free
          </Link>
          <Link
            to="/how-it-works"
            className="rounded-md border border-line px-5 py-3 text-white transition-colors hover:bg-panel"
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
