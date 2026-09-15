import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, inputClass, submitClass } from "@/components/auth/auth-layout";
import { signInWithEmail } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in to PINK" },
      { name: "description", content: "Sign in to your PINK workspace to chat with the agent and watch your tasks." },
      { property: "og:title", content: "Sign in to PINK" },
      { property: "og:description", content: "Access your agent, connectors and background tasks." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInWithEmail(email.trim(), password);
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back."
      copy="Your conversations, tasks and connectors are exactly where you left them."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="text-pink hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Email">
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
        <Field
          label="Password"
          hint={
            <Link to="/forgot-password" className="text-pink hover:underline">
              Forgot?
            </Link>
          }
        >
          <input
            required
            type="password"
            autoComplete="current-password"
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
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {/* Google sign-in stays off until the provider is enabled on the project. */}
      </form>
    </AuthLayout>
  );
}
