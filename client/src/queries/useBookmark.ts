import bookmarkApiRequest from "@/apiRequest/bookmark";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//- Hook tạo mới bookmark
export const useCreateBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { itemId: string; itemType: string }) =>
      bookmarkApiRequest.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks-filter"] });
    },
  });
};

//- Hook lấy danh sách bookmark của user
export const useGetBookmarks = (params: {
  currentPage: number;
  pageSize: number;
  itemType?: string;
}) => {
  return useQuery({
    queryKey: ["bookmarks-filter", params],
    queryFn: () => bookmarkApiRequest.findAll(params),
  });
};

//- Hook xóa bookmark theo ID
export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookmarkApiRequest.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks-filter"] });
    },
  });
};

//- Hook xóa bookmark theo Item ID (Sử dụng cho toggle button)
export const useDeleteBookmarkByItemId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => bookmarkApiRequest.removeByItemId(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks-filter"] });
    },
  });
};
