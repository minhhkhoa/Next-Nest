"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import Image from "next/image";

import { useGetCompanyDetail, useUpdateCompany } from "@/queries/useCompany";
import { useGetTreeIndustry } from "@/queries/useIndustry";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { CompanySkeleton } from "@/components/skeletons/company-skeleton";
import { flattenTree, uploadToCloudinary } from "@/lib/utils";
import { COMPANY_SCALES } from "@/lib/constant";
import { MultiSelectTree } from "@/_pages/components/multi-select-industry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { companyUpdate, CompanyUpdateType } from "@/schemasvalidation/company";

interface Props {
  companyId: string;
}

export default function ActiveCompanyPage({ companyId }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState({
    logo: false,
    banner: false,
  });
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { data: company, isLoading } = useGetCompanyDetail(companyId);
  const { mutateAsync: updateCompanyMutation, isPending: isUpdating } =
    useUpdateCompany();
  const { data: industryTree } = useGetTreeIndustry({});

  const flatIndustries = useMemo(
    () => flattenTree(industryTree?.data || []),
    [industryTree],
  );

  // 2. Khởi tạo Form với Zod
  const form = useForm<CompanyUpdateType>({
    resolver: zodResolver(companyUpdate),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      industryID: [],
      totalMember: "",
      website: "",
      banner: "",
      logo: "",
    },
  });

  // 3. Phẳng hóa dữ liệu từ API vào Form (Cực kỳ quan trọng)
  useEffect(() => {
    if (company?.data) {
      const industryIdsOnly = company.data.industryID?.map((item: any) =>
        typeof item === "string" ? item : item._id,
      );

      form.reset({
        name: company.data.name,
        address: company.data.address,
        description: company.data.description?.vi || "",
        industryID: industryIdsOnly,
        totalMember: company.data.totalMember,
        website: company.data.website,
        banner: company.data.banner,
        logo: company.data.logo,
      });
    }
  }, [company, form]);

  const currentIndustryIDs = form.watch("industryID");

  const selectedIndustryOptions = useMemo(() => {
    if (!currentIndustryIDs?.length || !flatIndustries.length) return [];
    return currentIndustryIDs
      .map((id) => flatIndustries.find((opt) => opt.value === id))
      .filter(Boolean);
  }, [currentIndustryIDs, flatIndustries]);

  const handleFileChange = async (
    file: File | null,
    type: "logo" | "banner",
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return SoftDestructiveSonner("Vui lòng chọn hình ảnh");

    try {
      setIsUploading((prev) => ({ ...prev, [type]: true }));
      const url = await uploadToCloudinary(file);
      if (url) {
        form.setValue(type, url, { shouldDirty: true });
        SoftSuccessSonner(`Tải lên ${type} thành công`);
      }
    } catch (error) {
      console.log("Lỗi upload media: ", error);
    } finally {
      setIsUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const onSubmit = async (values: CompanyUpdateType) => {
    try {
      const res = await updateCompanyMutation({
        id: companyId,
        payload: values,
      });
      if (res.isError) return;
      setIsEditing(false);
      SoftSuccessSonner(res.message);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  if (isLoading) return <CompanySkeleton />;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Hồ sơ doanh nghiệp
              </h1>
              <p className="text-muted-foreground">
                Quản lý thông tin công khai và pháp lý
              </p>
            </div>
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit3 className="w-4 h-4" /> Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                  className="gap-2"
                >
                  <X className="w-4 h-4" /> Hủy
                </Button>
                <Button type="submit" className="gap-2" disabled={isUpdating}>
                  {isUpdating ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </div>

          {/* Banner & Logo Card */}
          <Card className="overflow-hidden border-2 relative">
            <div className="h-48 bg-muted relative group">
              <Image
                src={form.watch("banner") || "https://placehold.co/1200x400"}
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

            <div className="absolute bottom-8 left-12 bg-background rounded-xl border-2 shadow-lg group w-24 h-24 overflow-hidden">
              <Image
                src={form.watch("logo") || "/avatar-default.webp"}
                alt="Logo"
                className="w-full h-full object-contain bg-white"
                width={96}
                height={96}
                priority
              />
              {isEditing && (
                <div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {isUploading.logo ? (
                    <Loader2 className="animate-spin text-white w-6 h-6" />
                  ) : (
                    <Camera className="text-white w-6 h-6" />
                  )}
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] || null, "logo")
                    }
                  />
                </div>
              )}
            </div>

            <div className="px-8 flex justify-between items-center md:-translate-y-4">
              <div className="ml-32 md:ml-36 space-y-1">
                <h2 className="text-2xl font-bold">{company?.data?.name}</h2>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">{company?.data?.taxCode}</Badge>
                  <Badge className="bg-green-500/10 text-green-500">
                    Đã xác thực
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" /> Thông tin cơ
                  bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên công ty</FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <Input {...field} />
                        ) : (
                          <p className="text-sm font-medium">{field.value}</p>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <Input {...field} />
                          </div>
                        ) : (
                          <p className="text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {field.value}
                          </p>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industryID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Ngành nghề
                      </FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <MultiSelectTree
                            selected={selectedIndustryOptions}
                            onChange={(opts) =>
                              field.onChange(opts.map((o: any) => o.value))
                            }
                          />
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedIndustryOptions.map((opt: any) => (
                              <Badge key={opt.value} variant="secondary">
                                {opt.label?.vi || opt.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalMember"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quy mô nhân sự</FormLabel>
                      {isEditing ? (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn quy mô" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COMPANY_SCALES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm flex items-center gap-2">
                          <Users className="w-4 h-4" /> {field.value} nhân viên
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Mô tả
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {isEditing ? (
                          <Textarea
                            {...field}
                            className="min-h-[200px]"
                            placeholder="Giới thiệu về công ty..."
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {field.value}
                          </p>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
