import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobResType } from "@/schemasvalidation/job";
import {
  MapPin,
  DollarSign,
  Briefcase,
  User,
  Calendar,
  Clock,
  Building,
  Globe,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { generateSlugUrl } from "@/lib/utils";
import { useGetLang } from "@/hooks/use-get-lang";

import { IssueDialogForm } from "@/_pages/admin/issue/components/issue-modal-form";
import { Flag } from "lucide-react";
import { useAppStore } from "@/components/TanstackProvider";

interface JobDetailInfoProps {
  job: JobResType;
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-muted-foreground">{icon}</div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

export default function JobDetailInfo({ job }: JobDetailInfoProps) {
  const { isLogin } = useAppStore();
  const { getLang } = useGetLang();
  const [reportModalOpen, setReportModalOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <IssueDialogForm
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultValues={{
          type: "REPORT_JOB",
          targetId: job._id,
          title: `Báo cáo tin tuyển dụng: ${getLang(job.title)}`,
        }}
      />
      {/* Header Section */}
      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 border-primary border-2 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {job.company?.logo ? (
                <Image
                  src={job.company.logo}
                  alt={job.company.name}
                  className="max-w-full max-h-full object-contain"
                  width={128}
                  height={128}
                />
              ) : (
                <Building className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {getLang(job.title)}
              </h1>
              <div className="text-lg font-medium text-muted-foreground">
                {job.company?.name}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary text-lg">
                    {job.salary.min.toLocaleString()} -{" "}
                    {job.salary.max.toLocaleString()} {job.salary.currency}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Hạn nộp: {format(new Date(job.endDate), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Ứng tuyển ngay
                </Button>
                <Button variant="outline">Lưu tin</Button>
                {isLogin && (
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setReportModalOpen(true)}
                    title="Báo cáo tin tuyển dụng này"
                  >
                    <Flag className="w-5 h-5 mr-2" />
                    Báo cáo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Description */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3 mb-4 text-foreground">
                  Mô tả công việc
                </h2>
                <div
                  className="prose max-w-none text-muted-foreground dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: getLang(job.description) || "",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Company Info & General Info */}
        <div className="space-y-6">
          {/* Company Info Block (Moved here) */}
          {job.company && (
            <Card className="border-none shadow-sm bg-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold pl-3 border-l-4 border-primary mb-4 text-foreground">
                  Thông tin công ty
                </h2>
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 border-2 rounded border-primary flex items-center justify-center flex-shrink-0">
                    {job.company.logo ? (
                      <Image
                        src={job.company.logo}
                        alt={job.company.name}
                        className="max-w-full max-h-full object-contain"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <Building className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground ">
                      {job.company.name}
                    </h3>
                    {job.company.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {job.company.address}
                        </span>
                      </div>
                    )}
                    {job.company.website && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Globe className="w-4 h-4" />
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Website công ty
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {/* Short description */}
                <div className="text-muted-foreground text-sm line-clamp-4">
                  {getLang(job.company.description)}
                </div>
                <Link
                  href={`/company/${generateSlugUrl({
                    name: job.company.slug || job.company.name,
                    id: job.company._id,
                  })}`}
                  passHref
                >
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Xem chi tiết công ty
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-foreground pl-3 border-l-4 border-primary">
                Thông tin chung
              </h3>
              <div className="space-y-4">
                <InfoItem
                  icon={<User className="w-5 h-5" />}
                  label="Cấp bậc"
                  value={job.level}
                />
                <InfoItem
                  icon={<Briefcase className="w-5 h-5" />}
                  label="Hình thức"
                  value={job.employeeType}
                />
                <InfoItem
                  icon={<Calendar className="w-5 h-5" />}
                  label="Kinh nghiệm"
                  value={job.experience}
                />
                <InfoItem
                  icon={<User className="w-5 h-5" />}
                  label="Số lượng tuyển"
                  value={job.quantity.toString() + " người"}
                />
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-2 text-foreground">
                  Kỹ năng
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: any, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="font-normal bg-muted text-muted-foreground"
                    >
                      {typeof skill === "object" ? getLang(skill.name) : skill}
                    </Badge>
                  ))}
                  {job.otherSkills &&
                    job.otherSkills.map((skill, idx) => (
                      <Badge
                        key={`other-${idx}`}
                        variant="outline"
                        className="font-normal bg-muted text-muted-foreground"
                      >
                        {skill}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
