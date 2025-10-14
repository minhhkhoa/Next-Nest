"use client";

import { Button } from "@/components/ui/button";
import http from "@/lib/http";
import { useEffect } from "react";

export default function Home() {
  const getPage = async () => {
    const response = await http.get("auth/profile");
    console.log("res: ", response);
  };

  useEffect(() => {
    getPage();
  }, []);
  return (
    <>
      <Button>Click me!</Button>
    </>
  );
}
