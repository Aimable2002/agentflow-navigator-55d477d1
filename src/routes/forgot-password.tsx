import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, inputClass, submitClass } from "@/components/auth/auth-layout";

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
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout
      eyebrow="Password reset"
      title={sent ? "Check your inbox." : "Forgot your password?"}
      copy={
        sent
          ? "We sent a reset link. It expires in 30 minutes and can only be used once."
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
        <div className="space-y-4">
          <div className="rounded-md border border-mint/30 bg-mint/5 p-4 font-mono text-xs text-mint">
            reset link sent · avery@company.com
          </div>
          <Link to="/reset-password" className={`${submitClass} block text-center`}>
            Open the reset page
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field label="Email">
            <input required type="email" placeholder="avery@company.com" className={inputClass} />
          </Field>
          <button type="submit" className={submitClass}>
            Send reset link
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
