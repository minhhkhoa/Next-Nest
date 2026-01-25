"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetCompanyDetail } from "@/queries/useCompany";

interface JoinCompanyCardProps {
  companyId: string;
  onBack: () => void;
}

export default function JoinCompanyCard({
  companyId,
  onBack,
}: JoinCompanyCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: detailCompany } = useGetCompanyDetail(companyId);

  console.log("check company detail: ", detailCompany);

  const existingCompany = detailCompany?.data;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do gia nhập");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (showSuccess) {
    return (
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-border/50 text-center">
            <CardContent className="pt-12 pb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="bg-accent/10 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-accent" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold mb-3">Yêu cầu đã được gửi</h2>
              <p className="text-muted-foreground mb-8">
                Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận yêu
                cầu gia nhập
              </p>

              <Button
                onClick={onBack}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
              >
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-lg hover:bg-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Gia nhập công ty</h1>
      </motion.div>

      {/* Alert */}
      <motion.div variants={itemVariants}>
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="text-foreground">
            Doanh nghiệp này đã có trên hệ thống. Gửi yêu cầu gia nhập để quản
            trị tuyển dụng phê duyệt bạn vào công ty.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Company Info Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-border/50 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle>Thông tin công ty</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center text-3xl">
                  {existingCompany?.logo || "🏢"}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">
                  {existingCompany?.companyName || "Tên công ty"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  MST: {existingCompany?.taxCode}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {existingCompany?.address || "Địa chỉ"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Request Form */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle>Lý do gia nhập</CardTitle>
            <CardDescription>
              Giúp chúng tôi hiểu thêm về yêu cầu của bạn
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              placeholder="Vui lòng mô tả lý do bạn muốn gia nhập công ty này..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-32 resize-none"
              disabled={isSubmitting}
            />

            <p className="text-xs text-muted-foreground">
              Tối thiểu 10 ký tự - Tối đa 500 ký tự
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 bg-transparent"
        >
          Hủy
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !reason.trim()}
          className="px-8 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              Đang gửi...
            </>
          ) : (
            "Gửi yêu cầu gia nhập"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
