import http from "@/lib/http";
import {
  IssueAdminUpdateType,
  IssueCreateType,
  IssueResType,
  IssueUpdateType,
  IssueResTypeFilter,
} from "@/schemasvalidation/issue";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/issue";
const issueApiRequest = {

  createIssue: (payload: IssueCreateType) =>
    http.post<ApiResponse<any>>(`${prefix}`, payload),

  getDetailIssue: (id: string) =>
    http.get<ApiResponse<IssueResType>>(`${prefix}/${id}`),

  updateIssue: (id: string, payload: IssueUpdateType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  deleteIssue: (id: string) => http.delete<ApiResponse<any>>(`${prefix}/${id}`),

  deleteManyIssue: (ids: string[]) =>
    http.delete<ApiResponse<any>>(`${prefix}/deleteMany`, { data: { ids } }),

  //- Admin
  getIssueFilter: (params: {
    currentPage: number;
    pageSize: number;
    type?: string;
    status?: string;
    searchText?: string;
  }) =>
    http.get<ApiResponse<IssueResTypeFilter>>(`${prefix}/filter`, {
      params,
    }),

  getMyIssue: (params: {
    currentPage: number;
    pageSize: number;
    type?: string;
    status?: string;
    searchText?: string;
  }) =>
    http.get<ApiResponse<IssueResTypeFilter>>(`${prefix}/me`, {
      params,
    }),

  adminReply: (payload: IssueAdminUpdateType) =>
    http.patch<ApiResponse<any>>(`${prefix}/admin-reply`, payload),
};

export default issueApiRequest;
