import aiApiRequest from "@/apiRequest/ai";
import { useMutation } from "@tanstack/react-query";

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
