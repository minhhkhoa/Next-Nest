"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyCreateType } from "@/schemasvalidation/company";
import { COMPANY_SCALES } from "@/lib/constant";
import { MultiSelectTree } from "@/_pages/components/multi-select-industry";
import { useGetTreeIndustry } from "@/queries/useIndustry";

interface MultiLang {
  vi: string;
  en: string;
}

interface IndustryNode {
  _id: string;
  name: MultiLang;
  children: IndustryNode[];
}

interface Option {
  value: string;
  label: MultiLang;
}

const flattenTree = (nodes: IndustryNode[]): Option[] => {
  let flat: Option[] = [];
  for (const node of nodes) {
    flat.push({ value: node._id, label: node.name });
    if (node.children && node.children.length > 0) {
      flat = flat.concat(flattenTree(node.children));
    }
  }
  return flat;
};

interface BasicInfoStepProps {
  formData: CompanyCreateType;
  setFormData: (data: CompanyCreateType) => void;
  errors: Partial<CompanyCreateType>;
}

export default function BasicInfoStep({
  formData,
  setFormData,
  errors,
}: BasicInfoStepProps) {
  const { data: industryTree } = useGetTreeIndustry({});

  const flatIndustries = useMemo(() => {
    if (!industryTree?.data) return [];
    return flattenTree(industryTree.data);
  }, [industryTree]);

  const selectedOptions = useMemo(() => {
    if (!formData.industryID || !flatIndustries.length) return [];
    return formData.industryID
      .map((id) => flatIndustries.find((opt) => opt.value === id))
      .filter((opt): opt is Option => !!opt);
  }, [formData.industryID, flatIndustries]);

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
        <MultiSelectTree
          selected={selectedOptions}
          onChange={(options) => {
            const industryIDs = options.map((option) => option.value);
            setFormData({ ...formData, industryID: industryIDs });
          }}
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
