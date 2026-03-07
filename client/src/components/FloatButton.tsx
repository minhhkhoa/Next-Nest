"use client";

import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { Link } from "@/i18n/navigation";
import { BookMarked, BriefcaseBusiness, Settings2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BlockIssue from "./BlockIssue";
import { useAppStore } from "./TanstackProvider";

export function BookmarkNavigationButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground backdrop-blur flex items-center justify-center transition-colors"
          >
            <Link href="/saved-jobs">
              <BookMarked className="h-5 w-5" />
              <span className="sr-only">Việc làm đã lưu</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Việc làm & công ty đã lưu</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MyApplicationNavigationButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground backdrop-blur flex items-center justify-center transition-colors"
          >
            <Link href="/my-application">
              <BriefcaseBusiness className="h-5 w-5" />
              <span className="sr-only">Theo dõi đơn ứng tuyển</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Theo dõi đơn ứng tuyển</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const AllButtons = [
  {
    id: "bookmark",
    component: <BookmarkNavigationButton />,
  },
  {
    id: "support",
    component: <BlockIssue />,
  },
  {
    id: "my-application",
    component: <MyApplicationNavigationButton />,
  },
];

export function FloatButton() {
  const { isLogin } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  if (!isLogin) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: 20, scale: 0.8, filter: "blur(4px)" },
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-col-reverse items-end gap-3 pointer-events-auto"
          >
            {AllButtons.map((btn) => (
              <motion.div key={btn.id} variants={itemVariants}>
                {btn.component}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-auto"
        initial={false}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        <Button
          onClick={toggleOpen}
          size="icon"
          className="h-12 w-12 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-0 focus-visible:ring-offset-0 relative overflow-hidden group"
        >
          <motion.div
            initial={false}
            animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
            className="absolute inset-0 flex items-center justify-center"
            transition={{ duration: 0.2 }}
          >
            <Settings2 className="h-6 w-6 transition-transform group-hover:rotate-90 duration-300" />
          </motion.div>

          <motion.div
            initial={false}
            animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
            className="absolute inset-0 flex items-center justify-center"
            transition={{ duration: 0.2 }}
          >
            <X className="h-6 w-6" />
          </motion.div>

          <span className="sr-only">Toggle menu</span>
        </Button>
      </motion.div>
    </div>
  );
}
