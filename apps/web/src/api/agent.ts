import { axiosInstance } from "@/config/axios";
import { CreateAgentRunType } from "@/types/agent";

export const createAgentRun = async (data: CreateAgentRunType) => {
  const response = await axiosInstance.post(`/agent/run`, data);
  return response.data;
};

export const getAgentRuns = async () => {
  const response = await axiosInstance.get(`/agent/run`);
  return response.data;
};
