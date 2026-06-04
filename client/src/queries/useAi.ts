import aiApiRequest from "@/apiRequest/ai";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/apiResponse";

export const useCvScoreMutation = () => {
  return useMutation({
    mutationFn: aiApiRequest.cvScore,
  });
};

export const useJdMatchMutation = () => {
  return useMutation({
    mutationFn: aiApiRequest.jdMatch,
  });
};

export const useAiChatMutation = () => {
  return useMutation({
    mutationFn: aiApiRequest.chat,
  });
};

export const useGetRecommendJobs = (enabled = true) => {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ["recommend-jobs"],
    queryFn: () => aiApiRequest.getRecommendJobs(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useForceRecommendJobsMutation = () => {
  return useMutation({
    mutationFn: () => aiApiRequest.getRecommendJobs(true),
  });
};
