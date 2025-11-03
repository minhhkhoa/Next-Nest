"use client";

import { useAppStore } from "@/components/TanstackProvider";
import { useGetProfile } from "@/queries/useAuth";
import { UserResponseType } from "@/schemasvalidation/user";
import React, { useEffect } from "react";

export default function BlockWrap({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setUser, isLogin } = useAppStore();
  const { data } = useGetProfile(isLogin);

  useEffect(() => {
    if (data?.data?.user) {
      setUser(data.data.user as UserResponseType);
    }
  }, [data, setUser]);
  
  return <>{children}</>;
}
