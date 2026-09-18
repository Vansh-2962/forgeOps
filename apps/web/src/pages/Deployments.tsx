import { CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { deployments } from "@/data/mockData";
import { cn } from "@/lib/utils";

const statusConfig = {
  successful: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    label: "Successful",
  },
  failed: { icon: XCircle, color: "text-red-500", label: "Failed" },
  in_progress: { icon: Loader2, color: "text-blue-500", label: "In Progress" },
  rolled_back: {
    icon: RotateCcw,
    color: "text-amber-500",
    label: "Rolled Back",
  },
};

export default function Deployments() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Deployments"
        description="Recent deployments across all environments."
      />

      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Version</th>
              <th className="px-4 py-2.5 font-medium">Environment</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                Duration
              </th>
              <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                Deployed By
              </th>
              <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deployments.map((d) => {
              const cfg = statusConfig[d.status];
              const Icon = cfg.icon;
              return (
                <tr key={d.id} className="cursor-pointer hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs">{d.version}</td>
                  <td className="px-4 py-3 text-xs">{d.environment}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          cfg.color,
                          d.status === "in_progress" && "animate-spin",
                        )}
                      />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">
                    {d.duration}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    {d.deployedBy}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                    {d.time}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
