import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, inputClass, submitClass } from "@/components/auth/auth-layout";
import { updatePassword } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new PINK password" },
      { name: "description", content: "Set a new password for your PINK workspace and sign back in." },
      { property: "og:title", content: "Set a new PINK password" },
      { property: "og:description", content: "Choose a new password to regain access to your agent workspace." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Password reset"
      title="Choose a new password."
      copy="Ten characters minimum. Open this page from the emailed reset link so we know it's you."
      footer={
        <>
          Link expired?{" "}
          <Link to="/forgot-password" className="text-pink hover:underline">
            Send a new one
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="New password" hint="min 10 characters">
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
        <Field label="Confirm new password">
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={10}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {busy ? "Updating…" : "Update password and sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
