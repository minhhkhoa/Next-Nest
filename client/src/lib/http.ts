"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { envConfig } from "../../config";
import { toast } from "sonner";
import { getAccessTokenFromLocalStorage } from "./utils";

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
    const token = localStorage.getItem("token");
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
  (error) => {
    const message = error.response?.data?.message || "Có lỗi xảy ra";
    const status = error.response?.data.statusCode;

    //- Xử lý lỗi dựa trên status code
    switch (status) {
      case 401:
        toast.error(message);
        //- Ví dụ: localStorage.removeItem('token');
        //- window.location.href = '/login';
        break;
      // case 403:
      //   console.error("Forbidden! You do not have access.");
      //   break;
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
