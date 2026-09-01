import { GitBranch } from "lucide-react";
import { HealthBadge } from "../shared/StatusBadge";
import { Link } from "react-router-dom";
import { useGetAllProjects } from "@/hooks/projects/useGetAllProjects";
import { ProjectType } from "@repo/types";
import { formatRelativeDate } from "@/utils/formatDate";
import ProjectCardSkeleton from "../loaders/ProjectSkeleton";

const ProjectList = () => {
  const { data, isLoading } = useGetAllProjects();
  const projects = (data?.data as ProjectType[]) ?? [];
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        <ProjectCardSkeleton />
      ) : (
        projects.map((p: ProjectType) => (
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
                  github.com/{p.repository.fullName}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {p.description || "No description provided."}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <HealthBadge status={"healthy"} />
              <span className="text-xs text-muted-foreground">
                {p.environments.map((env) => (
                  <span
                    key={env.id}
                    className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground"
                  >
                    {env.name}
                  </span>
                ))}
              </span>
            </div>
            <p className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">
              {formatRelativeDate(p.createdAt)}
            </p>
          </Link>
        ))
      )}
    </div>
  );
};

export default ProjectList;
