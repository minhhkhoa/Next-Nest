"use client";

import Image from "next/image";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PencilLine, Upload, Save } from "lucide-react";
import { cn, formatDateForTemplate, uploadToCloudinary } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import {
  useCreateUserResumeMutate,
  useUpdateUserResumeMutate,
} from "@/queries/useUserResume";
import { SaveResumeDialog } from "../SaveResumeDialog";
import { CVFormValues, TemplateProps } from "@/types/apiResponse";
import { CV_TEMPLATES } from "@/lib/constant";
import SoftSuccessSonner from "../shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "../shadcn-studio/sonner/SoftDestructiveSonner";

export default function ModernTemplate({
  data,
  isEdit,
  isView,
  resumeId,
  resumeName: initialResumeName,
}: TemplateProps) {
  const { mutate: updateResume, isPending: isUpdating } =
    useUpdateUserResumeMutate();
  const { mutate: saveResume, isPending: isSaving } =
    useCreateUserResumeMutate();

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  //- khai bao state ten cv o dau component de cac ham phia duoi co the su dung
  const [resumeName, setResumeName] = useState(initialResumeName || "CV chưa đặt tên");

  //- dong bo ten cv khi co du lieu resumeName tu api tra ve
  useEffect(() => {
    if (initialResumeName) {
      setResumeName(initialResumeName);
    }
  }, [initialResumeName]);

  const handleUpdateCV = () => {
    const formData = form.getValues();
    if (!resumeId) return;

    updateResume(
      {
        id: resumeId,
        body: {
          resumeName, //- cap nhat ten moi cua cv
          content: formData,
        },
      },
      {
        onSuccess: () => {
          setIsSaveDialogOpen(false); //- dong dialog hoi ten cv
          SoftSuccessSonner("Cập nhật CV thành công!");
        },
        onError: () => {
          SoftDestructiveSonner("Cập nhật CV thất bại. Vui lòng thử lại.");
        },
      },
    );
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mapping dữ liệu API vào Form
  const defaultValues: CVFormValues = {
    personalInfo: {
      name: data?.personalInfo.name || "",
      email: data?.personalInfo.email || "",
      avatar: data?.personalInfo.avatar || "/placeholder-user.jpg",
      phone: "099.999.9999", // Placeholder
      description: "Software Engineer", // Giá trị mặc định
    },
    professionalSummary:
      data?.professionalSummary || "Mục tiêu nghề nghiệp của bạn...",
    skills:
      data?.skills && data.skills.length > 0
        ? data.skills.map((s: any) => ({
            //- đồng bộ các định dạng kỹ năng từ dữ liệu hệ thống (object hoặc string)
            value:
              (s as any).value ||
              (s as any).name?.vi ||
              (s as any).name ||
              (typeof s === "string" ? s : ""),
          }))
        : [{ value: "Kỹ năng 1" }, { value: "Kỹ năng 2" }],
    education:
      data?.education && data.education.length > 0
        ? data.education.map((e: any) => ({
            school: e.school,
            degree: e.degree,
            startDate: formatDateForTemplate(e.startDate),
            endDate: formatDateForTemplate(e.endDate),
          }))
        : [
            {
              school: "Tên trường ĐH",
              degree: "Bằng cấp",
              startDate: "2020",
              endDate: "2024",
            },
          ],
    experience:
      data?.experience && data.experience.length > 0
        ? data.experience.map((e: any) => ({
            company: e.company,
            position: e.position,
            startDate: formatDateForTemplate(e.startDate),
            endDate: formatDateForTemplate(e.endDate),
            responsibilities:
              e.responsibilities && e.responsibilities.length > 0
                ? e.responsibilities.map((r: any) => ({ value: r.value }))
                : [{ value: "Mô tả công việc chính..." }],
          }))
        : [
            {
              company: "Công ty gần nhất",
              position: "Vị trí làm việc",
              startDate: "2022",
              endDate: "Hiện tại",
              responsibilities: [{ value: "Mô tả công việc chính..." }],
            },
          ],
    projects:
      data?.projects && data.projects.length > 0
        ? data.projects.map((p: any) => ({
            name: p.name,
            description: p.description,
          }))
        : [
            {
              name: "Tên dự án",
              description: "Mô tả ngắn gọn về dự án...",
            },
          ],
  };

  const form = useForm<CVFormValues>({
    defaultValues,
    mode: "onChange",
  });


  const handleSaveCV = () => {
    const formData = form.getValues();
    saveResume(
      {
        resumeName,
        templateID: CV_TEMPLATES.modernTemplate,
        content: formData,
        isDefault: false,
      },
      {
        onSuccess: () => {
          setIsSaveDialogOpen(false);
          SoftSuccessSonner("Đã lưu CV thành công!");
        },
        onError: () => {
          SoftDestructiveSonner("Lưu CV thất bại. Vui lòng thử lại.");
        },
      },
    );
  };

  // Mutation upload ảnh
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadToCloudinary(file);
      if (!url) {
        throw new Error("Upload failed");
      }
      return url;
    },
    onSuccess: (url) => {
      // Cập nhật giá trị avatar trong form sau khi upload thành công
      form.setValue("personalInfo.avatar", url);
      SoftSuccessSonner("Tải ảnh lên thành công!");
    },
    onError: () => {
      SoftDestructiveSonner("Tải ảnh lên thất bại. Vui lòng thử lại.");
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // Limit 5MB
        SoftDestructiveSonner("Dung lượng ảnh không được quá 5MB");
        return;
      }
      uploadImageMutation.mutate(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const { control, handleSubmit } = form;

  // Field Arrays
  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({
    control,
    name: "education",
  });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({
    control,
    name: "experience",
  });

  const {
    fields: projFields,
    append: appendProj,
    remove: removeProj,
  } = useFieldArray({
    control,
    name: "projects",
  });

  const editableBase =
    "transition-all duration-200 ease-in-out bg-transparent border border-transparent rounded-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background hover:bg-muted/40 hover:border-dashed hover:border-muted-foreground/30 px-1 -mx-1";

  const inputClass = cn(editableBase, "text-foreground w-full shadow-none");
  const titleClass = cn(
    editableBase,
    "font-bold text-foreground w-full shadow-none",
  );
  const mutedClass = cn(
    editableBase,
    "text-muted-foreground w-full shadow-none",
  );

  const headerInputClass =
    "bg-transparent border border-transparent hover:border-white/50 hover:bg-white/10 text-white placeholder:text-white/70 focus-visible:ring-white focus-visible:ring-offset-0 rounded-sm px-1 -mx-1 w-full transition-all";

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit((d) => console.log(d))}
          className={cn(
            "w-full max-w-[210mm] mx-auto min-h-screen pb-2 bg-white",
            isView && "pointer-events-none select-none",
          )}
        >
          {/* Container chính: dùng bg-card để lấy màu nền theo theme (trắng/đen) */}
          <div className="border border-border shadow-xl rounded-lg bg-card overflow-hidden text-card-foreground">
            {/* <!-- Header --> */}
            {/* Giữ bg-emerald-600 vì đây là màu brand của template */}
            <div className="flex flex-col sm:flex-row rounded-t-lg bg-emerald-600 sm:px-2 w-full text-white pb-5 sm:pb-0">
              <div
                className="group/avatar relative h-40 w-40 sm:top-10 sm:left-5 mx-auto mt-5 sm:mt-0 p-1 border-4 border-card bg-card rounded-full overflow-hidden shrink-0 cursor-pointer"
                onClick={handleAvatarClick}
              >
                {/* Input file ẩn */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {/* Overlay khi hover */}
                <div className="absolute inset-0 bg-black/40 hidden group-hover/avatar:flex items-center justify-center z-10 transition-all rounded-full">
                  <Upload className="w-8 h-8 text-white" />
                </div>

                {/* Hiển thị Avatar từ Form state để update ngay khi upload */}
                <FormField
                  control={control}
                  name="personalInfo.avatar"
                  render={({ field }) => (
                    <Image
                      src={
                        field.value ||
                        data?.personalInfo.avatar ||
                        "/placeholder-user.jpg"
                      }
                      width={200}
                      height={200}
                      alt="Avatar"
                      className="object-cover w-full h-full"
                    />
                  )}
                />
                {/* Loading indicator */}
                {uploadImageMutation.isPending && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="sm:w-2/3 sm:pl-10 mt-5 sm:mt-14 px-4 text-center sm:text-left">
                <div className="group relative w-full mb-2">
                  <FormField
                    control={control}
                    name="personalInfo.name"
                    render={({ field }) => (
                      <input
                        {...field}
                        className={cn(
                          headerInputClass,
                          "font-poppins font-bold text-3xl sm:text-4xl sm:text-left text-center",
                        )}
                        placeholder="Họ và tên"
                      />
                    )}
                  />
                  <PencilLine className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 opacity-0 group-hover:opacity-100 pointer-events-none" />
                </div>

                <div className="group relative w-full sm:w-2/3">
                  <FormField
                    control={control}
                    name="personalInfo.description"
                    render={({ field }) => (
                      <input
                        {...field}
                        className={cn(
                          headerInputClass,
                          "text-lg sm:text-left text-center opacity-90",
                        )}
                        placeholder="Chức danh (VD: Software Engineer)"
                      />
                    )}
                  />
                  <PencilLine className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 opacity-0 group-hover:opacity-100 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* <!-- Main Content --> */}
            <div className="p-5 sm:pt-14">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* --- Cột trái: Thông tin liên hệ, Kỹ năng, Học vấn --- */}
                <div className="flex flex-col sm:w-1/3 space-y-8">
                  {/* Contact */}
                  <div>
                    <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                      Liên hệ
                    </h2>
                    <div className="border-b-2 border-emerald-600 w-12 mb-4"></div>

                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex items-center group">
                        <span className="w-6 shrink-0 text-emerald-600">
                          ✉️
                        </span>
                        <div className="w-full relative">
                          <FormField
                            control={control}
                            name="personalInfo.email"
                            render={({ field }) => (
                              <Input
                                {...field}
                                className={cn(inputClass, "h-8")}
                                placeholder="Email"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex items-center group">
                        <span className="w-6 shrink-0 text-emerald-600">
                          📞
                        </span>
                        <div className="w-full relative">
                          <FormField
                            control={control}
                            name="personalInfo.phone"
                            render={({ field }) => (
                              <Input
                                {...field}
                                className={cn(inputClass, "h-8")}
                                placeholder="Số điện thoại"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="group/section relative">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">
                        Kỹ năng
                      </h2>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-emerald-600 opacity-0 group-hover/section:opacity-100 transition-opacity"
                        onClick={() => appendSkill({ value: "Kỹ năng mới" })}
                        title="Thêm kỹ năng"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="border-b-2 border-emerald-600 w-12 mb-4"></div>

                    <div className="flex flex-col gap-2">
                      {skillFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center group relative hover:translate-x-1 transition-transform"
                        >
                          <span className="mr-2 text-emerald-600 text-lg leading-none">
                            •
                          </span>
                          <FormField
                            control={control}
                            name={`skills.${index}.value`}
                            render={({ field }) => (
                              <Input {...field} className={inputClass} />
                            )}
                          />
                          {/* Chỉ hiện nút xoá nếu có nhiều hơn 1 dòng */}
                          {skillFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 absolute right-0"
                              onClick={() => removeSkill(index)}
                              title="Xóa dòng này"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="group/section relative">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">
                        Học vấn
                      </h2>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-emerald-600 opacity-0 group-hover/section:opacity-100 transition-opacity"
                        onClick={() =>
                          appendEdu({
                            school: "Tên trường",
                            degree: "Ngành học",
                            startDate: "2020",
                            endDate: "2024",
                          })
                        }
                        title="Thêm học vấn"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="border-b-2 border-emerald-600 w-12 mb-4"></div>

                    <div className="flex flex-col gap-6">
                      {eduFields.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex flex-col group relative pl-2 border-l-2 border-transparent hover:border-emerald-200 transition-colors"
                        >
                          {/* Chỉ hiện nút xoá nếu có nhiều hơn 1 dòng */}
                          {eduFields.length > 1 && (
                            <div className="absolute top-0 right-0 hidden group-hover:block z-10">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeEdu(index)}
                                title="Xóa"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center text-xs text-muted-foreground mb-1">
                            <FormField
                              control={control}
                              name={`education.${index}.startDate`}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  className="bg-transparent w-10 text-center focus:outline-none focus:border-b border-muted-foreground hover:text-foreground"
                                  placeholder="Năm"
                                />
                              )}
                            />
                            <span className="mx-1">-</span>
                            <FormField
                              control={control}
                              name={`education.${index}.endDate`}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  className="bg-transparent w-14 text-center focus:outline-none focus:border-b border-muted-foreground hover:text-foreground"
                                  placeholder="Hiện tại"
                                />
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <FormField
                              control={control}
                              name={`education.${index}.degree`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className={cn(
                                    titleClass,
                                    "text-emerald-600 text-sm uppercase",
                                  )}
                                  placeholder="Bằng cấp / Ngành học"
                                />
                              )}
                            />
                            <FormField
                              control={control}
                              name={`education.${index}.school`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className={cn(
                                    titleClass,
                                    "font-normal text-foreground",
                                  )}
                                  placeholder="Tên trường học"
                                />
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* --- Cột phải: Giới thiệu, Kinh nghiệm, Dự án --- */}
                <div className="flex flex-col sm:w-2/3 space-y-8">
                  {/* About me */}
                  <div>
                    <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide mb-2">
                      Giới thiệu bản thân
                    </h2>
                    <div className="border-b-2 border-emerald-600 w-12 mb-4"></div>
                    <FormField
                      control={control}
                      name="professionalSummary"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          className={cn(
                            editableBase,
                            "min-h-[80px] w-full resize-none text-foreground bg-transparent shadow-none",
                          )}
                          placeholder="Viết một đoạn ngắn giới thiệu về bản thân và mục tiêu nghề nghiệp..."
                        />
                      )}
                    />
                  </div>

                  {/* Professional Experience */}
                  <div className="group/section relative">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">
                        Kinh nghiệm làm việc
                      </h2>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-emerald-600 opacity-0 group-hover/section:opacity-100 transition-opacity"
                        onClick={() =>
                          appendExp({
                            company: "Tên công ty",
                            position: "Chức vụ",
                            startDate: "2023",
                            endDate: "Hiện tại",
                            responsibilities: [{ value: "Mô tả công việc..." }],
                          })
                        }
                        title="Thêm kinh nghiệm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="border-b-2 border-emerald-600 w-12 mb-4"></div>

                    <div className="flex flex-col space-y-8">
                      {expFields.map((item, index) => (
                        <div
                          key={item.id}
                          className="group relative rounded-md p-2 -ml-2 hover:bg-muted/10 transition-colors"
                        >
                          {expFields.length > 1 && (
                            <div className="absolute right-2 top-2 hidden group-hover:block z-10">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeExp(index)}
                                title="Xóa mục này"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          <div className="mb-2">
                            <FormField
                              control={control}
                              name={`experience.${index}.company`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className={cn(titleClass, "text-xl")}
                                  placeholder="Tên công ty"
                                />
                              )}
                            />

                            <div className="flex flex-wrap items-center text-sm font-semibold text-emerald-600 mt-1">
                              <div className="relative min-w-[150px]">
                                <FormField
                                  control={control}
                                  name={`experience.${index}.position`}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      className="bg-transparent border-none p-0 h-auto font-semibold focus:outline-none placeholder:text-emerald-600/50 text-emerald-700 dark:text-emerald-500"
                                      placeholder="Chức vụ"
                                    />
                                  )}
                                />
                              </div>
                              <span className="mx-2 text-muted-foreground">
                                |
                              </span>
                              <div className="flex items-center text-muted-foreground font-normal">
                                <FormField
                                  control={control}
                                  name={`experience.${index}.startDate`}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      className="bg-transparent w-10 text-center focus:outline-none focus:border-b border-muted-foreground hover:text-foreground"
                                      placeholder="Năm"
                                    />
                                  )}
                                />
                                <span className="mx-1">-</span>
                                <FormField
                                  control={control}
                                  name={`experience.${index}.endDate`}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      className="bg-transparent w-16 text-center focus:outline-none focus:border-b border-muted-foreground hover:text-foreground"
                                      placeholder="Hiện tại"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pl-2 border-l-2 border-border/50">
                            <ResponsibilitiesEditor
                              index={index}
                              control={control}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="group/section relative">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">
                        Dự án nổi bật
                      </h2>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-emerald-600 opacity-0 group-hover/section:opacity-100 transition-opacity"
                        onClick={() =>
                          appendProj({
                            name: "Tên dự án mới",
                            description: "Mô tả dự án...",
                          })
                        }
                        title="Thêm dự án"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="border-b-2 border-emerald-600 w-12 mb-4"></div>

                    <div className="flex flex-col space-y-6">
                      {projFields.map((item, index) => (
                        <div
                          key={item.id}
                          className="group relative rounded-md p-2 -ml-2 hover:bg-muted/10 transition-colors"
                        >
                          {projFields.length > 1 && (
                            <div className="absolute right-2 top-2 hidden group-hover:block z-10">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeProj(index)}
                                title="Xóa dự án này"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <FormField
                            control={control}
                            name={`projects.${index}.name`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                className={cn(titleClass, "text-lg")}
                                placeholder="Tên dự án"
                              />
                            )}
                          />
                          <FormField
                            control={control}
                            name={`projects.${index}.description`}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                className={cn(
                                  mutedClass,
                                  "resize-none min-h-[60px] text-sm mt-1",
                                )}
                                placeholder="Mô tả dự án..."
                              />
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="flex justify-end mt-2">
              <Button
                type="button"
                className="shadow-xl"
                size="lg"
                onClick={() => setIsSaveDialogOpen(true)} //- mo dialog dat ten khi click luu
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          )}
        </form>
      </Form>

      {!isView && (
        <SaveResumeDialog
          open={isSaveDialogOpen}
          onOpenChange={setIsSaveDialogOpen}
          resumeName={resumeName}
          onResumeNameChange={setResumeName}
          onSave={isEdit ? handleUpdateCV : handleSaveCV}
          isSaving={isEdit ? isUpdating : isSaving}
          showTrigger={!isEdit}
        />
      )}
    </>
  );
}

// Subcomponent cho danh sách trách nhiệm công việc
function ResponsibilitiesEditor({
  index,
  control,
}: {
  index: number;
  control: Control<CVFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `experience.${index}.responsibilities`,
  });

  return (
    <ul className="list-none space-y-1">
      {fields.map((resp, respIndex) => (
        <li key={resp.id} className="group flex items-start text-sm">
          <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0"></span>
          <FormField
            control={control}
            name={`experience.${index}.responsibilities.${respIndex}.value`}
            render={({ field }) => (
              <Textarea
                {...field}
                className="min-h-[28px] h-[28px] py-1 border-none shadow-none resize-none focus-visible:ring-0 w-full overflow-hidden leading-tight bg-transparent hover:bg-muted/30 hover:border-dashed hover:border-gray-300 rounded-sm -ml-1 pl-1 transition-all"
                placeholder="..."
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            )}
          />
          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 shrink-0 ml-1"
              onClick={() => remove(respIndex)}
              title="Xóa dòng này"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </li>
      ))}
      <li>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-emerald-600 h-6 px-2 mt-1 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          onClick={() => append({ value: "" })}
        >
          + Thêm dòng
        </Button>
      </li>
    </ul>
  );
}
