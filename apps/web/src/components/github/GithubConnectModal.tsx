import { env } from "@/config/env";
import { Github, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GithubConnectModal = ({ open, onOpenChange }: Props) => {
  const handleGithubConnect = () => {
    window.location.href = `${env?.VITE_API_BASE_URL}/github/connect`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border bg-background p-0 sm:max-w-120">
        {/* Top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-primary/10 via-primary/5 to-transparent" />

        <div className="relative p-6 sm:p-8">
          <DialogHeader className="items-center text-center">
            {/* Icon */}
            <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary shadow-sm">
              <Github className="size-8 text-foreground" />

              <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-primary/20 bg-primary">
                <Sparkles className="size-3.5 text-primary-foreground" />
              </div>
            </div>

            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Connect your GitHub
            </DialogTitle>

            <DialogDescription className="mt-2 max-w-sm text-center text-sm leading-6">
              Connect your GitHub account to let ForgeOps securely access your
              repositories and run AI-powered operations.
            </DialogDescription>
          </DialogHeader>

          {/* Benefits */}
          <div className="my-7 space-y-3">
            <FeatureItem text="Access and select your repositories" />
            <FeatureItem text="Run AI-powered engineering workflows" />
            <FeatureItem text="Secure OAuth connection with GitHub" />
          </div>

          <Button
            size="lg"
            className="group h-12 w-full gap-3 text-sm font-medium"
            onClick={handleGithubConnect}
          >
            <Github className="size-5" />

            <span>Continue with GitHub</span>
          </Button>

          {/* Security note */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />

            <span>Secure connection powered by GitHub OAuth</span>
          </div>
        </div>

        {/* Bottom subtle footer */}
        <div className="border-t border-border bg-secondary/40 px-6 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            You can disconnect your GitHub account anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface FeatureItemProps {
  text: string;
}

const FeatureItem = ({ text }: FeatureItemProps) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="size-3.5 text-primary" />
      </div>

      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};

export default GithubConnectModal;
