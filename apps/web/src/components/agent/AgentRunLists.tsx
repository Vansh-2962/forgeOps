import { agentRuns } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { RunStatus } from "@/types";
import { useState } from "react";
import { Link } from "react-router-dom";
import { RunStatusBadge, StatusDot } from "../shared/StatusBadge";
import { useGetAllAgentRuns } from "@/hooks/agent/useGetAllAgentRuns";
import { AgentRun, AgentStatus } from "@repo/types/agent";
import TablerLoader from "../loaders/TablerLoader";
import NotFound from "../NotFound";

const filters: { label: string; value: RunStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Waiting for Approval", value: "waiting_approval" },
];

const AgentRunLists = () => {
  const [filter, setFilter] = useState<RunStatus | "all">("all");
  const { data, isLoading } = useGetAllAgentRuns();

  const filtered =
    filter === "all" ? agentRuns : agentRuns.filter((r) => r.status === filter);

  const runs = data?.data ?? [];

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {runs.length > 0 &&
          filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                filter === f.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
      </div>

      {isLoading ? (
        <TablerLoader className="mt-10" />
      ) : runs.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Task</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                  Project
                </th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                  Current Step
                </th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                  Duration
                </th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                  Started
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runs.map((run: AgentRun) => (
                <tr
                  key={run.id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                  onClick={() => (window.location.href = `/runs/${run.id}`)}
                >
                  <td className="px-4 py-3">
                    <Link to={`/runs/${run.id}`} className="block">
                      <span className="font-medium truncate max-w-75">
                        {run.prompt}
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                    {run.project.name}
                  </td>
                  <td className="px-4 py-3">
                    <RunStatusBadge status={run.status as AgentStatus} />
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {run.status === "RUNNING" && (
                        <StatusDot status="RUNNING" pulse />
                      )}
                      {run.status === "PENDING" && "Initializing..."}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">
                    {run.status === "PENDING" ? "0s" : ""}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                    {run.status === "PENDING"
                      ? "Just now"
                      : run.startedAt &&
                        new Date(run.startedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No runs match this filter.
            </div>
          )}
        </div>
      ) : (
        <NotFound resource="agent runs" />
      )}
    </>
  );
};

export default AgentRunLists;
