import { RunStatusBadge, StatusDot } from "../shared/StatusBadge";
import { Link } from "react-router-dom";
import { AgentRun, AgentStatus } from "@repo/types/agent";
import { useAgentRunEvents } from "@/features/agent/use-agent-run-events";
import { RunDuration } from "./RunDuration";

export function AgentRunRow({ run }: { run: AgentRun }) {
  const { currentStep, startedAt } = useAgentRunEvents({
    agentRunId: run.id,
    enabled: run.status === "PENDING" || run.status === "RUNNING",
  });

  return (
    <tr
      key={run.id}
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={() => (window.location.href = `/runs/${run.id}`)}
    >
      <td className="px-4 py-3">
        <Link to={`/runs/${run.id}`} className="block">
          <span className="block max-w-75 truncate font-medium">
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
          {run.status === "RUNNING" && <StatusDot status="RUNNING" pulse />}

          {currentStep ?? (run.status === "PENDING" ? "Initializing..." : "—")}
        </span>
      </td>

      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">
        <RunDuration
          startedAt={startedAt ?? (run.startedAt as string)}
          status={run.status}
        />
      </td>

      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
        {startedAt
          ? new Date(startedAt).toLocaleString()
          : run.startedAt
            ? new Date(run.startedAt).toLocaleString()
            : "Just now"}
      </td>
    </tr>
  );
}
