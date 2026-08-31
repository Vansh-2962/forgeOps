import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GithubIcon, Plus, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { NewAgentTaskDialog } from "@/components/agent/NewAgentTaskDialog";
import { env } from "@/config/env";
import { toast } from "sonner";
import { useGithubStatus } from "@/hooks/github/useGithubStatus";
import ButtonSkeleton from "@/components/loaders/ButtonSkeleton";
import AgentRunLists from "@/components/agent/AgentRunLists";
import GithubConnectModal from "@/components/github/GithubConnectModal";

export default function AgentRuns() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const githubStatus = searchParams.get("github");

  const { data } = useGithubStatus();
  const githubConnected = data?.data?.connected ?? false;

  useEffect(() => {
    if (githubStatus === "connected") {
      toast.success("GitHub connected successfully");
    }

    if (githubStatus === "error") {
      toast.error("Failed to connect GitHub");
    }

    if (githubStatus) {
      navigate(window.location.pathname, { replace: true });
    }
  }, [githubStatus, navigate]);

  const handleDialog = () => {
    githubConnected ? setDialogOpen(true) : setGithubDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Agent Runs"
        description="Autonomous tasks executed by your AI DevOps engineer."
        actions={
          <>
            <Button size="sm" onClick={handleDialog} className="gap-1.5">
              <Plus className="h-4 w-4" /> New Agent Task
            </Button>
          </>
        }
      />

      <AgentRunLists />

      <GithubConnectModal
        open={githubDialogOpen}
        onOpenChange={setGithubDialogOpen}
      />
      <NewAgentTaskDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
