"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit3,
  Save,
  X,
  Building2,
  Users,
  FileText,
  MapPin,
  Camera,
  Loader2,
  Briefcase,
} from "lucide-react";
import { useGetCompanyDetail, useUpdateCompany } from "@/queries/useCompany";
import Image from "next/image";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { flattenTree, uploadToCloudinary } from "@/lib/utils";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { useGetTreeIndustry } from "@/queries/useIndustry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMPANY_SCALES } from "@/lib/constant";
import { MultiSelectTree } from "@/_pages/components/multi-select-industry";

interface Props {
  companyId: string;
}

export default function ActiveCompanyPage({ companyId }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState<{
    logo: boolean;
    banner: boolean;
  }>({
    logo: false,
    banner: false,
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { data: company, isLoading } = useGetCompanyDetail(companyId);
  const { mutateAsync: updateCompanyMutation, isPending: isUpdating } =
    useUpdateCompany();
  const { data: industryTree } = useGetTreeIndustry({});

  const flatIndustries = useMemo(() => {
    return flattenTree(industryTree?.data || []);
  }, [industryTree]);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: company?.data,
  });

  const currentIndustryIDs = watch("industryID") || [];

  const selectedIndustryOptions = useMemo(() => {
    if (!currentIndustryIDs.length || !flatIndustries.length) return [];

    return currentIndustryIDs
      .map((id: string) => {
        const found = flatIndustries.find((opt) => opt.value === id);
        return found || null;
      })
      .filter(Boolean);
  }, [currentIndustryIDs, flatIndustries]);

  // Watch để xem trước ảnh trực tiếp từ form state
  const logoUrl = watch("logo");
  const bannerUrl = watch("banner");

  const handleFileChange = async (
    file: File | null,
    type: "logo" | "banner",
  ) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      SoftDestructiveSonner("Vui lòng chọn tệp hình ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      SoftDestructiveSonner("Tệp không được vượt quá 5MB");
      return;
    }

    try {
      setIsUploading((prev) => ({ ...prev, [type]: true }));
      const url = await uploadToCloudinary(file);

      if (url) {
        setValue(type, url, { shouldDirty: true });
        SoftSuccessSonner(`Tải lên ${type} thành công`);
      }
    } catch (error) {
      SoftDestructiveSonner("Lỗi upload media");
    } finally {
      setIsUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    if (company?.data) {
      const industryIdsOnly = company.data.industryID?.map((item: any) =>
        typeof item === "string" ? item : item._id,
      );

      reset({
        ...company.data,
        industryID: industryIdsOnly,
        description: {
          vi: company.data.description?.vi || "",
          en: company.data.description?.en || "",
        },
      });
    }
  }, [company, reset]);

  const onSubmit = async (payload: any) => {
    console.log("payload: ", payload);
    const descriptionPayload = payload.description.vi;
    //- xoa payload cu description de tao payload moi
    delete payload.description;

    //- add lai
    payload.description = descriptionPayload;

    try {
      const res = await updateCompanyMutation({ id: companyId, payload });
      if (res.isError) return;
      setIsEditing(false);
      SoftSuccessSonner(res.message);
    } catch (error) {
      console.log("Error handle submit:", error);
    }
  };

  if (isLoading) return <CompanySkeleton />;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hồ sơ doanh nghiệp
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin công khai và pháp lý của công ty
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit3 className="w-4 h-4" /> Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              className="gap-2"
            >
              <X className="w-4 h-4" /> Hủy
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              className="gap-2"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        )}
      </div>

      <form className="grid gap-6">
        {/* Banner & Logo Section */}
        <Card className="overflow-hidden border-2 relative">
          {/* Banner Section */}
          <div className="h-48 bg-muted relative group">
            <Image
              src={bannerUrl || "https://placehold.co/1200x400"}
              alt="Banner"
              className="w-full h-full object-cover"
              width={1200}
              height={400}
            />
            {isEditing && (
              <div
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => bannerInputRef.current?.click()}
              >
                {isUploading.banner ? (
                  <Loader2 className="animate-spin text-white w-8 h-8" />
                ) : (
                  <Camera className="text-white w-8 h-8" />
                )}
                <input
                  type="file"
                  ref={bannerInputRef}
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] || null, "banner")
                  }
                />
              </div>
            )}
          </div>

          {/* Logo Section */}
          <div className="absolute bottom-8 left-12 bg-background rounded-xl border-2 shadow-lg group w-24 h-24 overflow-hidden">
            <div className="relative w-full h-full bg-card">
              <Image
                src={logoUrl || "https://placehold.co/100x100"}
                alt="Logo"
                className="w-full h-full object-contain bg-white"
                width={96}
                height={96}
                priority
              />

              {/* Overlay: Chỉ render khi isEditing nhưng điều khiển hiển thị bằng CSS group-hover */}
              {isEditing && (
                <div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Ngăn sự kiện nổi bọt gây nháy
                    logoInputRef.current?.click();
                  }}
                >
                  {isUploading.logo ? (
                    <Loader2 className="animate-spin text-white w-6 h-6" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="text-white w-6 h-6" />
                      <span className="text-[10px] text-white font-medium">
                        Thay đổi
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Input ẩn nên để ra ngoài hẳn hoặc cuối cùng của khối absolute */}
            <input
              type="file"
              ref={logoInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) =>
                handleFileChange(e.target.files?.[0] || null, "logo")
              }
            />
          </div>

          <div className="px-8 flex justify-between items-center md:-translate-y-4">
            <div className="ml-32 md:ml-36 space-y-1">
              <h2 className="text-2xl font-bold">{company?.data?.name}</h2>
              <div className="flex gap-2 text-xs">
                <Badge variant="outline">{company?.data?.taxCode}</Badge>
                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                  Đã xác thực
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên công ty</Label>
                {isEditing ? (
                  <Input {...register("name")} />
                ) : (
                  <p className="text-sm font-medium">{company?.data?.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                {isEditing ? (
                  <div className="flex gap-2 items-center">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <Input {...register("address")} />
                  </div>
                ) : (
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {company?.data?.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Website</Label>
                  {isEditing ? (
                    <Input {...register("website")} />
                  ) : (
                    <p className="text-sm text-blue-500 underline truncate">
                      {company?.data?.website}
                    </p>
                  )}
                </div>

                {/* Phần hiển thị Ngành nghề */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Ngành nghề kinh doanh
                  </Label>

                  {isEditing ? (
                    <MultiSelectTree
                      selected={selectedIndustryOptions}
                      onChange={(options) => {
                        // Chỉ lưu mảng string ID vào form state
                        const ids = options.map((opt: any) => opt.value);
                        setValue("industryID", ids, { shouldDirty: true });
                      }}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIndustryOptions.length > 0 ? (
                        selectedIndustryOptions.map((opt: any) => (
                          <Badge
                            key={opt.value}
                            variant="secondary"
                            className="font-normal"
                          >
                            {/* API trả về label có cấu trúc {vi, en} */}
                            {opt.label?.vi || opt.label}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Chưa cập nhật ngành nghề
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Quy mô công ty (Sử dụng Select như mẫu BasicInfoStep của Khoa) */}
                <div className="space-y-2">
                  <Label>Quy mô nhân sự</Label>
                  {isEditing ? (
                    <Select
                      value={watch("totalMember")}
                      onValueChange={(val) =>
                        setValue("totalMember", val, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn quy mô" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SCALES.map((scale) => (
                          <SelectItem key={scale.value} value={scale.value}>
                            {scale.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" /> {company?.data?.totalMember}{" "}
                      nhân viên
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Mô tả doanh nghiệp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {isEditing ? (
                  <Textarea
                    {...register("description.vi")}
                    className="min-h-[150px]"
                    placeholder="Nhập mô tả công ty..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {company?.data?.description?.vi}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

const CompanySkeleton = () => (
  <div className="container mx-auto py-8 max-w-4xl space-y-6">
    <Skeleton className="h-12 w-1/3" />
    <Skeleton className="h-48 w-full rounded-xl" />
    <div className="grid grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);
