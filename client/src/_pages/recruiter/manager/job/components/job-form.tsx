"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { JobResType, jobCreate, jobUpdate } from "@/schemasvalidation/job";
import { useAppStore } from "@/components/TanstackProvider";
import { flattenTree, getRoleRecruiterAdmin } from "@/lib/utils";
import { useGetTreeIndustry } from "@/queries/useIndustry";
import { MainContent } from "./form/MainContent";
import { LocationSkills } from "./form/LocationSkills";
import { JobSpecs } from "./form/JobSpecs";
import { SalaryDeadline } from "./form/SalaryDeadline";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface JobFormProps {
  initialData?: JobResType;
  onSubmit: (values: any) => Promise<void>;
  isPending: boolean;
}

export default function JobForm({
  initialData,
  onSubmit,
  isPending,
}: JobFormProps) {
  const router = useRouter();
  const { user } = useAppStore();
  const isUpdate = !!initialData;
  const roleRecruiterAdmin = getRoleRecruiterAdmin();
  const isRecruiterAdmin = user?.roleCodeName === roleRecruiterAdmin;

  // 1. Fetch dữ liệu cây ngành nghề
  const { data: industryTree } = useGetTreeIndustry({});

  // 2. Phẳng hóa dữ liệu để tìm kiếm cho nhanh
  const flatIndustries = useMemo(
    () => flattenTree(industryTree?.data || []),
    [industryTree],
  );

  //- Khởi tạo Form với Resolver dựa trên chế độ Create/Update
  const form = useForm<any>({
    resolver: zodResolver(isUpdate ? jobUpdate : jobCreate),
    defaultValues: isUpdate
      ? {
          ...initialData,
          title: initialData.title.vi,
          description: initialData.description.vi,
          startDate: new Date(initialData.startDate),
          endDate: new Date(initialData.endDate),
        }
      : {
          title: "",
          description: "",
          companyID: user?.employerInfo?.companyID || "",
          industryID: [],
          skills: [],
          location: "",
          quantity: 1,
          level: "",
          employeeType: "",
          experience: "",
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          salary: { min: 0, max: 0, currency: "VND" },
        },
  });

  // 1. Trích xuất việc theo dõi industryID ra một biến riêng
  const watchedIndustryIDs = form.watch("industryID");

  // 2. Sử dụng biến đó trong useMemo
  const selectedIndustryOptions = useMemo(() => {
    // Dùng luôn watchedIndustryIDs thay vì form.getValues để đồng bộ
    const ids = watchedIndustryIDs || [];

    if (!ids.length || !flatIndustries.length) return [];

    return ids
      .map((id: string) => flatIndustries.find((opt: any) => opt.value === id))
      .filter(Boolean);

    // ESLint sẽ hết báo lỗi vì watchedIndustryIDs là một giá trị cụ thể, không phải là lời gọi hàm
  }, [watchedIndustryIDs, flatIndustries]);

  //-. Hàm xử lý submit
  const onHandleSubmit = async (values: any) => {
    try {
      console.log("values: ", values);
      // await onSubmit(values);
    } catch (error) {}
  };

  useEffect(() => {
    if (initialData) {
      // Nếu backend trả về object (populate), ta chỉ lấy _id
      const industryIdsOnly = initialData.industryID?.map((item: any) =>
        typeof item === "string" ? item : item._id,
      );

      form.reset({
        ...initialData,
        title: initialData.title.vi || initialData.title,
        description: initialData.description.vi || initialData.description,
        industryID: industryIdsOnly || [],
        // Đảm bảo skills luôn là mảng để tránh lỗi .map
        skills: initialData.skills || [],
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onHandleSubmit)}
        className="space-y-8 max-w-7xl mx-auto pb-20"
      >
        {/* Sticky Header Action Bar */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Phần Tiêu đề bên trái */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="shrink-0" // Ngăn button bị méo khi text dài
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                {" "}
                {/* min-w-0 giúp text truncate nếu quá dài */}
                <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">
                  {isUpdate ? "Chỉnh sửa bài đăng" : "Tạo tin tuyển dụng mới"}
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground italic truncate">
                  {isUpdate
                    ? `Cập nhật lần cuối: ${new Date(initialData.updatedAt).toLocaleString("vi-VN")}`
                    : "Tin của bạn sẽ được kiểm duyệt sau khi đăng"}
                </p>
              </div>
            </div>

            {/* Phần Button hành động bên phải */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 md:flex-none" // Mobile chiếm hết chỗ trống còn lại
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="min-w-[100px] md:min-w-[120px] flex-1 md:flex-none"
                disabled={isPending}
              >
                {isPending ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : isUpdate ? (
                  "Cập nhật"
                ) : (
                  "Đăng tin"
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 lg:px-8">
          <div className="lg:col-span-8 space-y-8">
            <MainContent form={form} />
            <LocationSkills
              form={form}
              selectedIndustryOptions={selectedIndustryOptions}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Quản lý trạng thái bài đăng (Chỉ hiện khi Update) */}
            {isUpdate && (
              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-orange-700">
                    Trạng thái tin bài
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 mb-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border bg-background p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">
                            Hiển thị
                          </FormLabel>
                          <p className="text-[10px] text-muted-foreground">
                            Chủ động đóng/mở tin
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === "active"}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? "active" : "inactive")
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {isRecruiterAdmin && (
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-bold text-blue-700">
                              Phê duyệt
                            </FormLabel>
                            <p className="text-[10px] text-blue-600/70">
                              Quyền Admin hệ thống
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            <JobSpecs form={form} />

            <SalaryDeadline form={form} />
          </div>
        </div>
      </form>
    </Form>
  );
}
