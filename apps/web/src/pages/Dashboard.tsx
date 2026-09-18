import { Link } from "react-router-dom";
import { Bot, Rocket, AlertTriangle, ShieldCheck } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { InfrastructureHealth } from "@/components/dashboard/InfrastructureHealth";
import { StatusDot, RunStatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { agentRuns, activityFeed, infrastructure } from "@/data/mockData";
import { useSession } from "@/lib/auth-client";

export default function Dashboard() {
  const activeRuns = agentRuns.filter((r) => r.status === "running");
  const hour = new Date().getHours();
  const { data } = useSession();
  const user = data?.user;
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title={`${greeting}, ${user?.name || "User"}`}
        description="Your infrastructure is healthy."
      />

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
        <StatusDot status="healthy" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          All systems operational
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Active Agent Runs"
          value={activeRuns.length}
          icon={Bot}
        />
        <MetricCard label="Deployments Today" value={8} icon={Rocket} />
        <MetricCard
          label="Incidents"
          value={1}
          icon={AlertTriangle}
          tone="warning"
        />
        <MetricCard
          label="Pending Approvals"
          value={2}
          icon={ShieldCheck}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Active Agent Runs
            </h2>
            <Link
              to="/runs"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {activeRuns.map((run) => (
              <Link
                key={run.id}
                to={`/runs/${run.id}`}
                className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{run.task}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {run.project}
                    </p>
                  </div>
                  <RunStatusBadge status={run.status} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <StatusDot status={run.status} pulse />
                  <span>{run.currentStep}</span>
                  <span className="text-border">·</span>
                  <span className="font-mono">{run.duration}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <ActivityFeed items={activityFeed} />
          </div>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Infrastructure Overview
        </h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <InfrastructureHealth environments={infrastructure} />
        </div>
      </section>
    </div>
  );
}
