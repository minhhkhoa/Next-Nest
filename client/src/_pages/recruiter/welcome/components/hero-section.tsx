"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onConsult: () => void;
}

export default function HeroSection({
  onGetStarted,
  onConsult,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[calc(100vh-128px)] w-full overflow-hidden bg-gradient-to-br from-background to-muted px-4 py-20 md:px-8 md:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl md:right-20 md:h-96 md:w-96" />
        <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl md:left-20 md:h-96 md:w-96" />
      </div>

      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-balance text-4xl font-bold text-foreground md:text-6xl lg:text-7xl"
            >
              Nâng tầm thương hiệu tuyển dụng và tìm kiếm nhân tài hàng đầu
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-muted-foreground md:text-xl"
            >
              Kết nối với hàng triệu ứng viên chất lượng cao và quản lý quy
              trình tuyển dụng một cách hiệu quả.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Button onClick={onGetStarted} size="lg" className="group gap-2">
              Bắt đầu ngay
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button onClick={onConsult} variant="outline" size="lg">
              Liên hệ tư vấn
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-4 pt-8 text-center md:gap-8 md:pt-12"
          >
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary md:text-3xl">1M+</p>
              <p className="text-xs text-muted-foreground md:text-sm">
                Ứng viên
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary md:text-3xl">
                10k+
              </p>
              <p className="text-xs text-muted-foreground md:text-sm">
                Doanh nghiệp
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary md:text-3xl">90%</p>
              <p className="text-xs text-muted-foreground md:text-sm">
                Thành công
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
