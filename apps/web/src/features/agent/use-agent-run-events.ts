import { useEffect, useState } from "react";
import { AgentEvent, AgentEventType } from "./agentrun.types";

interface useAgentRunEventTypes {
  agentRunId: string;
  enabled: boolean;
}

export function useAgentRunEvents({
  agentRunId,
  enabled = false,
}: useAgentRunEventTypes) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !agentRunId) return;

    const eventSource = new EventSource(`/api/v1/event/${agentRunId}`);

    const handleEvent = (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data) as AgentEvent;
      setEvents((previous) => [...previous, data]);
      handleAgentEvent(data);
    };

    const handleAgentEvent = (event: AgentEvent) => {
      switch (event.type) {
        case "RUN_STARTED": {
          setStartedAt(event.timestamp);
          setCurrentStep("Agent started");
          break;
        }

        case "LLM_STARTED": {
          setCurrentStep("Thinking...");
          break;
        }

        case "LLM_COMPLETED": {
          setCurrentStep("Processing response");
          break;
        }

        case "TOOL_STARTED": {
          const tool =
            typeof event.data.tool === "string" ? event.data.tool : "tool";

          setCurrentStep(`Running ${tool}`);
          break;
        }

        case "TOOL_COMPLETED": {
          const tool =
            typeof event.data.tool === "string" ? event.data.tool : "Tool";
          setCurrentStep(`${tool} completed`);
          break;
        }

        case "TOOL_FAILED": {
          const tool =
            typeof event.data.tool === "string" ? event.data.tool : "Tool";

          setCurrentStep(`${tool} failed`);
          break;
        }

        case "RUN_COMPLETED": {
          setCurrentStep(`Run completed`);
          break;
        }

        case "RUN_FAILED": {
          const message =
            typeof event.data.error === "string"
              ? event.data.error
              : "Agent execution failed.";

          setCurrentStep(`Failed`);
          setError(message);
          break;
        }

        default:
          break;
      }
    };

    const eventTypes: AgentEventType[] = [
      "RUN_STARTED",
      "RUN_COMPLETED",
      "RUN_FAILED",
      "LLM_STARTED",
      "LLM_COMPLETED",
      "LLM_FAILED",
      "TOOL_STARTED",
      "TOOL_COMPLETED",
      "TOOL_FAILED",
      "AGENT_MESSAGE",
      "AGENT_ERROR",
    ];

    for (const eventType of eventTypes) {
      eventSource.addEventListener(eventType, handleEvent);
    }

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setError("Event stream disconnected");
      }
    };

    return () => {
      eventSource.close();
    };
  }, [agentRunId, enabled]);

  return {
    events,
    currentStep,
    startedAt,
    error,
  };
}
