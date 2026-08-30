import { axiosInstance } from "@/config/axios";

export const githubConnectionStatus = async () => {
  const res = await axiosInstance.get("/github/status");
  return res.data;
};

export const githubRepos = async () => {
  const res = await axiosInstance.get("/github/repos");
  return res.data;
};
