import axios from "axios";
import { envConfig } from "../../config";

//- Tạo instance Axios
const axiosInstance = axios.create({
  baseURL: envConfig.NEXT_PUBLIC_API_URL,
  timeout: 10000, // Timeout 10 giây
  headers: {
    "Content-Type": "application/json",
    // 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  },
});

//- Interceptor cho request: Thêm token hoặc các xử lý trước khi gửi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//- Interceptor cho response: Xử lý lỗi từ server
axiosInstance.interceptors.response.use(
  (response) => {
    //- Trả về dữ liệu từ response
    return response.data;
  },
  (error) => {
    //- Xử lý lỗi dựa trên status code
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          //- Xử lý lỗi Unauthorized (ví dụ: đăng xuất người dùng)
          console.error("Unauthorized! Please login again.");
          //- Ví dụ: localStorage.removeItem('token');
          //- window.location.href = '/login';
          break;
        case 403:
          console.error("Forbidden! You do not have access.");
          break;
        case 404:
          console.error("Resource not found.");
          break;
        case 500:
          console.error("Server error, please try again later.");
          break;
        default:
          console.error(data.message || "An error occurred.");
      }
    } else if (error.request) {
      //- Lỗi không nhận được phản hồi từ server
      console.error("No response received from server.");
    } else {
      //- Lỗi trong quá trình thiết lập request
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
