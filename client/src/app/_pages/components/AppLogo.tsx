"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function AppLogo() {
  const router = useRouter();
  return (
    <>
      <h1 className="font-bold cursor-pointer" onClick={() => router.push("/")}>
        Logo
      </h1>
    </>
  );
}
