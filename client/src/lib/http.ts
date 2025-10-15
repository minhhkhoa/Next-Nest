"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { envConfig } from "../../config";
import { toast } from "sonner";
import {
  getAccessTokenFromLocalStorage,
  removeTokensFromLocalStorage,
  setAccessTokenToLocalStorage,
} from "./utils";

//- Tạo instance Axios
const instance = axios.create({
  baseURL: envConfig.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000, // Timeout 10 giây
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAccessTokenFromLocalStorage() || ""}`,
  },
});

//- Interceptor cho request: Thêm token hoặc các xử lý trước khi gửi request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

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
    const message = error.response?.data?.message || "Có lỗi xảy ra";
    const status = error.response?.data.statusCode;

    //- xử lý 401 riêng
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // tránh vòng lặp vô hạn

      try {
        //- call API refresh token
        const res: any = await instance.get("auth/refresh");
        const newAccessToken = res.data?.access_token;

        if (!newAccessToken) {
          removeTokensFromLocalStorage();
          toast.error("Không thể làm mới phiên đăng nhập!");
          return Promise.reject(error);
        }

        //- lưu token mới
        setAccessTokenToLocalStorage(newAccessToken);

        //- gắn token mới vào header và gọi lại request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        //- nếu refresh cũng lỗi → đăng xuất
        removeTokensFromLocalStorage();
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    //- Xử lý lỗi dựa trên status code
    switch (status) {
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
