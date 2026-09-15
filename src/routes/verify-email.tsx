import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout, submitClass } from "@/components/auth/auth-layout";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify your email | PINK" },
      { name: "description", content: "Confirm your email address to activate your PINK workspace." },
      { property: "og:title", content: "Verify your PINK email" },
      { property: "og:description", content: "One click to activate your workspace and start connecting tools." },
    ],
  }),
  component: Verify,
});

function Verify() {
  return (
    <AuthLayout
      eyebrow="Verify email"
      title="Confirm your email address."
      copy="We sent a six-digit code and a magic link to avery@company.com. Either one activates the workspace."
      footer={
        <>
          Wrong address?{" "}
          <Link to="/signup" className="text-pink hover:underline">
            Start again
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-2">
          {["4", "8", "1", "2", "", ""].map((v, i) => (
            <input
              key={i}
              defaultValue={v}
              maxLength={1}
              inputMode="numeric"
              aria-label={`Digit ${i + 1}`}
              className="size-12 rounded-md border border-line bg-ink2 text-center font-mono text-lg text-white focus:border-pink focus:outline-none"
            />
          ))}
        </div>
        <Link to="/onboarding" className={`${submitClass} block text-center`}>
          Verify and continue
        </Link>
        <div className="flex items-center justify-between font-mono text-[11px] text-mute">
          <span>Code expires in 09:41</span>
          <button type="button" className="text-pink hover:underline">
            Resend code
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
