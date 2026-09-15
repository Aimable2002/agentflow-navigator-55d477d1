import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout, Field, inputClass, submitClass } from "@/components/auth/auth-layout";

export const Route = createFileRoute("/reset-password")({
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
  return (
    <AuthLayout
      eyebrow="Password reset"
      title="Choose a new password."
      copy="Ten characters minimum. Signing in again will end all other active sessions."
      footer={
        <>
          Link expired?{" "}
          <Link to="/forgot-password" className="text-pink hover:underline">
            Send a new one
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/login" });
        }}
      >
        <Field label="New password" hint="min 10 characters">
          <input required type="password" minLength={10} placeholder="••••••••••" className={inputClass} />
        </Field>
        <Field label="Confirm new password">
          <input required type="password" minLength={10} placeholder="••••••••••" className={inputClass} />
        </Field>
        <button type="submit" className={submitClass}>
          Update password and sign in
        </button>
      </form>
    </AuthLayout>
  );
}
