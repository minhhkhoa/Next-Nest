import {
  CloudinarySignatureResponse,
  CloudinaryUploadResponse,
} from "@/types/cloudinary";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import http from "./http";
import { envConfig } from "../../config";
import { ApiResponse } from "@/types/apiResponse";
import axios, { isAxiosError } from "axios";
import { NotificationType } from "./constant";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { NotificationResType } from "@/schemasvalidation/notification";

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
export async function uploadToCloudinary(
  file: File,
): Promise<string | undefined> {
  try {
    if (!file) throw new Error("No file provided");

    // --- Gọi BE để lấy chữ ký Cloudinary ---
    const sigRes = await http.get<ApiResponse<CloudinarySignatureResponse>>(
      `${envConfig.NEXT_PUBLIC_API_URL_SERVER}/cloudinary/signature`,
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

    // --- Gửi trực tiếp lên Cloudinary bằng axios mới, không qua interceptor ---
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const res = await axios.post<CloudinaryUploadResponse>(
      uploadUrl,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return res.data.secure_url;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Lỗi upload từ Cloudinary:",
        error.response?.data?.error?.message || error.message,
      );
    } else {
      console.error("Lỗi không xác định khi upload:", error);
    }
    return undefined;
  }
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

export const getSlugFromSlugUrl = (slug: string) => {
  return String(slug.split("-i.")[0]);
};

export const handleNotificationNavigation = (
  item: NotificationResType,
  router: AppRouterInstance,
) => {
  const type = item.type as NotificationType;

  switch (type) {
    case NotificationType.NEWS_CREATED:
      //- cần cho nó filer luôn các news đang cần duyệt
      router.push(`/admin/news?statusFilterNews=inactive`);
      break;

    case NotificationType.COMPANY_CREATED:
      router.push(`/admin/company?statusFilterCompany=PENDING`);
      break;

    //- recruiter_admin nhận yêu cầu tham gia từ recruiter
    case NotificationType.COMPANY_RECRUITER_JOINED:
      router.push(`/recruiter/manager/member-company`);
      break;

    case NotificationType.RESUME_SUBMITTED:
      router.push(`/recruiter/resumes`);
      break;

    case NotificationType.RESUME_STATUS_CHANGED:
      router.push(`/my-jobs/applied`);
      break;

    case NotificationType.SYSTEM_ANNOUNCEMENT:
      router.push(`/notifications/${item._id}`);
      break;

    default:
      console.warn("Unhandled notification type:", type);
      break;
  }
};

export const flattenTree = (nodes: any[]): any[] => {
  let flat: any[] = [];
  if (!nodes) return [];
  for (const node of nodes) {
    flat.push({ value: node._id, label: node.name });
    if (node.children && node.children.length > 0) {
      flat = flat.concat(flattenTree(node.children));
    }
  }
  return flat;
};

//- hàm tính số ngày từ hiện tại đến ngày hotUntil
export const calculateRemainingDays = (
  hotUntil: Date | null | undefined,
): number => {
  if (!hotUntil) return 0;

  const currentDate = new Date();
  const hotUntilDate = new Date(hotUntil);

  const timeDifference = hotUntilDate.getTime() - currentDate.getTime();
  const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return remainingDays;
};
