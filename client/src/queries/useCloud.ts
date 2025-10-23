import cloundApiRequest from "@/apiRequest/cloundinary";
import { useMutation } from "@tanstack/react-query";

export function useCloudQuery() {
  return useMutation({
    mutationFn: cloundApiRequest.upload,
  });
}