import issueApiRequest from "@/apiRequest/issue";
import {
  IssueUpdateType,
  IssueAdminUpdateType,
} from "@/schemasvalidation/issue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetDetailIssue = (id: string) => {
  return useQuery({
    queryKey: ["getIssue", id],
    queryFn: () => issueApiRequest.getDetailIssue(id),
    enabled: !!id,
  });
};

export const useGetIssueFilter = ({
  currentPage,
  pageSize,
  type,
  status,
  searchText,
}: {
  currentPage: number;
  pageSize: number;
  type?: string;
  status?: string;
  searchText?: string;
}) => {
  return useQuery({
    queryKey: [
      "getIssue_filter",
      currentPage,
      pageSize,
      type,
      status,
      searchText,
    ],
    queryFn: () =>
      issueApiRequest.getIssueFilter({
        currentPage,
        pageSize,
        type,
        status,
        searchText,
      }),
  });
};

export const useGetMyIssue = ({
  currentPage,
  pageSize,
  type,
  status,
  searchText,
}: {
  currentPage: number;
  pageSize: number;
  type?: string;
  status?: string;
  searchText?: string;
}) => {
  return useQuery({
    queryKey: ["getMyIssue", currentPage, pageSize, type, status, searchText],
    queryFn: () =>
      issueApiRequest.getMyIssue({
        currentPage,
        pageSize,
        type,
        status,
        searchText,
      }),
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueApiRequest.createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getIssue_filter"] });
      queryClient.invalidateQueries({ queryKey: ["getMyIssue"] });
    },
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IssueUpdateType }) =>
      issueApiRequest.updateIssue(id, payload),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["getIssue_filter"] });
      queryClient.invalidateQueries({ queryKey: ["getMyIssue"] });
      queryClient.invalidateQueries({ queryKey: ["getIssue", id] });
    },
  });
};

//- Admin reply
export const useAdminReplyIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IssueAdminUpdateType) =>
      issueApiRequest.adminReply(payload),
    onSuccess: (data, payload) => {
      queryClient.invalidateQueries({ queryKey: ["getIssue_filter"] });
      queryClient.invalidateQueries({ queryKey: ["getIssue", payload.id] });
    },
  });
};

//- delete
export const useDeleteIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueApiRequest.deleteIssue,
    onSuccess: () => {
      //- gọi lại api khi cập nhật thông tin
      queryClient.invalidateQueries({ queryKey: ["getIssue_filter"] });
      queryClient.invalidateQueries({ queryKey: ["getMyIssue"] });
    },
  });
};
