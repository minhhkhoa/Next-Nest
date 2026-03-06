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
import { ExternalLink, FileText, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { generateSlugUrl } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

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
  application,
  jobTitle,
  companyName,
}: Props) {
  const [openPdfViewer, setOpenPdfViewer] = React.useState(false);

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
                {application.coverLetter || (
                  <span className="text-muted-foreground italic">
                    Không đính kèm thư giới thiệu.
                  </span>
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
