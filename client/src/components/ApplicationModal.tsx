"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createApplicationSchema,
  CreateApplicationType,
} from "@/schemasvalidation/application";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateApplication } from "@/queries/useApplication";
import { useGetUserResumes } from "@/queries/useUserResume";
import Link from "next/link";
import { Loader2, UploadCloud, X, FileText, Trash2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/utils";
import { useAppStore } from "./TanstackProvider";
import SoftSuccessSonner from "./shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "./shadcn-studio/sonner/SoftDestructiveSonner";

interface ApplicationModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ApplicationModal({
  jobId,
  jobTitle,
  companyName,
  open,
  onOpenChange,
  trigger,
}: ApplicationModalProps) {
  const { isLogin, user } = useAppStore();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange : setInternalOpen;

  const [activeTab, setActiveTab] = useState<string>("UPLOAD_CV");

  const { mutateAsync: createApplication, isPending } = useCreateApplication();
  const { data: userResumes } = useGetUserResumes(isLogin);

  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      jobId,
      email: user?.email || "",
      resumeType: "UPLOAD_CV",
      coverLetter: "",
      cvUrl: "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(selectedFile, "urlCv");

        if (url) {
          form.setValue("cvUrl", url);
          SoftSuccessSonner("Tải file thành công");
        } else {
          SoftDestructiveSonner("Không lấy được đường dẫn file");
          setFile(null);
        }
      } catch (error) {
        console.error(error);
        SoftDestructiveSonner("Upload file thất bại");
        setFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    form.setValue("cvUrl", "");
  };

  const onSubmit = async (values: CreateApplicationType) => {
    if (activeTab === "UPLOAD_CV" && !values.cvUrl) {
      SoftDestructiveSonner("Vui lòng tải lên CV của bạn");
      return;
    }

    if (activeTab === "SYSTEM_CV" && !values.systemCvData?.userResumeId) {
      SoftDestructiveSonner("Vui lòng chọn một CV từ hệ thống");
      return;
    }

    try {
      const payload = {
        ...values,
        jobId,
        resumeType: activeTab as "UPLOAD_CV" | "SYSTEM_CV",
        cvUrl: activeTab === "UPLOAD_CV" ? values.cvUrl : undefined,
        systemCvData:
          activeTab === "SYSTEM_CV" ? values.systemCvData : undefined,
      };

      await createApplication(payload);
      SoftSuccessSonner("Nộp hồ sơ ứng tuyển thành công!");
      if (setShow) setShow(false);
      form.reset();
      setFile(null);
      setActiveTab("UPLOAD_CV");
    } catch (error: any) {
      SoftDestructiveSonner(error?.message || "Có lỗi xảy ra khi nộp hồ sơ");
    }
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    form.setValue("resumeType", val as "UPLOAD_CV" | "SYSTEM_CV");
    form.clearErrors();
  };

  useEffect(() => {
    if (jobId) {
      form.setValue("jobId", jobId);
    }
  }, [jobId, form]);

  useEffect(() => {
    if (user && user.email) {
      form.setValue("email", user.email);
    }
  }, [user, form]);

  useEffect(() => {
    //- hiển thị lỗi
    if (form.formState.errors) {
      const errorMessages = Object.values(form.formState.errors).map(
        (error) => error.message,
      );
      errorMessages.forEach((msg) => {
        console.log("mess: ", msg);
      });
    }
  }, [form.formState.errors]);

  if (!isLogin) return null;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Ứng tuyển: {jobTitle}</DialogTitle>
          <DialogDescription>Nộp hồ sơ vào {companyName}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* Form được set layout flex column full height */}
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("Validation errors:", errors);
              SoftDestructiveSonner("Vui lòng kiểm tra lại thông tin nhập");
            })}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Vùng nội dung cuộn (Inputs) */}
            <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email liên hệ <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập email của bạn"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2 border rounded-md p-4">
                <Label className="text-base font-semibold">
                  Chọn phương thức nộp CV
                </Label>
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="UPLOAD_CV">
                      Tải CV lên (PDF)
                    </TabsTrigger>
                    <TabsTrigger value="SYSTEM_CV">
                      CV Online trên hệ thống
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="UPLOAD_CV" className="pt-4 space-y-4">
                    {!file ? (
                      <div className="relative group">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-lg p-6 cursor-pointer hover:bg-primary/5 transition-colors">
                          <Input
                            type="file"
                            accept=".pdf"
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                            onChange={handleFileChange}
                            disabled={isUploading}
                          />
                          <UploadCloud className="h-10 w-10 mb-2 text-primary" />
                          <p className="text-sm font-medium truncate max-w-[80%] text-center">
                            Nhấn để tải lên file PDF
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Dung lượng tối đa 5MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-background rounded-full shadow-sm">
                            {isUploading ? (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : (
                              <FileText className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isUploading
                                ? "Đang tải lên..."
                                : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={handleRemoveFile}
                          disabled={isUploading}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    )}

                    <div className="hidden">
                      <Input {...form.register("cvUrl")} />
                    </div>

                    {form.formState.errors.cvUrl && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.cvUrl.message}
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="SYSTEM_CV" className="pt-4 space-y-4">
                    {userResumes &&
                    userResumes.data &&
                    userResumes.data.length > 0 ? (
                      <FormField
                        control={form.control}
                        name="systemCvData.userResumeId"
                        render={({ field }) => (
                          <FormItem>
                            <RadioGroup
                              onValueChange={(val) => {
                                field.onChange(val);
                                const resume = userResumes.data?.find(
                                  (r: any) => r._id === val,
                                );

                                if (resume) {
                                  const templateId =
                                    (resume as any).templateID ||
                                    (resume as any).templateId ||
                                    (resume as any).metadata?.templateId;
                                  const resumeContent =
                                    (resume as any).content ||
                                    (resume as any).metadata;
                                  if (templateId) {
                                    form.setValue(
                                      "systemCvData.templateId",
                                      templateId,
                                    );
                                  }
                                  if (resumeContent) {
                                    form.setValue(
                                      "systemCvData.resumeContent",
                                      resumeContent,
                                    );
                                  }
                                }
                              }}
                              value={field.value as string}
                              className="grid gap-4 max-h-[300px] overflow-y-auto pr-2"
                            >
                              {userResumes.data?.map((resume: any) => (
                                <div
                                  key={resume._id}
                                  className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted cursor-pointer"
                                >
                                  <RadioGroupItem
                                    value={resume._id}
                                    id={resume._id}
                                  />
                                  <Label
                                    htmlFor={resume._id}
                                    className="flex-1 cursor-pointer font-normal grid"
                                  >
                                    <span className="font-semibold">
                                      {resume.title ||
                                        resume.resumeName ||
                                        "CV Không tên"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Cập nhật:{" "}
                                      {new Date(
                                        resume.updatedAt,
                                      ).toLocaleDateString("vi-VN")}
                                    </span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="text-center py-6 flex flex-col items-center">
                        <p className="text-gray-500 mb-4">
                          Bạn chưa có CV nào trên hệ thống
                        </p>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/my-cv" onClick={() => setShow?.(false)}>
                            Quản lý CV
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thư giới thiệu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Viết đôi lời giới thiệu về bản thân và lý do bạn phù hợp với công việc này..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer cố định ở dưới */}
            <DialogFooter className="pt-4 border-t mt-auto gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShow?.(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending || isUploading}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? "Đang tải CV..." : "Nộp hồ sơ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
