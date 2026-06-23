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
import { useTranslations } from "next-intl";

export function BookmarkNavigationButton() {
  const t = useTranslations("Common.FloatButton");
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 pointer-events-auto">
            {/*- nhãn hiển thị bên cạnh icon trên mobile giúp người dùng dễ nhận biết do không có hover */}
            <span className="px-2 py-1 rounded bg-black/80 dark:bg-slate-900/90 text-white text-[11px] font-medium shadow-md pointer-events-none sm:hidden whitespace-nowrap">
              {t("SavedJobsMobile")}
            </span>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground backdrop-blur flex items-center justify-center transition-colors shrink-0"
            >
              <Link href="/saved-jobs">
                <BookMarked className="h-5 w-5" />
                <span className="sr-only">{t("SavedJobsSrOnly")}</span>
              </Link>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="hidden sm:block">
          <p>{t("SavedJobsTooltip")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MyApplicationNavigationButton() {
  const t = useTranslations("Common.FloatButton");
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 pointer-events-auto">
            {/*- nhãn hiển thị bên cạnh icon trên mobile giúp người dùng dễ nhận biết do không có hover */}
            <span className="px-2 py-1 rounded bg-black/80 dark:bg-slate-900/90 text-white text-[11px] font-medium shadow-md pointer-events-none sm:hidden whitespace-nowrap">
              {t("MyApplicationsMobile")}
            </span>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground backdrop-blur flex items-center justify-center transition-colors shrink-0"
            >
              <Link href="/my-application">
                <BriefcaseBusiness className="h-4 w-4" />
                <span className="sr-only">{t("MyApplicationsSrOnly")}</span>
              </Link>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="hidden sm:block">
          <p>{t("MyApplicationsTooltip")}</p>
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
  const t = useTranslations("Common.FloatButton");

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
          className="h-10 w-10 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-0 focus-visible:ring-offset-0 relative overflow-hidden group"
        >
          <motion.div
            initial={false}
            animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
            className="absolute inset-0 flex items-center justify-center"
            transition={{ duration: 0.2 }}
          >
            <Settings2 className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
          </motion.div>

          <motion.div
            initial={false}
            animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
            className="absolute inset-0 flex items-center justify-center"
            transition={{ duration: 0.2 }}
          >
            <X className="h-5 w-5" />
          </motion.div>

          <span className="sr-only">{t("ToggleMenu")}</span>
        </Button>
      </motion.div>
    </div>
  );
}
