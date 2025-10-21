import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  if (!name) return ""

  const words = name
    .trim()
    .split(/\s+/) //- cắt khoảng trắng thừa
    .filter(Boolean)

  if (words.length === 0) return ""

  if (words.length === 1) {
    //- nếu chỉ có 1 từ -> chuẩn hóa (viết hoa chữ đầu, còn lại thường)
    const word = words[0].toLowerCase()
    return word.charAt(0).toUpperCase() + word.slice(1)
  }

  //- nếu có nhiều từ -> lấy chữ cái đầu của từ đầu + cuối (in hoa)
  const first = words[0][0]
  const last = words[words.length - 1][0]

  return (first + last).toUpperCase()
}