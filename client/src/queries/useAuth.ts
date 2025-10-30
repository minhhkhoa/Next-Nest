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

//- thêm enabled để kiểm soát việc call api, true thì call
export const useGetProfile = (enabled = true) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: authApiRequest.getProfile,
    enabled,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApiRequest.forgotPassword
  })
}