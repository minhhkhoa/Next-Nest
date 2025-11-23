import authApiRequest from "@/apiRequest/auth";
import { getAccessTokenFromLocalStorage } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.login,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.register,
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.logout,
  });
};

export const useGetProfile = () => {
  const token = getAccessTokenFromLocalStorage();

  return useQuery({
    queryKey: ["profile"],
    queryFn: authApiRequest.getProfile,
    enabled: !!token, //- không token = không call
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApiRequest.forgotPassword,
  });
};

export const useValidateResetPassword = (token?: string, email?: string) => {
  return useQuery({
    queryKey: ["validateResetPassword", token, email],
    queryFn: () => authApiRequest.validateTokenResetPassword(token!, email!),
    enabled: !!token && !!email, //- chỉ chạy khi có đủ param
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; email: string; newPassword: string }) =>
      authApiRequest.resetPassword(data),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: {
      userID: string;
      oldPassword: string;
      newPassword: string;
    }) => authApiRequest.changePassword(data),
  });
};
