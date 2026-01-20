"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BarChart3, Zap, Brain } from "lucide-react";

export default function EcosystemSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Dashboard quản lý thông minh",
      description:
        "Theo dõi toàn bộ quy trình tuyển dụng từ đơn xin việc đến quyết định cuối cùng",
    },
    {
      icon: Brain,
      title: "AI gợi ý ứng viên",
      description:
        "Công nghệ machine learning tìm kiếm ứng viên phù hợp nhất với công việc của bạn",
    },
    {
      icon: Zap,
      title: "Hệ thống quản lý ATS",
      description:
        "Tự động hóa quy trình tuyển dụng và tiết kiệm thời gian quý giá",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="w-full px-4 py-20 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 space-y-4 text-center md:mb-16"
        >
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
            Hệ sinh thái
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            Các tính năng mạnh mẽ giúp bạn tìm kiếm nhân tài một cách hiệu quả
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group flex h-full flex-col gap-4 border-border p-6 transition-all duration-300 hover:border-primary hover:shadow-lg md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary">
                    <Icon className="h-6 w-6 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground md:text-xl">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground md:text-base">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
