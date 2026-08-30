import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GitBranch, ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { HealthBadge } from "@/components/shared/StatusBadge";
import { Cpu, MemoryStick, Activity, AlertCircle } from "lucide-react";
import { getProject, agentRuns, deployments } from "@/data/mockData";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const project = projectId ? getProject(projectId) : undefined;
  const [tab, setTab] = useState("overview");

  if (!project) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">
        Project not found.{" "}
        <Link to="/projects" className="underline">
          Back
        </Link>
      </div>
    );
  }

  const projectRuns = agentRuns.filter((r) => r.project === project.id);
  const projectDeployments = deployments.filter(
    (d) => d.project === project.id,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Projects
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-1 flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <GitBranch className="h-3 w-3" /> {project.repoUrl}
          </p>
        </div>
        <HealthBadge status={project.health} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-5">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="runs">Agent Runs</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="flex items-center gap-2">
            <HealthBadge status={project.health} />
            <span className="text-xs text-muted-foreground">
              Production Health
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="CPU"
              value={`${project.metrics.cpu}%`}
              icon={Cpu}
            />
            <MetricCard
              label="Memory"
              value={`${project.metrics.memory}%`}
              icon={MemoryStick}
            />
            <MetricCard
              label="Requests/min"
              value={project.metrics.requests}
              icon={Activity}
            />
            <MetricCard
              label="Error Rate"
              value={project.metrics.errorRate}
              icon={AlertCircle}
              tone="warning"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Deployments
              </h2>
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {projectDeployments.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <span className="font-mono text-xs">{d.version}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.time}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Agent Activity
              </h2>
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {projectRuns.slice(0, 4).map((r) => (
                  <Link
                    key={r.id}
                    to={`/runs/${r.id}`}
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/40"
                  >
                    <span>{r.task}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.duration}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="mt-4">
          <div className="rounded-lg border border-border divide-y divide-border">
            {projectDeployments.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-mono text-xs">{d.version}</span>
                <span className="text-xs text-muted-foreground">
                  {d.status} · {d.time}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="runs" className="mt-4">
          <div className="rounded-lg border border-border divide-y divide-border">
            {projectRuns.map((r) => (
              <Link
                key={r.id}
                to={`/runs/${r.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/40"
              >
                <span>{r.task}</span>
                <span className="text-xs text-muted-foreground">
                  {r.duration}
                </span>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="mt-4">
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Infrastructure resources for {project.name} will appear here.
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <div className="overflow-hidden rounded-lg border border-border bg-[#0b0b0c] p-4 font-mono text-xs text-zinc-300">
            <div>$ kubectl logs -f {project.name}</div>
            <div className="mt-2 text-muted-foreground">Streaming logs…</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
