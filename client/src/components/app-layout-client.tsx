'use client'

import React, { useEffect, useState } from "react";
import HeaderClient from "@/_pages/components/HeaderClient";
import Footer from "@/app/(guest)/Footer";
import { useAppStore } from "@/components/TanstackProvider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isLogin } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isLoginStat = mounted ? isLogin : false;

  return (
    <div className="md:px-26 min-h-screen flex flex-col">
      <HeaderClient isLoginSSR={isLoginStat} />
      <main className="flex-grow flex flex-col">
          {children}
      </main>
      <div className="md:-mx-30">
        <Footer />
      </div>
    </div>
  );
}
