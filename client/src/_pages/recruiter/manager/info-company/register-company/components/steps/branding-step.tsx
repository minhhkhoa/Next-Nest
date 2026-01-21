"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface BrandingStepProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
}

export default function BrandingStep({
  formData,
  setFormData,
  errors,
}: BrandingStepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleFileChange = (file: File | null, type: "logo" | "banner") => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Tệp không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (type === "logo") {
        setFormData({ ...formData, logo: file });
        setLogoPreview(preview);
      } else {
        setFormData({ ...formData, banner: file });
        setBannerPreview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Logo công ty <span className="text-destructive">*</span>
        </label>
        <div className="space-y-3">
          {!logoPreview ? (
            <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(e.target.files?.[0] || null, "logo")
                }
                className="hidden"
              />
              <div className="text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Tải lên logo</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG (Tối đa 5MB)
                </p>
              </div>
            </label>
          ) : (
            <div className="relative">
              <Image
                src={logoPreview || "/placeholder.svg"}
                alt="Logo preview"
                className="w-24 h-24 object-cover rounded-lg"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={() => {
                  setFormData({ ...formData, logo: null });
                  setLogoPreview(null);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        {errors.logo && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.logo}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Banner Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Banner <span className="text-destructive">*</span>
        </label>
        <div className="space-y-3">
          {!bannerPreview ? (
            <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(e.target.files?.[0] || null, "banner")
                }
                className="hidden"
              />
              <div className="text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Tải lên banner</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG (Tối đa 5MB)
                </p>
              </div>
            </label>
          ) : (
            <div className="relative">
              <Image
                src={bannerPreview || "/placeholder.svg"}
                alt="Banner preview"
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={() => {
                  setFormData({ ...formData, banner: null });
                  setBannerPreview(null);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        {errors.banner && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.banner}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Mô tả công ty <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="Mô tả chi tiết về công ty, lĩnh vực hoạt động, giá trị cốt lõi..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className={`min-h-32 resize-none ${
            errors.description ? "border-destructive" : ""
          }`}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <p>Mô tả giúp ứng viên hiểu rõ hơn về công ty</p>
          <p>{formData.description.length}/500</p>
        </div>
        {errors.description && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.description}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
