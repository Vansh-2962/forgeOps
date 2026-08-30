import { createAgentRun } from "@/api/agent";
import { useMutation } from "@tanstack/react-query";

export const useCreateAgentRun = () => {
  return useMutation({
    mutationFn: createAgentRun,
  });
};
