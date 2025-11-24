"use client";

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { envConfig } from "../../config";
import { toast } from "sonner";
import {
  removeTokensFromLocalStorage,
  setAccessTokenToLocalStorage,
} from "./utils";
import { jwtDecode } from "jwt-decode";

//- Tạo instance Axios
const instance = axios.create({
  baseURL: envConfig.NEXT_PUBLIC_API_URL_SERVER,
  withCredentials: true,
  timeout: 10000, // Timeout 10 giây
  headers: {
    "Content-Type": "application/json",
  },
});

//- tạo riêng 1 cái cho refresh token
export const refreshInstance = axios.create({
  baseURL: envConfig.NEXT_PUBLIC_API_URL_SERVER,
  timeout: 50000,
  withCredentials: true,
});

//- tạo riêng 1 cái cho xóa access token
export const accessInstance = axios.create({
  baseURL: envConfig.NEXT_PUBLIC_API_URL_SERVER,
  timeout: 50000,
  withCredentials: true,
});

//- Interceptor cho request: Thêm token hoặc các xử lý trước khi gửi request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    const isCloudinary = config.url?.includes("https://api.cloudinary.com");

    if (
      typeof window !== "undefined" &&
      window &&
      window.localStorage &&
      token
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers.Accept && config.headers["Content-Type"]) {
      //- neu khong co header Accept thi them
      config.headers.Accept = "application/json";
      config.headers["Content-Type"] = "application/json; charset=utf-8";
    }

    if (isCloudinary) {
      delete config.headers.Authorization;
      config.withCredentials = false;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//- Interceptor cho response: Xử lý lỗi từ server
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    //- Trả về dữ liệu từ response
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    let message = error.response?.data?.message || "Có lỗi xảy ra";
    if (Array.isArray(message)) {
      message = message.join(", ");
    }

    const status = error.response?.data.statusCode;

    //- xử lý 401 riêng
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; //- tránh vòng lặp vô hạn
      const token = localStorage.getItem("access_token");

      //- email or password wrong
      if (message === "Email hoặc mật khẩu không đúng") {
        toast.error(message);
        return Promise.reject(error);
      }

      //- CASE 1: Không có token
      if (!token) {
        toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.1");
        removeTokensFromLocalStorage();
        await accessInstance.get("/auth/removeAccessToken");
        setTimeout(() => (window.location.href = "/"), 1000);
        return Promise.reject(error);
      }

      try {
        const decoded = jwtDecode(token);
        const now = Date.now();
        console.log("decodeed: ", decoded)

        //- CASE 2: Token còn hạn mà vẫn 401 → có thể bị revoke
        if (decoded.exp && now < decoded.exp * 1000) {
          toast.error(
            "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.2"
          );
          removeTokensFromLocalStorage();
          await accessInstance.get("/auth/removeAccessToken");
          setTimeout(() => (window.location.href = "/"), 1000);
          return Promise.reject(error);
        }

        //- CASE 3: Token đã hết hạn → gọi refresh
        if (decoded.exp && now >= decoded.exp * 1000) {
          try {
            const res = await refreshInstance.get("/auth/refresh");
            const newAccessToken = res.data?.data.access_token;

            if (!newAccessToken) {
              toast.error("Không thể làm mới phiên đăng nhập!3");
              removeTokensFromLocalStorage();
              await accessInstance.get("/auth/removeAccessToken");
              setTimeout(() => (window.location.href = "/login"), 1000);
              return Promise.reject(error);
            }

            setAccessTokenToLocalStorage(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            //- gọi lại request cũ bằng íntance gốc
            return instance(originalRequest);
          } catch (refreshError) {
            toast.error("Lỗi lấy refresh token. Vui lòng đăng nhập lại.4");
            removeTokensFromLocalStorage();
            await accessInstance.get("/auth/removeAccessToken");
            setTimeout(() => (window.location.href = "/login"), 1000);
            return Promise.reject(refreshError);
          }
        }
      } catch (decodeError) {
        //- CASE 4: Token sai định dạng (người dùng chỉnh sửa)
        toast.error("Token không hợp lệ. Vui lòng đăng nhập lại.5");
        removeTokensFromLocalStorage();
        await accessInstance.get("/auth/removeAccessToken");
        setTimeout(() => (window.location.href = "/"), 1000);
        return Promise.reject(decodeError);
      }
    }

    //- Xử lý lỗi dựa trên status code
    switch (status) {
      case 423: //- khi refesh_token hết hạn ở cookie
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => (window.location.href = "/login"), 1000);
      case 400:
        toast.error(message);
        break;
      case 403:
        console.error("Resource not found.");
        break;
      case 404:
        console.error("Resource not found.");
        break;
      case 500:
        toast.error(message);
        break;
      default:
        toast.error(message);
    }

    return Promise.reject(error.response?.data);
  }
);

//- tạo wrapper có generic type
const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.get<never, T>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.post<never, T>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.put<never, T>(url, data, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.patch<never, T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.delete<never, T>(url, config),
};

export default http;
