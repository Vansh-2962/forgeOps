import { getAgentRuns } from "@/api/agent";
import { useQuery } from "@tanstack/react-query";

export const useGetAllAgentRuns = () => {
  return useQuery({
    queryKey: ["agent-runs"],
    queryFn: getAgentRuns,
  });
};
