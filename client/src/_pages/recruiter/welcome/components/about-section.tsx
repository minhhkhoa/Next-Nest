"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
  const stats = [
    {
      value: "1M+",
      label: "Ứng viên",
      description: "Cơ sở dữ liệu ứng viên IT chất lượng cao từ khắp nơi",
    },
    {
      value: "10k+",
      label: "Doanh nghiệp",
      description: "Các công ty tin tưởng nền tảng của chúng tôi",
    },
    {
      value: "90%",
      label: "Tỷ lệ kết nối",
      description: "Thành công - cao nhất trong ngành",
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
            Về chúng tôi
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            Những con số ấn tượng chứng minh sức mạnh của nền tảng
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 md:grid-cols-3"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="space-y-4 rounded-lg border border-border bg-card p-6 md:p-8"
            >
              <div className="space-y-2">
                <p className="text-4xl font-bold text-primary md:text-5xl">
                  {stat.value}
                </p>
                <p className="text-lg font-semibold text-foreground md:text-xl">
                  {stat.label}
                </p>
              </div>
              <p className="text-sm text-muted-foreground md:text-base">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
