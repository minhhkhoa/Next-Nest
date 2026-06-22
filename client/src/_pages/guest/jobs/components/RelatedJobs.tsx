import React, { useState } from "react";
import { useGetRelatedJobs } from "@/queries/useJob";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign } from "lucide-react";
import Image from "next/image";
import DataTablePagination from "@/components/DataTablePagination";
import ListJobSkeleton from "@/components/skeletons/list-job";
import { generateSlugUrl, getSalaryText } from "@/lib/utils";
import JobHoverCard from "@/components/JobHoverCard";
import { useGetLang } from "@/hooks/use-get-lang";
import { useTranslations } from "next-intl";

interface RelatedJobsProps {
  jobId: string;
}

export default function RelatedJobs({ jobId }: RelatedJobsProps) {
  const { getLang } = useGetLang();
  const t = useTranslations("PageJobDetail");
  const tCommon = useTranslations("Common");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data: relatedJobsData, isLoading } = useGetRelatedJobs(
    jobId,
    page,
    pageSize,
  );

  const responseData = relatedJobsData?.data;
  const relatedJobs = responseData?.result || [];
  const meta = responseData?.meta || {
    current: page,
    pageSize,
    totalPages: 0,
    totalItems: 0,
  };

  if (isLoading) {
    return <ListJobSkeleton />;
  }

  if (relatedJobs.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4  pl-3 border-l-4 border-primary text-primary">
        {t("RelatedJobs")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {relatedJobs.map((job) => (
          <Link
            href={`/jobs/${generateSlugUrl({
              name: getLang(job.slug) || getLang(job.title),
              id: job._id,
            })}`}
            key={job._id}
            className="block h-full group"
          >
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between bg-card text-card-foreground border-border group-hover:border-primary/50 !gap-2 py-2">
              <CardHeader className="py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <JobHoverCard job={job}>
                      <CardTitle
                        className="text-base font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors pt-2"
                        title={getLang(job.title)}
                      >
                        {getLang(job.title)}
                      </CardTitle>
                    </JobHoverCard>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {job.company?.name || tCommon("AnonymousCompany")}
                    </p>
                  </div>
                  <div className="border-2 rounded-lg overflow-hidden flex-shrink-0">
                    {job.company?.logo ? (
                      <Image
                        width={256}
                        height={256}
                        src={job.company.logo}
                        alt={job.company.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary">
                      {getSalaryText(
                        job.salary.min,
                        job.salary.max,
                        job.salary.currency,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1" title={job.location}>
                      {job.location}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 my-2">
                  {job.skills.slice(0, 3).map((skill: any, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="font-normal text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      {typeof skill === "object" ? getLang(skill.name) : skill}
                    </Badge>
                  ))}
                  {job.skills.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="font-normal text-xs bg-secondary text-secondary-foreground"
                    >
                      +{job.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <DataTablePagination meta={meta} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
