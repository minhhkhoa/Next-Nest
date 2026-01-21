"use client";

import Link from "next/link";
import React from "react";

export default function AppLogo() {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-lg font-bold">K</span>
        </div>
        <Link href={"/"} className="hidden text-lg font-semibold md:inline">
          JobHub
        </Link>
      </div>
    </>
  );
}
