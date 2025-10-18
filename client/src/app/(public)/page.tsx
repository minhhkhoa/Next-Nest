"use client";

import { Button } from "@/components/ui/button";
import http from "@/lib/http";
import { setAccessTokenToLocalStorage } from "@/lib/utils";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const access_token = searchParams.get("access_token");
  const getPage = async () => {
    const response = await http.get("auth/profile");
    console.log("res: ", response);
  };

  useEffect(() => {
    if (!access_token) return;

    setAccessTokenToLocalStorage(access_token);
  }, [access_token]);

  useEffect(() => {
    getPage();
  }, []);

  return (
    <>
      <Button>Click me!</Button>
    </>
  );
}
