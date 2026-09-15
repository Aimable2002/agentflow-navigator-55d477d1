import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, inputClass, submitClass } from "@/components/auth/auth-layout";
import { signUpWithEmail } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your PINK account" },
      {
        name: "description",
        content: "Start free on PINK: 500 agent requests a month, two connectors and background task execution.",
      },
      { property: "og:title", content: "Sign up for PINK" },
      { property: "og:description", content: "Free tier, no credit card, connect your first tool in minutes." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { session } = await signUpWithEmail(email.trim(), password, fullName.trim() || undefined);
      // Email verification is intentionally disabled until the project enables it.
      if (session) navigate({ to: "/onboarding" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Start free in about a minute."
      copy="No card required. You get 500 requests a month, 25 best-tier requests and two connectors."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-pink hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Full name">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Avery Lane"
            className={inputClass}
          />
        </Field>
        <Field label="Work email">
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="avery@company.com"
            className={inputClass}
          />
        </Field>
        <Field label="Password" hint="min 10 characters">
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className={inputClass}
          />
        </Field>
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={`${submitClass} disabled:opacity-60`}>
          {busy ? "Creating account…" : "Create account"}
        </button>
        {/* Google sign-in stays off until the provider is enabled on the project. */}
      </form>
    </AuthLayout>
  );
}
