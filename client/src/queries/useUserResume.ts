import userResumeApiRequest from "@/apiRequest/user-resume";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateUserResumeMutate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userResumeApiRequest.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-resumes"] });
    },
  });
};

export const useGetUserResumes = () => {
  return useQuery({
    queryKey: ["user-resumes"],
    queryFn: userResumeApiRequest.findAll,
  });
};

export const useGetUserResumeDetail = (id: string) => {
  return useQuery({
    queryKey: ["user-resume", id],
    queryFn: () => userResumeApiRequest.findOne(id),
    enabled: !!id,
  });
};
