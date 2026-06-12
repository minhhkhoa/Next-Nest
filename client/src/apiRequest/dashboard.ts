import http from "@/lib/http";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/dashboard";

const dashboardApiRequest = {
  getAdminStats: (startDate?: string, endDate?: string) => {
    //- gọi api lấy dữ liệu thống kê dashboard cho admin
    return http.get<ApiResponse<any>>(`${prefix}/admin/stats`, {
      params: {
        startDate,
        endDate,
      },
    });
  },
};

export default dashboardApiRequest;
