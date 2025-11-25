import {
  CloudinarySignatureResponse,
  CloudinaryUploadResponse,
} from "@/types/cloudinary";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import http from "./http";
import { envConfig } from "../../config";
import { ApiResponse } from "@/types/apiResponse";
import { IndustryResType } from "@/schemasvalidation/industry";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isBrowser = typeof window !== "undefined";

export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("access_token") : null;

export const setAccessTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("access_token", value);

export const removeTokensFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem("access_token");
  }
};

export const handleInitName = (name: string) => {
  if (!name) return "";

  const words = name
    .trim()
    .split(/\s+/) //- cắt khoảng trắng thừa
    .filter(Boolean);

  if (words.length === 0) return "";

  if (words.length === 1) {
    //- nếu chỉ có 1 từ -> chuẩn hóa (viết hoa chữ đầu, còn lại thường)
    const word = words[0].toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  //- nếu có nhiều từ -> lấy chữ cái đầu của từ đầu + cuối (in hoa)
  const first = words[0][0];
  const last = words[words.length - 1][0];

  return (first + last).toUpperCase();
};

//- start cloudinary
/**
 * Upload file trực tiếp lên Cloudinary (signed upload)
 * @param file File từ input
 * @returns Promise<string> secure_url sau khi upload thành công
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  // --- Gọi BE để lấy chữ ký Cloudinary ---
  const sigRes = await http.get<ApiResponse<CloudinarySignatureResponse>>(
    `${envConfig.NEXT_PUBLIC_API_URL_SERVER}/cloudinary/signature`
  );
  if (!sigRes.isOk) {
    throw new Error("Failed to get Cloudinary signature");
  }

  const { timestamp, signature, apiKey, cloudName, folder } =
    sigRes.data as CloudinarySignatureResponse;

  // --- Tạo formData để gửi lên Cloudinary ---
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  if (folder) formData.append("folder", folder);

  // --- Gửi trực tiếp lên Cloudinary ---
  const uploadUrl = `${envConfig.NEXT_PUBLIC_CLOUD_API}/${cloudName}/auto/upload`;

  const res = await http.post<CloudinaryUploadResponse>(uploadUrl, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: false,
  });

  return res.secure_url;
}
//- end cloudinary

export const formatDateInput = (date: string) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

export const generateSlugUrl = ({ name, id }: { name: string; id: string }) => {
  return `${name}-i.${id}`;
};

export const getIdFromSlugUrl = (slug: string) => {
  return String(slug.split("-i.")[1]);
};