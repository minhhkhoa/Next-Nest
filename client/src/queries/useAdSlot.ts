import adSlotApiRequest from "@/apiRequest/adSlot";
import { AdSlotCreateType, AdSlotUpdateType } from "@/schemasvalidation/adSlot";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//- Hook tạo mới slot quảng cáo (Super_Admin)
export function useCreateAdSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdSlotCreateType) => adSlotApiRequest.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-slots-filter"] });
    },
  });
}

//- Hook lấy danh sách slot có lọc/phân trang (Admin)
export function useGetAdSlotsFilter(params: {
  currentPage?: number;
  pageSize?: number;
  keyword?: string;
  page?: string;
  adModeAllowed?: string;
  isActive?: string;
  isDeleted?: string;
}) {
  return useQuery({
    queryKey: ["ad-slots-filter", params],
    queryFn: () => adSlotApiRequest.findAll(params),
  });
}

//- Hook lấy danh sách slot active (Public)
export function useGetAdSlotsPublic() {
  return useQuery({
    queryKey: ["ad-slots-public"],
    queryFn: adSlotApiRequest.findAllPublic,
    //- Cache lâu hơn vì dữ liệu ít thay đổi
    staleTime: 1000 * 60 * 5,
  });
}

//- Hook lấy chi tiết slot theo ID
export function useGetAdSlotDetail(id: string) {
  return useQuery({
    queryKey: ["ad-slot-detail", id],
    queryFn: () => adSlotApiRequest.findOne(id),
    enabled: !!id,
  });
}

//- Hook cập nhật thông tin slot (Super_Admin)
export function useUpdateAdSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdSlotUpdateType }) =>
      adSlotApiRequest.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ad-slot-detail", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["ad-slots-filter"] });
      queryClient.invalidateQueries({ queryKey: ["ad-slots-public"] });
    },
  });
}

//- Hook bật/tắt active slot (Super_Admin)
export function useToggleAdSlotActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adSlotApiRequest.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-slots-filter"] });
      queryClient.invalidateQueries({ queryKey: ["ad-slots-public"] });
    },
  });
}

//- Hook xóa mềm slot (Super_Admin)
export function useDeleteAdSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adSlotApiRequest.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-slots-filter"] });
    },
  });
}

//- Hook khôi phục slot đã xóa (Super_Admin)
export function useRestoreAdSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adSlotApiRequest.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-slots-filter"] });
    },
  });
}
//- Hook lấy chi tiết slot theo code (Public)
export function useGetAdSlotByCode(code: string) {
  return useQuery({
    queryKey: ["ad-slot-code", code],
    queryFn: () => adSlotApiRequest.findByCode(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 60, //- Cache 1 tiếng vì cấu hình slot ít thay đổi
  });
}
