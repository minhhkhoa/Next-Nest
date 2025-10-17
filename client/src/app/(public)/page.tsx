"use client";

import { Button } from "@/components/ui/button";
import http from "@/lib/http";
import { setAccessTokenToLocalStorage } from "@/lib/utils";
import { useEffect } from "react";
import { envConfig } from "../../../config";

export default function Home() {
  const getPage = async () => {
    const response = await http.get("auth/profile");
    console.log("res: ", response);
  };

  useEffect(() => {
    //- phải làm thế này ko có api chưa trả về jwt đang test trả về name
    const tokenTest = envConfig.NEXT_PUBLIC_TOKEN_TEST;
    setAccessTokenToLocalStorage(tokenTest);
    getPage();
  }, []);

  return (
    <>
      <Button>Click me!</Button>
    </>
  );
}
