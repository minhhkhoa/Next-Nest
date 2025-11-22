"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BackToTopProps {
  showAfter?: number;
  className?: string;
  smooth?: boolean;
}

export default function BackToTop({
  showAfter = 320,
  className = "",
  smooth = true,
}: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > showAfter);
    }

    onScroll(); //- được gọi 1 lần ban đầu để đảm bảo nếu user reload trang và đang ở giữa page → nút vẫn hiện.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  function handleClick() {
    if (smooth && "scrollBehavior" in document.documentElement.style) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      //- fallback
      window.scrollTo(0, 0);
    }
  }

  //- respect prefers-reduced-motion for accessibility
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 ${className}`}
      aria-hidden={!visible}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={
              prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }
            }
          >
            <Button
              size="icon"
              onClick={handleClick}
              aria-label="Back to top"
              className="shadow-lg hover:scale-105 active:scale-95 focus:outline-none"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
