import { useParams, Link } from "react-router-dom";
import { Pause, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RunStatusBadge, StatusDot } from "@/components/shared/StatusBadge";
import { AgentTimeline } from "@/components/agent/AgentTimeline";
import { AgentPlan } from "@/components/agent/AgentPlan";
import { ToolCallCard } from "@/components/agent/ToolCall";
import { TerminalPanel } from "@/components/agent/TerminalPanel";
import { AgentMetricsPanel } from "@/components/agent/AgentMetrics";
import { getRun } from "@/data/mockData";
import { toast } from "sonner";
import { AgentStatus } from "@repo/types";

const toolIcons: Record<string, string> = {
  GitHub: "GH",
  Docker: "DK",
  Filesystem: "FS",
  Shell: "SH",
  Kubernetes: "K8s",
  Logs: "LG",
  Metrics: "MT",
};

export default function AgentRunDetail() {
  const { runId } = useParams();
  const run = runId ? getRun(runId) : undefined;

  if (!run) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-muted-foreground">
        Run not found.{" "}
        <Link to="/runs" className="underline">
          Back to runs
        </Link>
      </div>
    );
  }

  const isRunning = run.status === "running";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/runs" className="hover:text-foreground">
          Agent Runs
        </Link>
        <span>/</span>
        <span className="font-mono">{run.id}</span>
      </div>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{run.task}</h1>
          <p className="mt-1 flex items-center gap-2 font-mono text-xs text-muted-foreground">
            {run.project}
            <span className="text-border">·</span>
            <RunStatusBadge status={run.status.toUpperCase() as AgentStatus} />
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Started {run.startedAt} · {run.duration}
          </p>
        </div>
        {isRunning && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => toast("Agent paused")}
            >
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 hover:text-red-700"
              // onClick={() =>
              //   toast.add({ title: "Agent cancelled", variant: "destructive" })
              // }
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: execution timeline */}
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agent Activity
            </h2>
            <AgentTimeline steps={run.steps} />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tool Activity
            </h2>
            <div className="space-y-2">
              {run.toolCalls.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tool calls recorded yet.
                </p>
              ) : (
                run.toolCalls.map((c) => <ToolCallCard key={c.id} call={c} />)
              )}
            </div>
          </div>

          <TerminalPanel lines={run.terminal} />
        </section>

        {/* Right: agent context */}
        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Plan
            </h2>
            <AgentPlan steps={run.plan} />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tools Used
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {run.tools.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-foreground font-mono text-[8px] font-bold text-background">
                    {toolIcons[t] ?? t.slice(0, 2)}
                  </span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agent State
            </h2>
            <AgentMetricsPanel metrics={run.metrics} />
          </div>
        </aside>
      </div>
    </div>
  );
}
