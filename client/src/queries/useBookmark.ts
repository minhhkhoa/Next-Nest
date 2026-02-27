import bookmarkApiRequest from "@/apiRequest/bookmark";
import { BookmarkCreateType } from "@/schemasvalidation/bookmark";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//- Hook tạo mới bookmark
export const useCreateBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookmarkCreateType) =>
      bookmarkApiRequest.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks-filter"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks-ids"] });
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

//- Hook lấy danh sách ID bookmark để check nhanh
export const useGetBookmarkedIds = (itemType?: string, enabled = false) => {
  return useQuery({
    queryKey: ["bookmarks-ids", itemType],
    queryFn: () => bookmarkApiRequest.getAllIds({ itemType }),
    staleTime: 60 * 1000, //- Cache kết quả trong 1 phút để tránh gọi lại quá nhiều khi toggle bookmark
    enabled: enabled,
  });
};

//- Hook xóa bookmark theo ID
export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookmarkApiRequest.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks-filter"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks-ids"] });
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
      queryClient.invalidateQueries({ queryKey: ["bookmarks-ids"] });
    },
  });
};
