"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "Gói Miễn phí",
      price: "0",
      description: "Bắt đầu với các tính năng cơ bản",
      features: [
        "Đăng tin tuyển dụng miễn phí",
        "Tìm kiếm ứng viên cơ bản",
        "Quản lý hồ sơ ứng viên",
        "Hỗ trợ email",
      ],
      cta: "Bắt đầu miễn phí",
      highlighted: false,
    },
    {
      name: "Gói Pro",
      price: "99",
      period: "/tháng",
      description: "Dành cho doanh nghiệp vừa",
      features: [
        "Mọi tính năng Gói Miễn phí",
        "Gợi ý ứng viên bằng AI",
        "Đăng tin không giới hạn",
        "Analytics chi tiết",
        "Hỗ trợ ưu tiên",
      ],
      cta: "Nâng cấp lên Pro",
      highlighted: true,
    },
    {
      name: "Gói Doanh nghiệp",
      price: "Tùy chỉnh",
      description: "Cho doanh nghiệp lớn và nhu cầu đặc biệt",
      features: [
        "Mọi tính năng Gói Pro",
        "Tích hợp API tùy chỉnh",
        "Quản lý nhiều tài khoản",
        "Đội hỗ trợ chuyên dụng",
        "SLA đảm bảo",
      ],
      cta: "Liên hệ",
      highlighted: false,
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
            Bảng giá
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            Chọn gói phù hợp với nhu cầu tuyển dụng của bạn
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3 lg:gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card
                className={`relative flex flex-col gap-6 p-6 transition-all duration-300 md:p-8 ${
                  plan.highlighted
                    ? "border-2 border-primary shadow-lg ring-1 ring-primary/20 md:scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground">
                    Khuyên dùng
                  </Badge>
                )}

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3 border-t border-border pt-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="mb-4 text-muted-foreground md:text-lg">
            Bạn có thắc mắc về gói dịch vụ?
          </p>
          <Button variant="outline" size="lg">
            Liên hệ tư vấn của chúng tôi
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
