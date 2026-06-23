"use client";

import React, { useState } from "react";
import { ApplicationResType } from "@/schemasvalidation/application";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Calendar,
  Eye,
  Trash2,
  Building,
  CheckCheck,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import ApplicationDetailDialog from "./ApplicationDetailDialog";
import CancelApplicationAlertDialog from "./CancelApplicationAlertDialog";
import { generateSlugUrl, getSalaryText } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useGetLang } from "@/hooks/use-get-lang";

const getStatusDetails = (statusValue: string, tCommon: any) => {
  switch (statusValue) {
    case "PENDING":
      return {
        label: tCommon("Status.pending"),
        variant: "secondary" as const,
      };
    case "REVIEWING":
      return {
        label: tCommon("Status.reviewing"),
        variant: "default" as const,
      };
    case "INTERVIEW":
      return {
        label: tCommon("Status.interview"),
        variant: "default" as const,
        className: "bg-blue-600 hover:bg-blue-600/80",
      };
    case "APPROVED":
      return {
        label: tCommon("Status.approved"),
        variant: "default" as const,
        className: "bg-green-600 hover:bg-green-600/80",
      };
    case "REJECTED":
      return {
        label: tCommon("Status.rejected"),
        variant: "destructive" as const,
      };
    default:
      return { label: statusValue, variant: "secondary" as const };
  }
};

export default function ApplicationCard({
  application,
}: {
  application: ApplicationResType;
}) {
  const t = useTranslations("Candidate.MyApplication");
  const tCommon = useTranslations("Common");
  const { getLang, locale } = useGetLang();

  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const job = typeof application.jobId === "object" ? application.jobId : null;
  const company =
    typeof application.companyId === "object" ? application.companyId : null;

  const jobTitle = getLang(job?.title) || tCommon("ConfidentialJob");
  const salaryString = getSalaryText(
    job?.salary!.min || 0,
    job?.salary!.max || 0,
    job?.salary!.currency || "VND",
  );

  const statusInfo = getStatusDetails(application.status, tCommon);

  console.log("application: ", application);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow group overflow-hidden">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 border rounded-lg overflow-hidden relative bg-muted flex items-center justify-center">
            {company?.logo ? (
              <Image
                src={company.logo}
                alt={company.name || "Company Logo"}
                fill
                className="object-contain p-1"
              />
            ) : (
              <Building className="text-muted-foreground w-8 h-8" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/jobs/${generateSlugUrl({
                    id: job?._id || "",
                    name: job?.slug.vi || job?.slug.en || "",
                  })}`}
                  className="font-semibold text-lg text-primary hover:underline line-clamp-1"
                  target="_blank"
                >
                  {jobTitle}
                </Link>
                <Badge
                  variant={statusInfo.variant}
                  className={statusInfo.className}
                >
                  {statusInfo.label}
                </Badge>
              </div>
              <Link
                href={`/company/${generateSlugUrl({
                  id: company?._id || "",
                  name: company?.slug || "",
                })}`}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
              >
                {company?.name || tCommon("ConfidentialCompany")}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                {salaryString}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {t("ApplyDate", {
                  date: formatDistanceToNow(new Date(application.createdAt), {
                    addSuffix: true,
                    locale: locale === "vi" ? vi : enUS,
                  }),
                })}
              </span>
              {application.status === "PENDING" && (
                <span
                  className={`flex items-center gap-1.5 ${application.isViewed ? "text-blue-500" : "text-muted-foreground"}`}
                >
                  {application.isViewed ? (
                    <CheckCheck className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  {application.isViewed
                    ? t("RecruiterViewed")
                    : t("RecruiterNotViewed")}
                </span>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:w-full"
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t("Detail")}
            </Button>
            {application.status === "PENDING" && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 sm:w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setCancelOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("CancelApply")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ApplicationDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        application={application}
        jobTitle={jobTitle}
        companyName={company?.name}
      />

      <CancelApplicationAlertDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        applicationId={application._id}
        jobTitle={jobTitle}
      />
    </>
  );
}
