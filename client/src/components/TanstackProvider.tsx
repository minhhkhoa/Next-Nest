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
import { usePathname } from "next/navigation";
import { accessInstance } from "@/lib/http";
import { jwtDecode } from "jwt-decode";

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
  const handleRemoveToken = useCallback(async () => {
    removeTokensFromLocalStorage();
    await accessInstance.get("/auth/removeAccessToken");
  }, []);

  useEffect(() => {
    const token = getAccessTokenFromLocalStorage();
    let valid = false;

    try {
      //- kiểm tra token có hợp lệ không
      const decoded = token ? jwtDecode(token) : null;
      valid = !!decoded;
    } catch (err) {
      valid = false;
      console.log("err decode token in tanstack provider", err);
    }

    useAppStore.getState().setLogin(valid);

    //- nếu token không hợp lệ thì xoá token
    if (!valid) handleRemoveToken();
  }, [handleRemoveToken]);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools
        initialIsOpen={false}
        // panelProps={{
        //   style: { bottom: "80px", right: "20px" },
        // }}
      />
    </QueryClientProvider>
  );
}
