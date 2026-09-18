import { useTheme, type Theme } from "@/lib/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor } from "lucide-react";

const sections = [
  { id: "general", label: "General" },
  { id: "appearance", label: "Appearance" },
  { id: "ai", label: "AI Configuration" },
  { id: "repositories", label: "Repositories" },
  { id: "environments", label: "Environments" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
];

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Settings"
        description="Configure ForgeOps workspace preferences."
      />

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-[180px_1fr]">
        <nav className="space-y-0.5">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="space-y-6">
          <section
            id="general"
            className="rounded-lg border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold">General</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Workspace name and identity.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium">Workspace name</label>
                <input
                  defaultValue="ForgeOps"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section
            id="appearance"
            className="rounded-lg border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold">Appearance</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose how ForgeOps looks to you.
            </p>
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium">Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-md border px-3 py-4 text-xs transition-colors",
                      theme === opt.value
                        ? "border-foreground/40 bg-accent text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/20",
                    )}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section
            id="ai"
            className="rounded-lg border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold">AI Configuration</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Model and autonomy settings.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium">Default model</label>
                <select className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none">
                  <option>Claude / GPT (automatic)</option>
                  <option>Claude Sonnet</option>
                  <option>GPT-5</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Require approval for production
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ask before any production deployment.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Auto-rollback on failure
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Roll back failed deployments automatically.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </section>

          <section
            id="repositories"
            className="rounded-lg border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold">Repositories</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Connected Git repositories.
            </p>
            <div className="mt-3 divide-y divide-border font-mono text-xs">
              {[
                "github.com/vansh/production-api",
                "github.com/vansh/payments-service",
                "github.com/vansh/analytics-api",
              ].map((r) => (
                <div key={r} className="flex items-center justify-between py-2">
                  <span>{r}</span>
                  <span className="text-emerald-500">Connected</span>
                </div>
              ))}
            </div>
          </section>

          <section
            id="security"
            className="rounded-lg border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold">Security</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Secrets and access control.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enforce MFA</p>
                <p className="text-xs text-muted-foreground">
                  Require multi-factor authentication.
                </p>
              </div>
              <Switch />
            </div>
          </section>

          <section
            id="notifications"
            className="rounded-lg border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold">Notifications</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              When should ForgeOps notify you?
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Incident declared",
                "Approval requested",
                "Deployment completed",
                "Agent task failed",
              ].map((n) => (
                <div key={n} className="flex items-center justify-between">
                  <span className="text-sm">{n}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
