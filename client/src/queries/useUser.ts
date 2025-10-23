import userApiRequest from "@/apiRequest/user";
import { UpdateUserType } from "@/schemasvalidation/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateUserMutate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserType }) =>
      userApiRequest.update(id, payload),
    onSuccess: (res) => {
      //- khi update thành công thì invalidate query profile
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
