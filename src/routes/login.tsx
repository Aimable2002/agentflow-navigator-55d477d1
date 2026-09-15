import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout, Field, inputClass, submitClass } from "@/components/auth/auth-layout";

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
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/app" });
        }}
      >
        <Field label="Email">
          <input required type="email" placeholder="avery@company.com" className={inputClass} />
        </Field>
        <Field
          label="Password"
          hint={
            <Link to="/forgot-password" className="text-pink hover:underline">
              Forgot?
            </Link>
          }
        >
          <input required type="password" placeholder="••••••••••" className={inputClass} />
        </Field>
        <button type="submit" className={submitClass}>
          Sign in
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/app" })}
          className="w-full rounded-md border border-line px-4 py-3 text-sm text-white transition-colors hover:bg-panel"
        >
          Continue with Google
        </button>
      </form>
    </AuthLayout>
  );
}
