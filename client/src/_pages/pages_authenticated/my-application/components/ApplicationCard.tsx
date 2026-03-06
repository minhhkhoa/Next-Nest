"use client";

import React, { useState } from "react";
import { ApplicationResType } from "@/schemasvalidation/application";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Eye, Trash2, Building } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { APPLICATION_STATUS } from "@/lib/constant";
import ApplicationDetailDialog from "./ApplicationDetailDialog";
import CancelApplicationAlertDialog from "./CancelApplicationAlertDialog";
import { generateSlugUrl, getSalaryText } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

const getStatusDetails = (statusValue: string) => {
  const st = APPLICATION_STATUS.find((s) => s.value === statusValue);
  switch (statusValue) {
    case "PENDING":
      return { label: st?.label || statusValue, variant: "secondary" as const };
    case "REVIEWING":
      return { label: st?.label || statusValue, variant: "default" as const };
    case "INTERVIEW":
      return {
        label: st?.label || statusValue,
        variant: "default" as const,
        className: "bg-blue-600 hover:bg-blue-600/80",
      };
    case "APPROVED":
      return {
        label: st?.label || statusValue,
        variant: "default" as const,
        className: "bg-green-600 hover:bg-green-600/80",
      };
    case "REJECTED":
      return {
        label: st?.label || statusValue,
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const job = typeof application.jobId === "object" ? application.jobId : null;
  const company =
    typeof application.companyId === "object" ? application.companyId : null;

  const jobTitle = job?.title?.vi || job?.title?.en || "Vị trí bảo mật";
  const salaryString = getSalaryText(
    job?.salary.min || 0,
    job?.salary.max || 0,
    job?.salary.currency || "VND",
  );

  const statusInfo = getStatusDetails(application.status);

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
                {company?.name || "Công ty bảo mật"}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                {salaryString}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Đã nộp{" "}
                {formatDistanceToNow(new Date(application.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
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
              Chi tiết
            </Button>
            {application.status === "PENDING" && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 sm:w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setCancelOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Rút đơn
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
