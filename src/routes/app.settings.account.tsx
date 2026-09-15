import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { inputClass } from "@/components/auth/auth-layout";

export const Route = createFileRoute("/app/settings/account")({
  head: () => ({
    meta: [
      { title: "Account settings | PINK workspace" },
      { name: "description", content: "Update your profile, email address, password and workspace details." },
      { property: "og:title", content: "PINK account settings" },
      { property: "og:description", content: "Profile, email, password and session management." },
    ],
  }),
  component: Account,
});

function Account() {
  return (
    <>
      <PageHeader title="Account" copy="Your profile, sign-in details and active sessions." />
      <div className="grid gap-4 p-4 lg:max-w-4xl lg:p-8">
        <Panel>
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Profile updated");
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm text-white">Full name</span>
                <input defaultValue="Avery Lane" className={inputClass} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-white">Workspace</span>
                <input defaultValue="Acme Labs" className={inputClass} />
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm text-white">Email</span>
              <input type="email" defaultValue="avery@acmelabs.io" className={inputClass} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-white">Time zone</span>
              <input defaultValue="Australia/Melbourne (AEDT)" className={inputClass} />
            </label>
            <button type="submit" className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white">
              Save changes
            </button>
          </form>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Password</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Password changed", { description: "Other sessions were signed out." });
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm text-white">Current password</span>
              <input type="password" placeholder="••••••••••" className={inputClass} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm text-white">New password</span>
                <input type="password" placeholder="••••••••••" className={inputClass} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-white">Confirm</span>
                <input type="password" placeholder="••••••••••" className={inputClass} />
              </label>
            </div>
            <button
              type="submit"
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2"
            >
              Update password
            </button>
          </form>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Active sessions</h2>
          <ul className="mt-4 divide-y divide-line">
            {[
              ["Melbourne, AU · Chrome", "This device · active now"],
              ["Sydney, AU · iOS app", "Last active 2 days ago"],
            ].map(([a, b]) => (
              <li key={a} className="flex items-center gap-4 py-3.5">
                <div>
                  <p className="text-sm text-white">{a}</p>
                  <p className="font-mono text-[11px] text-mute">{b}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast("Session revoked")}
                  className="ml-auto font-mono text-[11px] text-fog hover:text-white"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold text-destructive">Delete workspace</h2>
          <p className="mt-2 text-sm text-fog">
            Removes all conversations, task logs and connector authorisations. Running tasks are cancelled. This cannot
            be undone.
          </p>
          <button
            type="button"
            onClick={() => toast("Deletion requires email confirmation")}
            className="mt-4 rounded-md border border-destructive/40 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
          >
            Delete workspace
          </button>
        </Panel>
      </div>
    </>
  );
}
