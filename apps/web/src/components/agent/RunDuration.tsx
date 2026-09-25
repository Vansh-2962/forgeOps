import { AgentStatus } from "@repo/types";
import { useEffect, useState } from "react";

export function RunDuration({
  startedAt,
  status,
}: {
  startedAt?: string | null;
  status: AgentStatus;
}) {
  const [now, setNow] = useState(Date.now());

  const isActive = status === "PENDING" || status === "RUNNING";

  useEffect(() => {
    if (!isActive || !startedAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isActive, startedAt]);

  if (!startedAt) {
    return "0s";
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - new Date(startedAt).getTime()) / 1000),
  );

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}s`;
  }

  const minutes = Math.floor(elapsedSeconds / 60);

  const seconds = elapsedSeconds % 60;

  return `${minutes}m ${seconds}s`;
}
