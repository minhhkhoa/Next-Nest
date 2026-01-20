"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function VerificationSection() {
  const steps = [
    {
      number: 1,
      title: "Nhập Mã số thuế",
      description: "Cung cấp thông tin doanh nghiệp của bạn để bắt đầu",
    },
    {
      number: 2,
      title: "Admin hệ thống phê duyệt",
      description: "Chúng tôi xác thực doanh nghiệp của bạn để bảo vệ uy tín",
    },
    {
      number: 3,
      title: "Kích hoạt tài khoản",
      description:
        "Bắt đầu đăng tin tuyển dụng và tìm kiếm nhân tài ngay lập tức",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 space-y-4 text-center md:mb-16"
        >
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
            Quy trình xác thực
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            Quy trình đơn giản, bảo mật và minh bạch
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants}>
              <div className="flex gap-6 md:gap-8">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground font-semibold md:h-14 md:w-14">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="my-2 h-16 w-1 bg-gradient-to-b from-primary to-primary/20 md:h-24" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex flex-col justify-center pb-8 md:pb-0">
                  <h3 className="text-xl font-bold text-foreground md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 rounded-lg border border-border bg-muted p-6 md:p-8"
        >
          <div className="flex gap-4">
            <Check className="h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground md:text-lg">
                Bảo vệ uy tín doanh nghiệp
              </h4>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Chúng tôi xác thực mọi doanh nghiệp bằng mã số thuế chính thức
                để đảm bảo sự tin cậy và an toàn cho các ứng viên.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
