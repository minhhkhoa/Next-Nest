import authApiRequest from "@/apiRequest/auth";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.login
  })
}

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.register
  })
}

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.logout
  })
}

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authApiRequest.getProfile
  })
}