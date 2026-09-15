import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, inputClass, submitClass } from "@/components/auth/auth-layout";
import { sendPasswordReset } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your PINK password" },
      { name: "description", content: "Send yourself a password reset link for your PINK workspace." },
      { property: "og:title", content: "Forgot your PINK password?" },
      { property: "og:description", content: "We'll email you a secure reset link." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Password reset"
      title={sent ? "Check your inbox." : "Forgot your password?"}
      copy={
        sent
          ? "We sent a reset link to your email. Open it on this device to choose a new password."
          : "Enter the email on your account and we'll send a secure reset link."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="text-pink hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-md border border-mint/30 bg-mint/5 p-4 font-mono text-xs text-mint">
          reset link sent · {email}
        </div>
      ) : (
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
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className={`${submitClass} disabled:opacity-60`}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
