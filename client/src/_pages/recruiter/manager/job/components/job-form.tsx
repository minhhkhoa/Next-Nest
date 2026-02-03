"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { JobResType, jobCreate, jobUpdate } from "@/schemasvalidation/job";
import {
  LEVEL_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
} from "@/lib/constant";
import { useAppStore } from "@/components/TanstackProvider";
import { getRoleRecruiterAdmin } from "@/lib/utils";
import TinyEditor from "@/components/tinyCustomize";

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

  //-. Hàm xử lý submit
  const onHandleSubmit = async (values: any) => {
    try {
      console.log("values: ", values);
      // await onSubmit(values);
    } catch (error) {}
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onHandleSubmit)}
        className="space-y-8 max-w-7xl mx-auto pb-20"
      >
        {/* Sticky Header Action Bar */}
        <div className="flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {isUpdate ? "Chỉnh sửa bài đăng" : "Tạo tin tuyển dụng mới"}
              </h1>
              <p className="text-xs text-muted-foreground italic">
                {isUpdate
                  ? `Cập nhật lần cuối: ${new Date(initialData.updatedAt).toLocaleString("vi-VN")}`
                  : "Tin của bạn sẽ được kiểm duyệt sau khi đăng"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="min-w-[120px]"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT CHÍNH (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Nội dung cơ bản */}
            <Card className="shadow-sm !gap-2">
              <CardHeader>
                <CardTitle className="text-lg mt-2">
                  Nội dung hiển thị
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 mb-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Tiêu đề công việc{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: Senior Frontend Developer (React/NextJS)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Mô tả công việc & Yêu cầu{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <TinyEditor
                          field={field}
                          placeholder="Hãy mô tả chi tiết công việc, quyền lợi và yêu cầu ứng viên..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Thông tin thêm */}
            <Card className="shadow-sm !gap-2">
              <CardHeader>
                <CardTitle className="text-lg !mt-2">
                  Địa điểm & Kỹ năng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 mb-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Địa chỉ làm việc
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Số nhà, tên đường, quận/huyện, thành phố..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Note: Skills và IndustryID nên dùng Select Multi hoặc Input Tag */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="industryID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Ngành nghề (ID)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập ID ngành nghề..."
                            {...field}
                            value={field.value.join(",")}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.split(",").filter(Boolean),
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Tạm thời nhập các ID cách nhau bằng dấu phẩy
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Kỹ năng yêu cầu
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ví dụ: React, NestJS, MongoDB"
                            {...field}
                            value={field.value.join(",")}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.split(",").filter(Boolean),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHỤ (4/12) */}
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

            {/* Thông số chi tiết */}
            <Card className="shadow-sm !gap-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider !mt-2">
                  Thông số tuyển dụng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 mb-2">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cấp bậc</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn cấp bậc" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LEVEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại hình</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại hình" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPLOYEE_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kinh nghiệm</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn kinh nghiệm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPERIENCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng tuyển dụng</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Lương & Thời gian */}
            <Card className="shadow-sm !gap-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider !mt-2">
                  Lương & Thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 mb-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-semibold">Mức lương</FormLabel>
                    {/* Field chọn loại tiền tệ */}
                    <FormField
                      control={form.control}
                      name="salary.currency"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[80px] h-8 text-xs font-bold border-none bg-muted/50 focus:ring-0">
                              <SelectValue placeholder="Tệ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent align="end">
                            <SelectItem value="VND">VNĐ</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Lương tối thiểu */}
                    <FormField
                      control={form.control}
                      name="salary.min"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="Tối thiểu"
                                className="pr-12"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                                {form.watch("salary.currency")}
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Lương tối đa */}
                    <FormField
                      control={form.control}
                      name="salary.max"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="Tối đa"
                                className="pr-12"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                                {form.watch("salary.currency")}
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Hiển thị lỗi refine từ Zod cho object salary */}
                  {form.formState.errors.salary?.root?.message && (
                    <p className="text-sm font-medium text-destructive">
                      {String(form.formState.errors.salary.root.message)}
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày hết hạn</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
