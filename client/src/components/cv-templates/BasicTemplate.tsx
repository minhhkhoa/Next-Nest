"use client";

import { apiUserForCVResType } from "@/schemasvalidation/user";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Upload,
  Phone,
  Mail,
  Link as LinkIcon,
  MapPin,
} from "lucide-react";
import { cn, formatDateForTemplate, uploadToCloudinary } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateUserResumeMutate } from "@/queries/useUserResume";
import { SaveResumeDialog } from "../SaveResumeDialog";
import { CVFormValues } from "@/types/apiResponse";


export default function BasicTemplate({ data }: { data: apiUserForCVResType }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mapping Data
  const defaultValues: CVFormValues = {
    personalInfo: {
      name: data.personalInfo.name || "Nguyễn Văn A",
      email: data.personalInfo.email || "example@gmail.com",
      avatar: data.personalInfo.avatar || "/placeholder-user.jpg",
      phone: "099.999.9999",
      description: "Lập trình viên Fullstack",
      address: "Hà Nội, Việt Nam",
      link: "linkedin.com/in/nguyenvana",
    },
    professionalSummary:
      data.professionalSummary ||
      "Tôi là một lập trình viên có kinh nghiệm, đam mê học hỏi công nghệ mới...",
    skills:
      data.skills && data.skills.length > 0
        ? data.skills.map((s) => ({
            value:
              (s as any).name?.vi ||
              (s as any).name ||
              (typeof s === "string" ? s : ""),
          }))
        : [
            { value: "React" },
            { value: "Remix" },
            { value: "TypeScript" },
            { value: "Tailwind CSS" },
          ],
    education:
      data.education && data.education.length > 0
        ? data.education.map((e) => ({
            school: e.school,
            degree: e.degree,
            startDate: formatDateForTemplate(e.startDate),
            endDate: formatDateForTemplate(e.endDate),
          }))
        : [
            {
              school: "Đại học Bách Khoa",
              degree: "Kỹ sư Công nghệ thông tin",
              startDate: "2019",
              endDate: "2023",
            },
          ],

    experience: [
      {
        company: "Công ty ABC",
        position: "Lập trình viên ReactJS",
        startDate: "2025",
        endDate: "Hiện tại",
        responsibilities: [
          {
            value:
              "Phát triển giao diện người dùng, tối ưu hóa hiệu năng website...",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Website Thương mại điện tử",
        description: "Xây dựng website bán hàng với đầy đủ tính năng...",
      },
      {
        name: "Ứng dụng Quản lý công việc",
        description: "Phát triển ứng dụng giúp quản lý công việc hiệu quả...",
      },
    ],
  };

  const form = useForm<CVFormValues>({
    defaultValues,
    mode: "onChange",
  });

  const { mutate: saveResume, isPending: isSaving } =
    useCreateUserResumeMutate();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [resumeName, setResumeName] = useState("Basic Resume");

  const handleSaveCV = () => {
    const formData = form.getValues();
    saveResume(
      {
        resumeName,
        templateID: "basic-template",
        content: formData,
        isDefault: false,
      },
      {
        onSuccess: () => {
          setIsSaveDialogOpen(false);
          toast.success("Đã lưu CV thành công!");
        },
        onError: () => {
          toast.error("Lưu CV thất bại. Vui lòng thử lại.");
        },
      },
    );
  };

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadToCloudinary(file);
      if (!url) throw new Error("Upload failed");
      return url;
    },
    onSuccess: (url) => {
      form.setValue("personalInfo.avatar", url);
      toast.success("Tải ảnh lên thành công!");
    },
    onError: () => {
      toast.error("Tải ảnh lên thất bại.");
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dung lượng ảnh quá 5MB");
        return;
      }
      uploadImageMutation.mutate(file);
    }
  };

  const { control, handleSubmit } = form;

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

  // Styles - Dynamic theme colors
  const editableBase =
    "transition-all duration-200 ease-in-out bg-transparent border border-transparent rounded-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background hover:bg-muted/40 hover:border-dashed hover:border-muted-foreground/30 px-1 -mx-1 w-full text-foreground";

  // Header specific (dark theme assumption)
  const headerInputClass =
    "bg-transparent border border-transparent hover:border-white/50 hover:bg-white/10 text-white placeholder:text-white/70 focus-visible:ring-white focus-visible:ring-offset-0 rounded-sm px-1 -mx-1 w-full transition-all shadow-none";

  return (
    <>
      <SaveResumeDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        resumeName={resumeName}
        onResumeNameChange={setResumeName}
        onSave={handleSaveCV}
        isSaving={isSaving}
      />

      <Form {...form}>
        <form
          onSubmit={handleSubmit((d) => console.log(d))}
          className="w-full max-w-[210mm] mx-auto min-h-screen pb-20"
        >
          {/* Main Card */}
          <div className="border border-border shadow-xl rounded-lg bg-card overflow-hidden text-card-foreground">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-10 relative">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div
                  className="group/avatar relative flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-40 w-40 rounded-full border-4 border-white/30 shadow-lg overflow-hidden bg-white/10 flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
                    {form.watch("personalInfo.avatar") ? (
                      <Image
                        src={form.watch("personalInfo.avatar")}
                        alt="Avatar"
                        width={160}
                        height={160}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Upload className="h-12 w-12 text-white/50" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                {/* Name & Title & Contact */}
                <div className="flex-1 text-center md:text-left space-y-2 w-full">
                  <FormField
                    control={control}
                    name="personalInfo.name"
                    render={({ field }) => (
                      <Input
                        {...field}
                        className={cn(
                          headerInputClass,
                          "text-3xl md:text-4xl font-bold h-auto py-1 shadow-none",
                        )}
                        placeholder="Họ và tên"
                      />
                    )}
                  />
                  <FormField
                    control={control}
                    name="personalInfo.description"
                    render={({ field }) => (
                      <Input
                        {...field}
                        className={cn(
                          headerInputClass,
                          "text-xl md:text-2xl font-medium h-auto py-1 opacity-90 shadow-none",
                        )}
                        placeholder="Vị trí ứng tuyển"
                      />
                    )}
                  />

                  <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2 text-sm">
                    <div className="flex items-center bg-white/20 rounded-full px-4 py-1 backdrop-blur-sm hover:bg-white/30 transition-colors">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <FormField
                        control={control}
                        name="personalInfo.email"
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="bg-transparent border-none p-0 h-auto text-white placeholder:text-white/60 focus-visible:ring-0 w-[200px] shadow-none"
                            placeholder="Email"
                          />
                        )}
                      />
                    </div>
                    <div className="flex items-center bg-white/20 rounded-full px-4 py-1 backdrop-blur-sm hover:bg-white/30 transition-colors">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <FormField
                        control={control}
                        name="personalInfo.phone"
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="bg-transparent border-none p-0 h-auto text-white placeholder:text-white/60 focus-visible:ring-0 w-[120px] shadow-none"
                            placeholder="Số điện thoại"
                          />
                        )}
                      />
                    </div>
                    <div className="flex items-center bg-white/20 rounded-full px-4 py-1 backdrop-blur-sm hover:bg-white/30 transition-colors">
                      <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <FormField
                        control={control}
                        name="personalInfo.link"
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="bg-transparent border-none p-0 h-auto text-white placeholder:text-white/60 focus-visible:ring-0 w-[200px] shadow-none"
                            placeholder="Liên kết/LinkedIn"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left bg-card text-card-foreground">
              {/* Left Column (Main) */}
              <div className="md:col-span-2 space-y-8">
                {/* Summary */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3 flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                      <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400 rotate-180" />
                    </div>
                    Tóm tắt
                  </h2>
                  <div className="w-16 h-1 bg-blue-600 dark:bg-blue-500 mb-4 rounded-full"></div>
                  <FormField
                    control={control}
                    name="professionalSummary"
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className={cn(
                          editableBase,
                          "min-h-[100px] leading-relaxed resize-none shadow-none text-muted-foreground",
                        )}
                        placeholder="Viết một đoạn ngắn giới thiệu về bản thân bạn..."
                      />
                    )}
                  />
                </div>

                {/* Professional Experience */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-foreground flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Kinh nghiệm làm việc
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        appendExp({
                          company: "Tên công ty",
                          position: "Vị trí",
                          startDate: "2023",
                          endDate: "Hiện tại",
                          responsibilities: [{ value: "Mô tả công việc" }],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </div>
                  <div className="w-16 h-1 bg-blue-600 dark:bg-blue-500 mb-6 rounded-full"></div>

                  <div className="space-y-6">
                    {expFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-800 group"
                      >
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 ring-4 ring-white dark:ring-background"></div>
                        {/* Remove Button */}
                        {expFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            onClick={() => removeExp(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="mb-1">
                          <FormField
                            control={control}
                            name={`experience.${index}.position`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                className={cn(
                                  editableBase,
                                  "text-lg font-bold h-auto py-0 shadow-none text-foreground",
                                )}
                                placeholder="Vị trí"
                              />
                            )}
                          />
                        </div>
                        <div className="flex items-baseline mb-2">
                          <FormField
                            control={control}
                            name={`experience.${index}.company`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                className={cn(
                                  editableBase,
                                  "text-blue-600 dark:text-blue-400 font-semibold text-base w-auto inline-block p-0 mr-2 shadow-none",
                                )}
                                placeholder="Tên công ty"
                              />
                            )}
                          />
                          <span className="text-muted-foreground mx-1">|</span>
                          <div className="flex gap-1 text-sm text-blue-600/80 dark:text-blue-400/80 font-medium items-center">
                            <FormField
                              control={control}
                              name={`experience.${index}.startDate`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="w-[60px] bg-transparent border-none p-0 text-right h-auto focus:ring-0 shadow-none"
                                  placeholder="Bắt đầu"
                                />
                              )}
                            />
                            <span>-</span>
                            <FormField
                              control={control}
                              name={`experience.${index}.endDate`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="w-[80px] bg-transparent border-none p-0 h-auto focus:ring-0 shadow-none"
                                  placeholder="Kết thúc"
                                />
                              )}
                            />
                          </div>
                        </div>
                        <FormField
                          control={control}
                          name={`experience.${index}.responsibilities.0.value`}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              className={cn(
                                editableBase,
                                "text-sm text-muted-foreground min-h-[60px] resize-none mt-2 shadow-none",
                              )}
                              placeholder="Mô tả công việc..."
                            />
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects / Certifications */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-foreground flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                        <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Dự án & Chứng chỉ
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        appendProj({
                          name: "Tên dự án",
                          description: "Mô tả",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </div>
                  <div className="w-16 h-1 bg-blue-600 dark:bg-blue-500 mb-6 rounded-full"></div>

                  <div className="grid gap-4">
                    {projFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-4 border-l-4 border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-lg group relative hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        {projFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            onClick={() => removeProj(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <FormField
                          control={control}
                          name={`projects.${index}.name`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              className={cn(
                                editableBase,
                                "text-base font-bold text-foreground bg-transparent border-none p-0 h-auto focus:ring-0 mb-1 shadow-none",
                              )}
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
                                editableBase,
                                "text-sm text-muted-foreground bg-transparent border-none p-0 min-h-[40px] resize-none shadow-none",
                              )}
                              placeholder="Mô tả..."
                            />
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="md:col-span-1 space-y-8">
                {/* Skills */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-foreground flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                        <Trash2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Kỹ năng
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => appendSkill({ value: "Kỹ năng mới" })}
                    >
                      <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </div>
                  <div className="w-16 h-1 bg-blue-600 dark:bg-blue-500 mb-6 rounded-full"></div>

                  <div className="space-y-3">
                    {skillFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="group flex items-center gap-2"
                      >
                        <div className="flex-1 flex items-center p-2 bg-muted/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-border text-left">
                          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-md flex items-center justify-center mr-3 shrink-0 text-xs font-bold shadow-sm">
                            {index + 1}
                          </div>
                          <FormField
                            control={control}
                            name={`skills.${index}.value`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                className="bg-transparent border-none h-auto p-0 font-medium text-foreground focus-visible:ring-0 w-full shadow-none"
                              />
                            )}
                          />
                        </div>
                        {skillFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"
                            onClick={() => removeSkill(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-foreground flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                        <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Học vấn
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        appendEdu({
                          school: "Tên trường",
                          degree: "Bằng cấp/Chứng chỉ",
                          startDate: "2020",
                          endDate: "2024",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </div>
                  <div className="w-16 h-1 bg-blue-600 dark:bg-blue-500 mb-6 rounded-full"></div>

                  <div className="space-y-4">
                    {eduFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-800 group"
                      >
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 ring-4 ring-white dark:ring-background"></div>

                        {eduFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            onClick={() => removeEdu(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}

                        <div className="bg-muted/30 p-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-border text-left">
                          <div className="flex gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 items-center">
                            <FormField
                              control={control}
                              name={`education.${index}.startDate`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="w-[40px] bg-transparent border-none p-0 h-auto focus:ring-0 shadow-none"
                                  placeholder="Từ"
                                />
                              )}
                            />
                            <span>-</span>
                            <FormField
                              control={control}
                              name={`education.${index}.endDate`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="w-[40px] bg-transparent border-none p-0 h-auto focus:ring-0 shadow-none"
                                  placeholder="Đến"
                                />
                              )}
                            />
                          </div>
                          <FormField
                            control={control}
                            name={`education.${index}.school`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                className={cn(
                                  editableBase,
                                  "font-bold text-foreground mb-1 text-sm shadow-none",
                                )}
                                placeholder="Tên trường"
                              />
                            )}
                          />
                          <FormField
                            control={control}
                            name={`education.${index}.degree`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                className={cn(
                                  editableBase,
                                  "text-xs text-muted-foreground shadow-none",
                                )}
                                placeholder="Bằng cấp"
                              />
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-muted p-4 text-center text-xs text-muted-foreground border-t border-border italic rounded-b-lg">
              CV được tạo bởi Next-Nest CV Builder
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
