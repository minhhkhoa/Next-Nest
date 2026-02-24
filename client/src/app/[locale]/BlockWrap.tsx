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
  const { setUser, setLogin, isLogin } = useAppStore();
  const { data: myProfile } = useGetProfile(isLogin);

  useEffect(() => {
    if (myProfile?.data?.user) {
      setUser(myProfile.data.user as UserResponseType);
      setLogin(true);
    }
  }, [myProfile, setUser, setLogin]);

  return <>{children}</>;
}
