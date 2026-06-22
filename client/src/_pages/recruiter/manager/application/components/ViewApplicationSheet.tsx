"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ApplicationResType } from "@/schemasvalidation/application";
import { CV_TEMPLATES } from "@/lib/constant";
import BasicTemplate from "@/components/cv-templates/BasicTemplate";
import ImpressiveTemplate from "@/components/cv-templates/ImpressiveTemplate";
import ModernTemplate from "@/components/cv-templates/ModernTemplate";
import SimpleTemplate from "@/components/cv-templates/SimpleTemplate";
import { useGetApplicationDetail } from "@/queries/useApplication";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Briefcase,
  CalendarClock,
  FileText,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { generateStatusOptions } from "../application-jobColumn";
import StartChatButton from "@/components/StartChatButton";
import AiMatchModal from "./AiMatchModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useGetLang } from "@/hooks/use-get-lang";

export const TEMPLATE_COMPONENTS: Record<string, React.ElementType> = {
  [CV_TEMPLATES.basicTemplate]: BasicTemplate,
  [CV_TEMPLATES.impressiveTemplate]: ImpressiveTemplate,
  [CV_TEMPLATES.modernTemplate]: ModernTemplate,
  [CV_TEMPLATES.simpleTemplate]: SimpleTemplate,
};

interface ViewApplicationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string | null;
}

export function ViewApplicationSheet({
  open,
  onOpenChange,
  applicationId,
}: ViewApplicationSheetProps) {
  const t = useTranslations("Recruiter.ApplicationManager");
  const { locale } = useGetLang();
  const { data: qData, isLoading } = useGetApplicationDetail(
    applicationId || "",
    open && !!applicationId,
  );

  const [isAiMatchOpen, setIsAiMatchOpen] = React.useState(false);
  //- state chuyển đổi tab thông tin và cv trên mobile
  const [mobileTab, setMobileTab] = React.useState<"info" | "cv">("info");

  const application: ApplicationResType | undefined = qData?.data;

  const renderCV = () => {
    if (!application) return null;

    if (application.resumeType === "UPLOAD_CV") {
      return (
        <div className="flex-1 w-full bg-muted/20 relative">
          <iframe
            src={`${application.cvUrl}#toolbar=0`}
            className="w-full h-full border-0 absolute inset-0"
            style={{ height: "100%" }}
            title="CV Document"
          />
        </div>
      );
    }

    if (application.resumeType === "SYSTEM_CV") {
      const templateId = application.systemCvData?.templateId;
      const content = application.systemCvData?.resumeContent;

      const templateProps = { data: content, isEdit: false, isView: true };
      const TemplateComponent = templateId
        ? TEMPLATE_COMPONENTS[templateId]
        : null;

      return (
        <div className="flex-1 w-full bg-muted/20 overflow-y-auto p-4 flex justify-center">
          <div className="max-w-4xl w-full bg-white shadow-sm ring-1 ring-border p-2">
            {TemplateComponent ? (
              <TemplateComponent {...templateProps} />
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                {t("NoCvTemplate")}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/*- tăng z-index của nút đóng x để không bị che bởi header */}
      <SheetContent
        side="right"
        className="w-[100vw] sm:max-w-6xl p-0 flex flex-col h-full ring-0 focus-visible:outline-none [&>button]:z-50"
      >
        <SheetHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between shadow-sm bg-background z-10 w-full relative">
          <SheetTitle className="text-lg grow text-center">
            {t("CandidateProfileDetail")}
          </SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <Spinner />
          </div>
        ) : !application ? (
          <div className="flex-1 flex justify-center items-center">
            <span className="text-muted-foreground">
              {t("ApplicationNotFound")}
            </span>
          </div>
        ) : (
          <>
            {/*- thanh chuyển đổi tab trên mobile */}
            <div className="flex md:hidden border-b bg-background p-2 gap-2 shrink-0">
              <Button
                variant={mobileTab === "info" ? "default" : "ghost"}
                className={cn(
                  "flex-1 h-9 rounded-lg text-sm font-medium transition-all duration-200",
                  mobileTab === "info" && "bg-primary text-primary-foreground shadow-sm"
                )}
                onClick={() => setMobileTab("info")}
              >
                {t("CandidateInfo")}
              </Button>
              <Button
                variant={mobileTab === "cv" ? "default" : "ghost"}
                className={cn(
                  "flex-1 h-9 rounded-lg text-sm font-medium transition-all duration-200",
                  mobileTab === "cv" && "bg-primary text-primary-foreground shadow-sm"
                )}
                onClick={() => setMobileTab("cv")}
              >
                {t("CvDetail")}
              </Button>
            </div>

            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
              {/* Sidebar Details */}
              <div
                className={cn(
                  "w-full md:w-1/3 xl:w-[400px] border-b md:border-b-0 md:border-r bg-background overflow-y-auto outline-none p-5 flex flex-col gap-6",
                  mobileTab === "info" ? "flex" : "hidden md:flex"
                )}
              >
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border">
                  <AvatarImage
                    src={
                      typeof application.userId === "object"
                        ? application.userId.avatar || undefined
                        : undefined
                    }
                  />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {typeof application.userId === "object"
                      ? application.userId.name?.charAt(0)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {typeof application.userId === "object"
                      ? application.userId.name
                      : t("DeletedUser")}
                  </h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{application.email}</span>
                  </div>
                </div>

                <StartChatButton
                  receiverId={
                    typeof qData?.data?.userId === "object"
                      ? qData?.data?.userId?._id || ""
                      : ""
                  } // Truyền ID của ứng viên để bắt đầu chat
                  jobReferenceId={
                    typeof qData?.data?.jobId === "object"
                      ? qData?.data?.jobId?._id || ""
                      : ""
                  }
                  label={t("Chat")}
                  variant="outline"
                  className="h-8 py-0 px-3 text-sm"
                />
              </div>

              {/* Status & Rating */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div>
                  <p className="text-[11px] font-medium uppercase text-muted-foreground mb-1.5">
                    {t("Status")}
                  </p>
                  <div>{generateStatusOptions(application.status)}</div>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase text-muted-foreground mb-1.5">
                    {t("Score")}
                  </p>
                  <div>
                    {application.score && application.score > 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-primary">
                          {application.score}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          / 100
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground italic">
                        {t("NotScored")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Assessment Button */}
              <Button
                onClick={() => setIsAiMatchOpen(true)}
                className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none shadow-lg shadow-purple-500/20 font-bold h-11"
              >
                <Sparkles className="w-4 h-4 fill-white animate-pulse" />
                {t("AiAssessment")}
              </Button>

              {/* Job Info */}
              <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-card">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> {t("AppliedJob")}
                  </p>
                  <p className="font-medium text-sm leading-snug">
                    {typeof application.jobId === "object"
                      ? application.jobId.title?.vi ||
                        application.jobId.title?.en
                      : t("DeletedJob")}
                  </p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase mb-1.5 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" /> {t("ApplyDate")}
                  </p>
                  <p className="text-sm font-medium">
                    {format(
                      new Date(application.createdAt),
                      "dd/MM/yyyy • HH:mm",
                      { locale: locale === "vi" ? vi : undefined },
                    )}
                  </p>
                </div>

                {application.status === "INTERVIEW" &&
                  application.interviewTime && (
                    <div className="pt-3 border-t">
                      <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase mb-1.5 flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5" /> {t("InterviewTime")}
                      </p>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {format(
                          new Date(application.interviewTime),
                          "dd/MM/yyyy • HH:mm",
                          { locale: locale === "vi" ? vi : undefined },
                        )}
                      </p>
                    </div>
                  )}
              </div>

              {/* Cover Letter */}
              <div className="space-y-2.5">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                    <FileText className="w-4 h-4" />
                  </div>
                  {t("CoverLetterTitle")}
                </div>
                <div className="text-sm text-foreground bg-muted/20 p-3.5 rounded-lg border border-border/50 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                  {(typeof application.coverLetter === "object"
                    ? application.coverLetter.vi
                    : application.coverLetter) || (
                    <span className="italic text-muted-foreground">
                      {t("NoCoverLetter")}
                    </span>
                  )}
                </div>
              </div>

              {/* Recruiter Notes */}
              {application.recruiterNote && (
                <div className="space-y-2.5">
                  <div className="text-sm font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                    <div className="p-1.5 bg-yellow-500/10 text-yellow-600 rounded-md">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    {t("InternalNote")}
                  </div>
                  <div className="text-sm bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200/80 p-3.5 border border-yellow-200 dark:border-yellow-900/30 rounded-lg whitespace-pre-wrap">
                    {typeof application.recruiterNote === "object"
                      ? application.recruiterNote.vi
                      : application.recruiterNote}
                  </div>
                </div>
              )}
            </div>

            {/* CV Section Main */}
            <div
              className={cn(
                "flex-1 flex flex-col h-full bg-muted/30 relative",
                mobileTab === "cv" ? "flex" : "hidden md:flex"
              )}
            >
              {renderCV()}
            </div>
          </div>
        </>
      )}
        <AiMatchModal
          isOpen={isAiMatchOpen}
          onClose={() => setIsAiMatchOpen(false)}
          cvId={
            application?.resumeType === "SYSTEM_CV"
              ? typeof application?.systemCvData?.userResumeId === "object"
                ? (application?.systemCvData?.userResumeId as any)?._id || null
                : application?.systemCvData?.userResumeId || null
              : null
          }
          jobId={
            typeof application?.jobId === "object"
              ? application?.jobId?._id || null
              : (application?.jobId as any) || null
          }
        />
      </SheetContent>
    </Sheet>
  );
}
