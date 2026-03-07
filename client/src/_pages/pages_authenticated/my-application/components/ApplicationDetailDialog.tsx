"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ApplicationResType } from "@/schemasvalidation/application";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, CalendarClock, Info, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { generateSlugUrl } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import applicationApiRequest from "@/apiRequest/application";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: ApplicationResType;
  jobTitle: string;
  companyName?: string;
}

export default function ApplicationDetailDialog({
  open,
  onOpenChange,
  application: initialApplication,
  jobTitle,
  companyName,
}: Props) {
  const [openPdfViewer, setOpenPdfViewer] = React.useState(false);

  const { data: detailData } = useQuery({
    queryKey: ["my-application-detail", initialApplication._id],
    queryFn: async () => {
      const res = await applicationApiRequest.findOne(initialApplication._id);
      return res.data;
    },
    enabled: open,
  });

  const application = detailData || initialApplication;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Chi tiết đơn ứng tuyển
            </DialogTitle>
            <DialogDescription>
              {jobTitle} - {companyName || "Công ty bảo mật"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Trạng thái đơn và thông báo từ nhà tuyển dụng */}
            {application.status === "INTERVIEW" && application.interviewTime && (
              <div className="flex gap-3 items-start text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-900/50 p-4 rounded-lg">
                <CalendarClock className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-base mb-1">Nhà tuyển dụng mời bạn phỏng vấn!</p>
                  <p>Thời gian dự kiến: <span className="font-medium">{format(new Date(application.interviewTime), "dd/MM/yyyy HH:mm", { locale: vi })}</span></p>
                  <p className="text-muted-foreground mt-1 text-xs">Vui lòng kiểm tra email của bạn để biết thêm chi tiết mốc thời gian hoặc đường dẫn tham gia.</p>
                </div>
              </div>
            )}

            {application.status === "REJECTED" && (
              <div className="flex gap-3 items-start text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900/50 p-4 rounded-lg">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div className="w-full">
                  <p className="font-semibold text-base mb-1">Cảm ơn bạn đã ứng tuyển</p>
                  <p>Rất tiếc hồ sơ của bạn chưa phù hợp với vị trí này.</p>
                  {application.rejectionReason && (
                    <div className="mt-2 p-3 bg-white/50 dark:bg-background/50 rounded border border-red-100 dark:border-red-900/30 whitespace-pre-wrap text-sm">
                      <p className="font-medium text-xs uppercase opacity-70 mb-1">Phản hồi từ nhà tuyển dụng:</p>
                      {typeof application.rejectionReason === "object" ? application.rejectionReason.vi : application.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thông tin thời gian */}
            <div className="flex gap-2 items-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <CalendarClock className="w-4 h-4" />
              <span>
                Thời gian nộp:{" "}
                <span className="font-medium text-foreground">
                  {format(new Date(application.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </span>
              </span>
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                Thư giới thiệu (Cover Letter)
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg border text-sm whitespace-pre-wrap min-h-[100px]">
                {application.coverLetter && (
                  <div className="pt-2">
                    <span className="font-semibold text-foreground block mb-2">
                      Thư giới thiệu:
                    </span>
                    <div className="text-muted-foreground p-3 bg-background rounded-md border min-h-[60px] whitespace-pre-wrap leading-relaxed">
                      {typeof application.coverLetter === "object"
                        ? application.coverLetter.vi
                        : application.coverLetter}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nguồn CV */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                Hồ sơ đính kèm (CV)
              </h3>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {application.resumeType === "SYSTEM_CV"
                        ? "CV tạo từ hệ thống"
                        : "CV tải lên từ thiết bị"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {application.resumeType === "SYSTEM_CV"
                        ? "Mẫu CV tiêu chuẩn"
                        : "File PDF hoặc Document"}
                    </p>
                  </div>
                </div>

                {application.resumeType === "UPLOAD_CV" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setOpenPdfViewer(true);
                      onOpenChange(false);
                    }}
                  >
                    Xem CV <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button asChild variant="secondary" size="sm">
                    <Link
                      href={`/my-cv/${generateSlugUrl({
                        id: application.systemCvData?.userResumeId as string,
                        name:
                          application.systemCvData?.templateId || "cv-cua-toi",
                      })}?edit=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Xem CV <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={openPdfViewer} onOpenChange={setOpenPdfViewer}>
        <SheetContent
          side="right"
          className="w-[70vw] sm:max-w-2xl p-0 flex flex-col h-full ring-0 focus-visible:outline-none"
        >
          <SheetHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between shadow-sm bg-background z-10 w-full relative">
            <SheetTitle className="text-lg grow text-center">
              Hồ sơ ứng tuyển - {jobTitle}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 w-full bg-muted/20 relative">
            <iframe
              src={`${application.cvUrl}#toolbar=0`}
              className="w-full h-full border-0 absolute inset-0"
              style={{ height: "calc(100vh - 65px)" }}
              title="CV Document"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
