import { axiosInstance } from "@/config/axios";

export const getAllProjects = async () => {
  const response = await axiosInstance.get("/project");
  return response.data;
};
