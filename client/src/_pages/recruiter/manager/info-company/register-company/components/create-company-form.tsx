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
import { ChevronLeft, Building, Check } from "lucide-react";
import BasicInfoStep from "./steps/basic-info-step";
import BrandingStep from "./steps/branding-step";
import StepIndicator from "./step-indicator";
import { CompanyCreateType } from "@/schemasvalidation/company";
import { useCreateCompany } from "@/queries/useCompany";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";

interface CreateCompanyFormProps {
  initialTaxCode: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function CreateCompanyForm({
  initialTaxCode,
  onSuccess,
  onBack,
}: CreateCompanyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyCreateType>({
    name: "",
    taxCode: initialTaxCode,
    address: "",
    description: "",
    industryID: [],
    totalMember: "",
    website: "",
    banner: "",
    logo: "",
  });
  const [errors, setErrors] = useState<Partial<CompanyCreateType>>({});

  const { mutateAsync: createCompanyMutation, isPending: isSubmitting } =
    useCreateCompany();

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    // Simulate API call
    try {
      const res = await createCompanyMutation(formData);
      if (res.isError) return;

      SoftSuccessSonner(res.message);
    } catch (error) {
      console.log("error submit form create company: ", error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSuccess();
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<CompanyCreateType> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên công ty không được để trống";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ không được để trống";
    }
    if (formData.industryID.length === 0) {
      newErrors.industryID = ["Vui lòng chọn ít nhất một ngành nghề"];
    }
    if (!formData.totalMember) {
      newErrors.totalMember = "Vui lòng chọn quy mô công ty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<CompanyCreateType> = {};

    if (!formData.logo) {
      newErrors.logo = "Vui lòng tải lên logo";
    }
    if (!formData.banner) {
      newErrors.banner = "Vui lòng tải lên banner";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả công ty không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building className="w-6 h-6 text-accent" />
            Tạo hồ sơ công ty
          </h1>
          <p className="text-sm text-muted-foreground">
            Hoàn thành 2 bước để thiết lập tài khoản nhà tuyển dụng
          </p>
        </div>
      </motion.div>

      {/* Step Indicator */}
      <motion.div variants={itemVariants}>
        <StepIndicator currentStep={currentStep} totalSteps={2} />
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="!mt-2">
              {currentStep === 1 ? "Thông tin cơ bản" : "Nhận diện thương hiệu"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1
                ? "Cung cấp thông tin chính về công ty của bạn"
                : "Tải lên hình ảnh và mô tả về công ty"}
            </CardDescription>
          </CardHeader>

          <CardContent className="!mb-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: currentStep === 1 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: currentStep === 1 ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 ? (
                <BasicInfoStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              ) : (
                <BrandingStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              )}
            </motion.div>
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

        {currentStep === 1 ? (
          <Button
            onClick={handleNext}
            className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            Tiếp theo
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Hoàn thành
              </>
            )}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
