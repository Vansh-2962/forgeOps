import { useQuery } from "@tanstack/react-query";
import { getAllProjects } from "@/api/project";
import { ProjectType } from "@repo/types";

export const useGetAllProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getAllProjects,
  });
};
