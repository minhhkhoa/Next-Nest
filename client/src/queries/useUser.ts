import userApiRequest from "@/apiRequest/user";
import { UpdateUserType } from "@/schemasvalidation/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useUpdateUserMutate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserType }) =>
      userApiRequest.update(id, payload),
    onSuccess: () => {
      //- khi update thành công thì invalidate query profile
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export const useGetAllUserByFilter = ({
  currentPage,
  pageSize,
  name,
  email,
  address,
}: {
  currentPage: number;
  pageSize: number;
  name?: string;
  email?: string;
  address?: string;
}) => {
  return useQuery({
    queryKey: [
      "getAllUserByFilter",
      currentPage,
      pageSize,
      name,
      email,
      address,
    ],
    queryFn: () =>
      userApiRequest.getAllUserByFilter({
        currentPage,
        pageSize,
        name,
        email,
        address,
      }),
  });
};
