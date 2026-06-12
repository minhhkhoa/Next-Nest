import http from "@/lib/http";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/dashboard";

const recruiterDashboardApiRequest = {
  getStats: (startDate?: string, endDate?: string) => {
    //- gọi api lấy dữ liệu thống kê dashboard cho nhà tuyển dụng
    return http.get<ApiResponse<any>>(`${prefix}/recruiter/stats`, {
      params: {
        startDate,
        endDate,
      },
    });
  },
};

export default recruiterDashboardApiRequest;
