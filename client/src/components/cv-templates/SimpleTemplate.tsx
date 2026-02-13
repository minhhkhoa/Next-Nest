"use client";

import { apiUserForCVResType } from "@/schemasvalidation/user";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload } from "lucide-react";
import { cn, formatDateForTemplate, uploadToCloudinary } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateUserResumeMutate } from "@/queries/useUserResume";
import { SaveResumeDialog } from "../SaveResumeDialog";
import { CVFormValues } from "@/types/apiResponse";

export default function SimpleTemplate({
  data,
}: {
  data: apiUserForCVResType;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default Values Mapping
  const defaultValues: CVFormValues = {
    personalInfo: {
      name: data.personalInfo.name || "Nguyen Van A",
      email: data.personalInfo.email || "nguyenvana@example.com",
      avatar: data.personalInfo.avatar || "/placeholder-user.jpg",
      phone: "0901234567",
      description: "Web Developer",
    },
    professionalSummary:
      data.professionalSummary ||
      "Lập trình viên web có kinh nghiệm với niềm đam mê tạo ra các trang web responsive và thân thiện với người dùng. Thành thạo HTML, CSS, JavaScript và các framework phát triển web khác nhau.",
    skills:
      data.skills && data.skills.length > 0
        ? data.skills.map((s) => ({
            value:
              (s as any).name?.vi ||
              (s as any).name ||
              (typeof s === "string" ? s : ""),
          }))
        : [
            { value: "HTML/CSS" },
            { value: "JavaScript" },
            { value: "React" },
            { value: "Node.js" },
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
              school: "Đại học Công nghệ",
              degree: "Cử nhân Công nghệ Thông tin",
              startDate: "2018",
              endDate: "2022",
            },
          ],
    experience: [
      {
        company: "Công ty ABC",
        position: "Web Developer",
        startDate: "2022",
        endDate: "Hiện tại",
        responsibilities: [
          {
            value:
              "Phát triển và bảo trì website công ty, tối ưu hóa hiệu năng và thiết kế responsive.",
          },
        ],
      },
      {
        company: "XYZ Agency",
        position: "Frontend Developer",
        startDate: "2020",
        endDate: "2022",
        responsibilities: [
          {
            value:
              "Tham gia phát triển các dự án client, chuyển đổi thiết kế thành mã nguồn chất lượng cao.",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Website Cá nhân",
        description: "Portfolio cá nhân giới thiệu kỹ năng và dự án đã làm.",
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
  const [resumeName, setResumeName] = useState("CV Simple");

  const handleSaveCV = () => {
    const formData = form.getValues();
    saveResume(
      {
        resumeName,
        templateID: "simple-template",
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
      if (!url) {
        throw new Error("Upload failed");
      }
      return url;
    },
    onSuccess: (url) => {
      form.setValue("personalInfo.avatar", url);
      toast.success("Tải ảnh lên thành công!");
    },
    onError: () => {
      toast.error("Tải ảnh lên thất bại. Vui lòng thử lại.");
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dung lượng ảnh không được quá 5MB");
        return;
      }
      uploadImageMutation.mutate(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const { control } = form;

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

  // Helper Styles
  const editableBase =
    "bg-transparent border border-transparent hover:border-dashed hover:border-muted-foreground/50 hover:bg-muted/20 focus:bg-background focus:ring-1 focus:ring-primary rounded px-1 -mx-1 w-full transition-colors duration-200 outline-none";

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
        <form className="w-full max-w-[210mm] mx-auto min-h-screen bg-background text-foreground pb-20 font-sans">
          <div className="container mx-auto py-8">
            <div className="bg-card shadow-lg rounded-lg p-8 sm:p-12 border border-border">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-border pb-8 mb-8">
                {/* Avatar */}
                <div
                  className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-border cursor-pointer group"
                  onClick={handleAvatarClick}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <Image
                    src={
                      form.watch("personalInfo.avatar") ||
                      "/placeholder-user.jpg"
                    }
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-white h-6 w-6" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left w-full">
                  <FormField
                    control={control}
                    name="personalInfo.name"
                    render={({ field }) => (
                      <input
                        {...field}
                        className={cn(
                          editableBase,
                          "text-3xl md:text-4xl font-bold mb-2 text-primary md:text-left text-center",
                        )}
                        placeholder="Họ Tên"
                      />
                    )}
                  />
                  <FormField
                    control={control}
                    name="personalInfo.description"
                    render={({ field }) => (
                      <input
                        {...field}
                        className={cn(
                          editableBase,
                          "text-xl text-muted-foreground mb-4 md:text-left text-center",
                        )}
                        placeholder="Vị trí công việc"
                      />
                    )}
                  />

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-foreground/80 mt-2">
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">Email:</span>
                      <FormField
                        control={control}
                        name="personalInfo.email"
                        render={({ field }) => (
                          <input
                            {...field}
                            className={cn(editableBase, "w-auto inline-block")}
                          />
                        )}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">Phone:</span>
                      <FormField
                        control={control}
                        name="personalInfo.phone"
                        render={({ field }) => (
                          <input
                            {...field}
                            className={cn(editableBase, "w-auto inline-block")}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="mb-8">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-3 text-primary border-b pb-2 border-border">
                  Giới thiệu
                </h2>
                <FormField
                  control={control}
                  name="professionalSummary"
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className={cn(
                        editableBase,
                        "min-h-[80px] text-foreground/90 resize-none border-none shadow-none focus-visible:ring-0 px-0",
                      )}
                      placeholder="Tóm tắt về bản thân..."
                    />
                  )}
                />
              </div>

              {/* Skills Section */}
              <div className="mb-8 group/skills">
                <div className="flex items-center justify-between mb-3 border-b pb-2 border-border">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
                    Kỹ năng
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendSkill({ value: "Kỹ năng mới" })}
                    className="opacity-0 group-hover/skills:opacity-100 transition-opacity"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {skillFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="relative group/item flex items-center min-w-[200px]"
                    >
                      <span className="mr-2 text-primary">•</span>
                      <FormField
                        control={control}
                        name={`skills.${index}.value`}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={cn(editableBase, "flex-1")}
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover/item:opacity-100 absolute -right-6 text-destructive"
                        onClick={() => removeSkill(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 border-b pb-2 border-border">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
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
                        startDate: "2020",
                        endDate: "Hiện tại",
                        responsibilities: [{ value: "Mô tả công việc" }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Thêm
                  </Button>
                </div>

                <div className="space-y-6">
                  {expFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="group/exp relative pl-2 hover:bg-muted/10 rounded-lg p-2 transition-colors"
                    >
                      <div className="absolute right-0 top-0 opacity-0 group-hover/exp:opacity-100 transition-opacity z-10">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-8 w-8"
                          onClick={() => removeExp(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                        <FormField
                          control={control}
                          name={`experience.${index}.position`}
                          render={({ field }) => (
                            <input
                              {...field}
                              className={cn(
                                editableBase,
                                "text-lg font-bold w-full sm:w-auto",
                              )}
                              placeholder="Vị trí"
                            />
                          )}
                        />
                        <div className="text-muted-foreground text-sm whitespace-nowrap flex items-center gap-1">
                          <FormField
                            control={control}
                            name={`experience.${index}.startDate`}
                            render={({ field }) => (
                              <input
                                {...field}
                                className={cn(editableBase, "w-20 text-right")}
                                placeholder="Bắt đầu"
                              />
                            )}
                          />
                          <span>-</span>
                          <FormField
                            control={control}
                            name={`experience.${index}.endDate`}
                            render={({ field }) => (
                              <input
                                {...field}
                                className={cn(editableBase, "w-20")}
                                placeholder="Kết thúc"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={control}
                        name={`experience.${index}.company`}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={cn(
                              editableBase,
                              "text-base text-primary/80 font-medium mb-2 w-full",
                            )}
                            placeholder="Tên công ty"
                          />
                        )}
                      />

                      <FormField
                        control={control}
                        name={`experience.${index}.responsibilities.0.value`}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            className={cn(
                              editableBase,
                              "text-sm text-muted-foreground min-h-[60px] resize-none w-full border-none shadow-none focus-visible:ring-0 px-0",
                            )}
                            placeholder="Mô tả công việc..."
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 border-b pb-2 border-border">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
                    Học vấn
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      appendEdu({
                        school: "Tên trường",
                        degree: "Bằng cấp",
                        startDate: "2018",
                        endDate: "2022",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Thêm
                  </Button>
                </div>

                <div className="space-y-4">
                  {eduFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="group/edu relative pl-2 hover:bg-muted/10 rounded-lg p-2 transition-colors"
                    >
                      <div className="absolute right-0 top-0 opacity-0 group-hover/edu:opacity-100 transition-opacity z-10">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-8 w-8"
                          onClick={() => removeEdu(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                        <FormField
                          control={control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <input
                              {...field}
                              className={cn(
                                editableBase,
                                "text-lg font-bold w-full sm:w-auto",
                              )}
                              placeholder="Bằng cấp"
                            />
                          )}
                        />
                        <div className="text-muted-foreground text-sm whitespace-nowrap flex items-center gap-1">
                          <FormField
                            control={control}
                            name={`education.${index}.startDate`}
                            render={({ field }) => (
                              <input
                                {...field}
                                className={cn(editableBase, "w-16 text-right")}
                                placeholder="2018"
                              />
                            )}
                          />
                          <span>-</span>
                          <FormField
                            control={control}
                            name={`education.${index}.endDate`}
                            render={({ field }) => (
                              <input
                                {...field}
                                className={cn(editableBase, "w-16")}
                                placeholder="2022"
                              />
                            )}
                          />
                        </div>
                      </div>
                      <FormField
                        control={control}
                        name={`education.${index}.school`}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={cn(
                              editableBase,
                              "text-base text-primary/80 w-full",
                            )}
                            placeholder="Tên trường"
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects Section - Often missed in simple template but useful */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b pb-2 border-border">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
                    Dự án
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      appendProj({
                        name: "Tên dự án",
                        description: "Mô tả dự án...",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Thêm
                  </Button>
                </div>

                <div className="space-y-4">
                  {projFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="group/proj relative pl-2 hover:bg-muted/10 rounded-lg p-2 transition-colors"
                    >
                      <div className="absolute right-0 top-0 opacity-0 group-hover/proj:opacity-100 transition-opacity z-10">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-8 w-8"
                          onClick={() => removeProj(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormField
                        control={control}
                        name={`projects.${index}.name`}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={cn(
                              editableBase,
                              "text-lg font-bold mb-1 w-full",
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
                              "text-sm text-muted-foreground min-h-[40px] resize-none w-full border-none shadow-none focus-visible:ring-0 px-0",
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
        </form>
      </Form>
    </>
  );
}
