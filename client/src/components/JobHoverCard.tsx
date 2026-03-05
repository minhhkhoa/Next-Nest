"use client";

import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { JobResType } from "@/schemasvalidation/job";
import { Building, MapPin, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetLang } from "@/hooks/use-get-lang";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import BookmarkJobButton from "@/components/BookmarkJobButton";
import { ScrollArea } from "./ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateSlugUrl } from "@/lib/utils";

interface JobHoverCardProps {
  job: JobResType;
  children: React.ReactNode;
}

export default function JobHoverCard({ job, children }: JobHoverCardProps) {
  const { getLang } = useGetLang();
  const isMobile = useIsMobile();

  //- Trên thiết bị di động, không hiển thị hover card mà chỉ render children (là thẻ Link)
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-[400px] p-0" align="start">
        <div className="flex flex-col">
          {/* Header: Company & Job Title */}
          <div className="p-4 flex gap-3">
            <Avatar className="h-12 w-12 border">
              {job.company?.logo ? (
                <AvatarImage src={job.company.logo} alt={job.company.name} />
              ) : (
                <AvatarFallback>
                  <Building className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-sm leading-tight text-foreground">
                {getLang(job.title)}
              </h4>
              <p className="text-xs text-muted-foreground font-medium">
                {job.company?.name}
              </p>
              <div className="flex flex-col gap-2 text-xs text-muted-foreground mt-1">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                )}
                {job.salary && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <DollarSign className="h-3 w-3" />
                    {job.salary.min.toLocaleString()} -{" "}
                    {job.salary.max.toLocaleString()} {job.salary.currency}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Body: Description & Skills */}
          <div className="p-4 space-y-3">
            {/* Description Preview */}
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-foreground">
                Mô tả công việc
              </h5>
              <ScrollArea className="h-30">
                <div
                  className="text-xs text-muted-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: getLang(job.description) || "",
                  }}
                />
              </ScrollArea>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-foreground">
                  Kỹ năng yêu cầu
                </h5>
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 5).map((skill: any, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-5"
                    >
                      {typeof skill === "object" ? getLang(skill.name) : skill}
                    </Badge>
                  ))}
                  {job.skills.length > 5 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-5"
                    >
                      +{job.skills.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Footer: Actions */}
          <div className="p-3 bg-muted/40 flex items-center justify-between gap-2 rounded-b-lg">
            <Button
              className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
              asChild
            >
              <Link
                href={`/jobs/${generateSlugUrl({
                  name: getLang(job.slug) || getLang(job.title),
                  id: job._id,
                })}`}
              >
                Ứng tuyển
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-8 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary"
              asChild
            >
              <Link
                href={`/jobs/${generateSlugUrl({
                  name: getLang(job.slug) || getLang(job.title),
                  id: job._id,
                })}`}
              >
                Xem chi tiết
              </Link>
            </Button>
            <div className="flex-none">
              <BookmarkJobButton job={job} />
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
