import { useEffect, useState } from "react";
import { ArrowRight, GithubIcon, Lock, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { suggestedTasks } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useGithubRepos } from "@/hooks/github/useGithubRepos";
import { GithubRepository } from "@repo/types/github";
import { useCreateAgentRun } from "@/hooks/agent/useCreateAgentRun";

export function NewAgentTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [repo, setRepo] = useState("");
  const [env, setEnv] = useState("development");
  const [task, setTask] = useState("");

  const { data } = useGithubRepos();
  const repos = data?.data ?? [];
  const { mutate, isPending, isSuccess } = useCreateAgentRun();

  const handleStart = () => {
    if (!repo) return;

    mutate({
      repoId: repo,
      envId: env,
      prompt: task,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
      setRepo("");
      setEnv("development");
      setTask("");
    }
  }, [isSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create Agent Task
          </DialogTitle>
          <DialogDescription>
            Describe what you want ForgeOps to do. It will plan, execute, and
            ask for approval on risky actions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Repository</Label>
            <Select value={repo} onValueChange={setRepo}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                align="start"
                sideOffset={2}
              >
                {repos.map((r: GithubRepository) => (
                  <SelectItem
                    key={r.id}
                    value={String(r.id)}
                    className="font-mono text-xs flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <GithubIcon size={8} />
                      {r.name}
                    </div>
                    <p>
                      {r.private && (
                        <Lock size={5} className="text-muted-foreground" />
                      )}
                    </p>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Environment</Label>
            <Select value={env} onValueChange={setEnv}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                align="start"
                sideOffset={2}
              >
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Task</Label>
            <Textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What do you want ForgeOps to do?"
              className="min-h-22.5 resize-none font-mono text-sm"
            />
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              Suggested tasks
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTasks.map((s) => (
                <button
                  key={s}
                  onClick={() => setTask(`${s} — `)}
                  className={cn(
                    "rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground",
                    task.startsWith(s) &&
                      "border-foreground/30 text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            className="gap-1.5 px-5"
            disabled={!task || isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-1">
                <Loader2 className="animate-spin" /> Starting
              </div>
            ) : (
              <div className="flex items-center gap-1">
                Start Agent <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
