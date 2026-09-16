import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { inputClass } from "@/components/auth/auth-layout";
import { useProfile, useUpdateProfile } from "@/lib/queries";
import { signOut, updatePassword, useSession } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { planLabel } from "@/lib/format";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings/account")({
  head: () => ({
    meta: [
      { title: "Account settings | PINK workspace" },
      {
        name: "description",
        content: "Update your profile, email address, password and workspace details.",
      },
      { property: "og:title", content: "PINK account settings" },
      { property: "og:description", content: "Profile, email, password and session management." },
    ],
  }),
  component: Account,
});

const timezones = [
  "UTC",
  "Africa/Kigali",
  "Africa/Cairo",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Melbourne",
];

function Account() {
  const { user } = useSession();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Seed the form from the profile row once it arrives.
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setCompany(profile.company ?? "");
    setTimezone(profile.timezone ?? "UTC");
  }, [profile]);

  const saveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: fullName.trim() || null,
        company: company.trim() || null,
        timezone,
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.");
    }
  };

  const changePassword = async () => {
    if (password.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("The two passwords don't match.");
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword(password);
      setPassword("");
      setConfirm("");
      toast.success("Password changed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change your password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const signOutEverywhere = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      void navigate({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out.");
    }
  };

  return (
    <>
      <PageHeader title="Account" copy="Your profile, sign-in details and appearance." />
      <div className="grid gap-4 p-4 lg:max-w-4xl lg:p-8">
        <Panel>
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          {isLoading ? (
            <p className="mt-4 flex items-center gap-2 font-mono text-xs text-mute">
              <Loader2 className="size-3.5 animate-spin" /> loading your account…
            </p>
          ) : (
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void saveProfile();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm text-white">Full name</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-white">Workspace</span>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company or team"
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="block space-y-2">
                <span className="flex items-center text-sm text-white">
                  Email
                  <span className="ml-auto font-mono text-[11px] text-mute">
                    sign-in address · cannot be changed here
                  </span>
                </span>
                <input
                  type="email"
                  value={profile?.email ?? user?.email ?? ""}
                  readOnly
                  className={cn(inputClass, "text-fog")}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-white">Time zone</span>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={inputClass}
                >
                  {[...new Set([timezone, ...timezones])].map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink hover:bg-white disabled:opacity-50"
              >
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Plan &amp; usage</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ["Plan", planLabel(profile?.plan)],
              ["Requests this period", `${profile?.quota_used ?? 0} / ${profile?.quota_limit ?? 0}`],
              ["Concurrent tasks", String(profile?.concurrent_limit ?? 0)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{k}</dt>
                <dd className="mt-1 text-sm text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Appearance</h2>
          <p className="mt-2 text-sm text-fog">Choose how the workspace looks in this browser.</p>
          <div className="mt-4 inline-flex rounded-md border border-line p-0.5">
            {(["dark", "light"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                aria-pressed={theme === option}
                className={cn(
                  "rounded px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
                  theme === option ? "bg-pink text-ink" : "text-mute hover:text-white",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Password</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void changePassword();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm text-white">New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputClass}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-white">Confirm</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat it"
                  className={inputClass}
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2 disabled:opacity-50"
            >
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </form>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Sessions</h2>
          <p className="mt-2 text-sm text-fog">
            Signed in as{" "}
            <span className="text-white">{profile?.email ?? user?.email ?? "your account"}</span>.
            Signing out everywhere ends this session and every other device.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                void navigate({ to: "/login" });
              }}
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white hover:bg-ink2"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={() => void signOutEverywhere()}
              className="rounded-md border border-destructive/40 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
            >
              Sign out everywhere
            </button>
          </div>
        </Panel>
      </div>
    </>
  );
}
