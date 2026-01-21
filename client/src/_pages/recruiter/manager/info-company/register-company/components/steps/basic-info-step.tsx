"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const COMPANY_SCALES = [
  { value: "1-10", label: "1 - 10 nhân viên" },
  { value: "11-50", label: "11 - 50 nhân viên" },
  { value: "51-200", label: "51 - 200 nhân viên" },
  { value: "201-500", label: "201 - 500 nhân viên" },
  { value: "500+", label: "Trên 500 nhân viên" },
];

interface BasicInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
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
          value={formData.companyName}
          onChange={(e) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
          className={errors.companyName ? "border-destructive" : ""}
        />
        {errors.companyName && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.companyName}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Tax ID - Readonly */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Mã số thuế <span className="text-destructive">*</span>
        </label>
        <Input
          value={formData.taxId}
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
          selected={formData.industries}
          onChange={(industries) => setFormData({ ...formData, industries })}
        />
        {errors.industries && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.industries}</AlertDescription>
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
          value={formData.scale}
          onValueChange={(value) => setFormData({ ...formData, scale: value })}
        >
          <SelectTrigger className={errors.scale ? "border-destructive" : ""}>
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
        {errors.scale && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.scale}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
