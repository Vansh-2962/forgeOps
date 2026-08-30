import { Link } from "react-router-dom";
import { Plus, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { HealthBadge } from "@/components/shared/StatusBadge";
import { projects } from "@/data/mockData";

export default function Projects() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Projects"
        description="Connected repositories and their environments."
        actions={
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-4 w-4" /> Connect repository
          </Button>
        }
      />

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate font-mono text-xs text-muted-foreground">
                  <GitBranch className="h-3 w-3" />
                  {p.repoUrl}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {p.stack.join(" · ")}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <HealthBadge status={p.health} />
              <span className="text-xs text-muted-foreground">
                {p.environment}
              </span>
            </div>
            <p className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">
              Last deployment: {p.lastDeployment}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
