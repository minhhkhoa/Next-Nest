"use client";

import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MultiSelect from "../multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyCreateType } from "@/schemasvalidation/company";
import { COMPANY_SCALES } from "@/lib/constant";

const INDUSTRIES = [
  { value: "tech", label: "Công nghệ thông tin" },
  { value: "finance", label: "Tài chính - Ngân hàng" },
  { value: "healthcare", label: "Y tế - Dược phẩm" },
  { value: "retail", label: "Bán lẻ - Thương mại" },
  { value: "education", label: "Giáo dục" },
  { value: "manufacturing", label: "Sản xuất" },
  { value: "logistics", label: "Logistics - Vận chuyển" },
  { value: "real-estate", label: "Bất động sản" },
];

interface BasicInfoStepProps {
  formData: CompanyCreateType;
  setFormData: (data: CompanyCreateType) => void;
  errors: Partial<CompanyCreateType>; //- Partial<T> có nghĩa là mọi field đều có thể là undefined.Vì có thể chỉ có một số field bị lỗi trong quá trình validate
}

export default function BasicInfoStep({
  formData,
  setFormData,
  errors,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      {/* Company Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Tên công ty <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="Nhập tên công ty"
          value={formData?.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors?.name ? "border-destructive" : ""}
        />
        {errors?.name && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors?.name}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Tax ID - Readonly */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Mã số thuế <span className="text-destructive">*</span>
        </label>
        <Input
          value={formData.taxCode}
          disabled
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Không thể thay đổi mã số thuế
        </p>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Địa chỉ <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1, TP.HCM"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.address}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Industries */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Ngành nghề <span className="text-destructive">*</span>
        </label>
        <MultiSelect
          options={INDUSTRIES}
          selected={formData.industryID}
          onChange={(industryID) => setFormData({ ...formData, industryID })}
        />
        {errors.industryID && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.industryID}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Website */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Website</label>
        <Input
          type="url"
          placeholder="https://example.com"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
        />
      </div>

      {/* Company Scale */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Quy mô công ty <span className="text-destructive">*</span>
        </label>
        <Select
          value={formData.totalMember}
          onValueChange={(value) =>
            setFormData({ ...formData, totalMember: value })
          }
        >
          <SelectTrigger
            className={errors.totalMember ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Chọn quy mô công ty" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SCALES.map((scale) => (
              <SelectItem key={scale.value} value={scale.value}>
                {scale.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.totalMember && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.totalMember}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
