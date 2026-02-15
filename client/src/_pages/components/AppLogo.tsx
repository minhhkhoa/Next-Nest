"use client";

import Link from "next/link";
import React from "react";

export default function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-10 overflow-hidden rounded-lg">
        <video
          src="/videos/video_logo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>

      <Link href="/" className="hidden text-lg font-semibold md:inline">
        JobHub
      </Link>
    </div>
  );
}
