"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { create } from "zustand";
import { useCallback, useEffect } from "react";
import {
  getAccessTokenFromLocalStorage,
  removeTokensFromLocalStorage,
} from "@/lib/utils";
import { UserResponseType } from "@/schemasvalidation/user";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { accessInstance } from "@/lib/http";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

interface AppStoreType {
  isLogin: boolean;
  setLogin: (value: boolean) => void;
  user: UserResponseType;
  setUser: (value: UserResponseType) => void;
}

export const useAppStore = create<AppStoreType>((set) => ({
  isLogin: false,
  setLogin: (value) => set({ isLogin: value }),
  user: {} as UserResponseType,
  setUser: (value) => set({ user: value }),
}));

export default function TanstackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleRemoveToken = useCallback(async () => {
    removeTokensFromLocalStorage();
    await accessInstance.get("/auth/removeAccessToken");
  }, []);

  useEffect(() => {
    //- khi load lại trang thì store sẽ làm mới nên phải set lại giá trị login
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      useAppStore.getState().setLogin(true);
    } else {
      useAppStore.getState().setLogin(false);
      if (pathname !== "/login") {
        handleRemoveToken();
      }
    }
  }, [handleRemoveToken, pathname]);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
