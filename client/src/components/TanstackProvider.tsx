"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { create } from "zustand";
import { useEffect } from "react";
import { getAccessTokenFromLocalStorage } from "@/lib/utils";

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
}

export const useAppStore = create<AppStoreType>((set) => ({
  isLogin: false,
  setLogin: (value) => set({ isLogin: value }),
}));

export default function TanstackProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    //- khi load lại trang thì store sẽ làm mới nên phải set lại giá trị login
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      useAppStore.getState().setLogin(true);
    }
  }, [])
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
