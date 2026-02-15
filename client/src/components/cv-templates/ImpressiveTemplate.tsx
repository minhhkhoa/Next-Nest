"use client";

import { apiUserForCVResType } from "@/schemasvalidation/user";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, Save } from "lucide-react";
import { cn, formatDateForTemplate, uploadToCloudinary } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useCreateUserResumeMutate,
  useUpdateUserResumeMutate,
} from "@/queries/useUserResume";
import { SaveResumeDialog } from "../SaveResumeDialog";
import { CVFormValues, TemplateProps } from "@/types/apiResponse";
import { CV_TEMPLATES } from "@/lib/constant";

export default function ImpressiveTemplate({
  data,
  isEdit,
  resumeId,
}: TemplateProps) {
  const { mutate: updateResume, isPending: isUpdating } =
    useUpdateUserResumeMutate();

  const handleUpdateCV = () => {
    const formData = form.getValues();
    if (!resumeId) return;

    updateResume(
      {
        id: resumeId,
        body: {
          content: formData,
        },
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật CV thành công!");
        },
        onError: () => {
          toast.error("Cập nhật CV thất bại. Vui lòng thử lại.");
        },
      },
    );
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mapping dữ liệu API vào Form
  const defaultValues: CVFormValues = {
    personalInfo: {
      name: data?.personalInfo.name || "John Doe",
      email: data?.personalInfo.email || "john.doe@example.com",
      avatar: data?.personalInfo.avatar || "/placeholder-user.jpg",
      phone: "099.999.9999",
      description: "Software Developer",
    },
    professionalSummary:
      data?.professionalSummary ||
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    skills:
      data?.skills && data.skills.length > 0
        ? data.skills.map((s: any) => ({
            value:
              (s as any).name?.vi ||
              (s as any).name ||
              (typeof s === "string" ? s : ""),
          }))
        : [{ value: "JavaScript" }, { value: "React" }, { value: "Node.js" }],
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
              school: "University Name",
              degree: "Bachelor Degree",
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
                : [{ value: "Lorem ipsum dolor sit amet..." }],
          }))
        : [
            {
              company: "ABC Company",
              position: "Web Developer",
              startDate: "2017",
              endDate: "2019",
              responsibilities: [{ value: "Lorem ipsum dolor sit amet..." }],
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
              name: "Project Name",
              description: "Project Description...",
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
  const [resumeName, setResumeName] = useState("CV Impressive");

  const handleSaveCV = () => {
    const formData = form.getValues();
    saveResume(
      {
        resumeName,
        templateID: CV_TEMPLATES.impressiveTemplate,
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

  // Styles
  const editableBase =
    "transition-all duration-200 ease-in-out bg-transparent border border-transparent rounded-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background hover:bg-muted/40 hover:border-dashed hover:border-muted-foreground/30 px-1 -mx-1 w-full text-foreground";

  return (
    <>
      <Form {...form}>
        <form className="w-full max-w-[210mm] mx-auto min-h-screen pb-2 bg-background text-foreground">
          <div className="container mx-auto py-8">
            <div className="grid grid-cols-4 sm:grid-cols-12 gap-6">
              {/* Sidebar */}
              <div className="col-span-4 sm:col-span-4">
                <div className="bg-card shadow rounded-lg p-6 border border-border">
                  <div className="flex flex-col items-center">
                    <div
                      className="group/avatar relative h-32 w-32 bg-muted rounded-full mb-4 shrink-0 overflow-hidden cursor-pointer border border-border"
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
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                        <Upload className="text-white h-6 w-6" />
                      </div>
                    </div>

                    <FormField
                      control={control}
                      name="personalInfo.name"
                      render={({ field }) => (
                        <input
                          {...field}
                          className={cn(
                            editableBase,
                            "text-xl font-bold text-center",
                          )}
                          placeholder="Họ tên"
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
                            "text-muted-foreground text-center text-sm",
                          )}
                          placeholder="Chức danh"
                        />
                      )}
                    />

                    <div className="mt-6 flex flex-wrap gap-4 justify-center w-full">
                      <FormField
                        control={control}
                        name="personalInfo.phone"
                        render={({ field }) => (
                          <input
                            {...field}
                            className={cn(
                              editableBase,
                              "bg-primary/10 text-primary text-xs text-center py-1 rounded w-full mb-2",
                            )}
                            placeholder="Số điện thoại"
                          />
                        )}
                      />
                      <FormField
                        control={control}
                        name="personalInfo.email"
                        render={({ field }) => (
                          <input
                            {...field}
                            className={cn(
                              editableBase,
                              "bg-muted text-muted-foreground text-xs text-center py-1 rounded w-full",
                            )}
                            placeholder="Email"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <hr className="my-6 border-t border-border" />

                  {/* Skills Section */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-secondary-foreground uppercase font-bold tracking-wider">
                        Kỹ năng
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => appendSkill({ value: "New Skill" })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <ul>
                      {skillFields.map((field, index) => (
                        <li
                          key={field.id}
                          className="mb-2 flex items-center group/skill"
                        >
                          <FormField
                            control={control}
                            name={`skills.${index}.value`}
                            render={({ field }) => (
                              <input
                                {...field}
                                className={cn(editableBase, "text-sm w-full")}
                              />
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover/skill:opacity-100 transition-opacity text-destructive ml-1"
                            onClick={() => removeSkill(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Main Column */}
              <div className="col-span-4 sm:col-span-8">
                <div className="bg-card shadow rounded-lg p-6 mb-6 border border-border">
                  <h2 className="text-xl font-bold mb-4 border-b border-border pb-2 text-primary">
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
                          "text-foreground resize-none min-h-[100px] border-none focus-visible:ring-0 px-0 w-full",
                        )}
                      />
                    )}
                  />
                </div>

                {/* Experience Section */}
                <div className="bg-card shadow rounded-lg p-6 mb-6 border border-border">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <h2 className="text-xl font-bold text-primary">
                      Kinh nghiệm làm việc
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        appendExp({
                          company: "Công ty...",
                          position: "Vị trí...",
                          startDate: "2023",
                          endDate: "Hiện tại",
                          responsibilities: [{ value: "" }],
                        })
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" /> Thêm
                    </Button>
                  </div>

                  {expFields.map((item, index) => (
                    <div
                      key={item.id}
                      className="mb-6 relative group/exp border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="absolute right-0 top-0 opacity-0 group-hover/exp:opacity-100 transition-opacity">
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
                      <div className="flex justify-between flex-wrap gap-2 w-full mb-2">
                        <FormField
                          control={control}
                          name={`experience.${index}.position`}
                          render={({ field }) => (
                            <input
                              {...field}
                              className={cn(
                                editableBase,
                                "text-foreground font-bold w-auto mr-2",
                              )}
                              placeholder="Vị trí"
                            />
                          )}
                        />
                        <div className="flex items-center text-sm text-muted-foreground ml-auto">
                          <span className="mr-2">tại</span>
                          <FormField
                            control={control}
                            name={`experience.${index}.company`}
                            render={({ field }) => (
                              <input
                                {...field}
                                className={cn(
                                  editableBase,
                                  "text-foreground mr-2 w-auto",
                                )}
                                placeholder="Công ty"
                              />
                            )}
                          />
                          <div className="flex items-center gap-1 mx-2 shrink-0">
                            <FormField
                              control={control}
                              name={`experience.${index}.startDate`}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  className={cn(
                                    editableBase,
                                    "w-16 text-right",
                                  )}
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
                                  className={cn(editableBase, "w-16")}
                                  placeholder="Kết thúc"
                                />
                              )}
                            />
                          </div>
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
                              "text-muted-foreground min-h-[60px] resize-none mt-2 w-full border-none focus-visible:ring-0 px-0 shadow-none",
                            )}
                            placeholder="Mô tả công việc..."
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Education Section */}
                <div className="bg-card shadow rounded-lg p-6 border border-border">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <h2 className="text-xl font-bold text-primary">Học vấn</h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        appendEdu({
                          school: "Trường...",
                          degree: "Bằng cấp...",
                          startDate: "2020",
                          endDate: "2024",
                        })
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" /> Thêm
                    </Button>
                  </div>
                  {eduFields.map((item, index) => (
                    <div
                      key={item.id}
                      className="mb-6 relative group/edu border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="absolute right-0 top-0 opacity-0 group-hover/edu:opacity-100 transition-opacity">
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
                      <div className="flex justify-between flex-wrap gap-2 w-full">
                        <FormField
                          control={control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <input
                              {...field}
                              className={cn(
                                editableBase,
                                "text-foreground font-bold w-full sm:w-auto",
                              )}
                              placeholder="Bằng cấp"
                            />
                          )}
                        />
                        <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto shrink-0">
                          <FormField
                            control={control}
                            name={`education.${index}.startDate`}
                            render={({ field }) => (
                              <input
                                {...field}
                                className={cn(editableBase, "w-12 text-right")}
                                placeholder="2020"
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
                                className={cn(editableBase, "w-12")}
                                placeholder="2024"
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
                              "text-foreground block mt-1 w-full",
                            )}
                            placeholder="Tên trường"
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Projects Section */}
                <div className="bg-card shadow rounded-lg p-6 border border-border mt-6">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <h2 className="text-xl font-bold text-primary">
                      Dự án cá nhân
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        appendProj({
                          name: "Dự án mới",
                          description: "Mô tả dự án...",
                        })
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" /> Thêm
                    </Button>
                  </div>
                  {projFields.map((item, index) => (
                    <div
                      key={item.id}
                      className="mb-6 relative group/proj border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="absolute right-0 top-0 opacity-0 group-hover/proj:opacity-100 transition-opacity">
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
                              "text-foreground font-bold w-full mb-1",
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
                              "text-muted-foreground min-h-[60px] resize-none w-full border-none focus-visible:ring-0 px-0 shadow-none",
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

          {isEdit && (
            <div className="fixed bottom-10 right-10 z-50">
              <Button
                className="shadow-xl"
                size="lg"
                onClick={handleUpdateCV}
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

      {!isEdit && (
        <SaveResumeDialog
          open={isSaveDialogOpen}
          onOpenChange={setIsSaveDialogOpen}
          resumeName={resumeName}
          onResumeNameChange={setResumeName}
          onSave={handleSaveCV}
          isSaving={isSaving}
        />
      )}
    </>
  );
}
