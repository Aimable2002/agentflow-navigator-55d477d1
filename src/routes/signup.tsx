import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout, Field, inputClass, submitClass } from "@/components/auth/auth-layout";

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
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/verify-email" });
        }}
      >
        <Field label="Full name">
          <input required placeholder="Avery Lane" className={inputClass} />
        </Field>
        <Field label="Work email">
          <input required type="email" placeholder="avery@company.com" className={inputClass} />
        </Field>
        <Field label="Password" hint="min 10 characters">
          <input required type="password" minLength={10} placeholder="••••••••••" className={inputClass} />
        </Field>
        <button type="submit" className={submitClass}>
          Create account
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/onboarding" })}
          className="w-full rounded-md border border-line px-4 py-3 text-sm text-white transition-colors hover:bg-panel"
        >
          Continue with Google
        </button>
      </form>
    </AuthLayout>
  );
}
