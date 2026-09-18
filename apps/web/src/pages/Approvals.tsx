import { useState } from "react";
import { ShieldAlert, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { RiskBadge } from "@/components/shared/StatusBadge";
import { approvals } from "@/data/mockData";

import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";
import { toast } from "@/components/ui/toast";

const riskBorder: Record<RiskLevel, string> = {
  low: "border-l-emerald-500",
  medium: "border-l-amber-500",
  high: "border-l-orange-500",
  critical: "border-l-red-500",
};

export default function Approvals() {
  const [resolved, setResolved] = useState<
    Record<string, "approved" | "rejected">
  >({});

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Approvals"
        description="ForgeOps asks for human approval before risky operations."
      />

      <div className="mt-5 space-y-3">
        {approvals.map((a) => {
          const outcome = resolved[a.id];
          return (
            <div
              key={a.id}
              className={cn(
                "rounded-lg border border-border border-l-4 bg-card p-5",
                riskBorder[a.risk],
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">{a.title}</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ForgeOps wants to execute:
                  </p>
                </div>
                <RiskBadge level={a.risk} />
              </div>

              <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-[#0b0b0c] px-3 py-2 font-mono text-xs text-zinc-200">
                {a.command}
              </pre>

              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Environment</dt>
                  <dd className="mt-0.5 font-mono font-medium">
                    {a.environment}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Reason</dt>
                  <dd className="mt-0.5">{a.reason}</dd>
                </div>
              </dl>

              {outcome ? (
                <div
                  className={cn(
                    "mt-4 flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                    outcome === "approved"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
                  )}
                >
                  {outcome === "approved" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {outcome === "approved" ? "Approved" : "Rejected"} — agent
                  will proceed accordingly.
                </div>
              ) : (
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResolved((r) => ({ ...r, [a.id]: "rejected" }));
                      // toast({
                      //   title: "Action rejected",
                      //   variant: "destructive",
                      // });
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setResolved((r) => ({ ...r, [a.id]: "approved" }));
                      // toast({ title: "Action approved" });
                    }}
                  >
                    Approve Deployment
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
