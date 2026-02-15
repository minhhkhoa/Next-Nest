import userResumeApiRequest from "@/apiRequest/user-resume";
import { CreateUserResumeType } from "@/schemasvalidation/user-resume";
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

export const useUpdateUserResumeMutate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<CreateUserResumeType>;
    }) => userResumeApiRequest.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-resumes"] });
      queryClient.invalidateQueries({ queryKey: ["user-resume"] });
    },
  });
};
