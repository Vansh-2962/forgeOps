import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { RiskBadge } from "@/components/shared/StatusBadge";
import { incidents } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function Incidents() {
  const [selected, setSelected] = useState<string | null>(null);

  const active = incidents.find((i) => i.id === selected);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Incidents"
        description="Detected anomalies and AI-led investigations."
        actions={
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-4 w-4" /> Declare incident
          </Button>
        }
      />

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          {incidents.map((inc) => (
            <button
              key={inc.id}
              onClick={() => setSelected(inc.id)}
              className={cn(
                "w-full rounded-lg border bg-card p-4 text-left transition-colors",
                selected === inc.id
                  ? "border-foreground/30"
                  : "border-border hover:border-foreground/20",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <RiskBadge level={inc.severity} />
                  <p className="mt-2 text-sm font-medium">{inc.title}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {inc.service}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {inc.detectedAt}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">{inc.status}</span>
              </div>
            </button>
          ))}
        </div>

        <div>
          {active ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="font-mono text-xs text-muted-foreground">
                Incident #{active.id}
              </p>
              <h2 className="mt-1 text-base font-semibold">{active.title}</h2>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {active.service}
              </p>

              <div className="mt-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timeline
                </h3>
                <ol className="space-y-0">
                  {active.timeline.map((t, i) => (
                    <li key={i} className="relative flex gap-3 pb-3 last:pb-0">
                      {i < active.timeline.length - 1 && (
                        <span className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-border" />
                      )}
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-foreground" />
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">
                          {t.time}
                        </p>
                        <p className="text-sm">{t.event}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-5 rounded-md border border-border bg-muted/30 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  AI Investigation
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm">Root Cause Confidence</span>
                  <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {active.investigation.confidence}%
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Likely Cause</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {active.investigation.likelyCause}
                  </p>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Evidence</p>
                  <ul className="mt-1 space-y-1">
                    {active.investigation.evidence.map((e, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 font-mono text-xs"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button size="sm" className="mt-4 w-full">
                  Review Recommended Action
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              Select an incident to view the AI investigation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
