import React from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, DollarSign, Clock } from "lucide-react";
import { JobResType } from "@/schemasvalidation/job";
import { convertToSlug } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface JobCardProps {
  job: JobResType;
}

export default function JobCard({ job }: JobCardProps) {
  const generateSlugUrl = (job: JobResType) => {
    const slug = job.slug?.vi || convertToSlug(job.title?.vi || "");
    return `/jobs/${slug}`; // Or /viec-lam/${slug}
  };

  const getSalaryText = (min: number, max: number, currency: string) => {
    if (min === 0 && max === 0) return "Thỏa thuận";
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border shadow-sm border-border bg-card h-full flex flex-col">
      <CardHeader className="p-4 pb-2 flex flex-row gap-3 items-start space-y-0">
        <div className="w-16 h-16 relative flex-shrink-0 border border-border rounded-lg overflow-hidden bg-background">
             {job.company?.logo ? (
                <Image
                src={job.company.logo}
                alt={job.company.name}
                fill
                className="object-contain p-1"
                />
            ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground text-center">
                    No Logo
                </div>
            )}
        </div>
        <div className="flex-1 overflow-hidden">
          <Link href={generateSlugUrl(job)} className="hover:text-primary transition-colors">
            <h3 className="font-bold text-lg truncate" title={job.title?.vi}>
                {job.title?.vi}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground truncate" title={job.company?.name}>
            {job.company?.name}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 py-2 flex-1">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">
              {getSalaryText(job.salary.min, job.salary.max, job.salary.currency)}
            </span>
          </div>
          
          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
             <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="truncate max-w-[150px]" title={job.location}>
                {job.location.split(',')[0]}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
            {job.skills && job.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="font-normal text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    {skill}
                </Badge>
            ))}
             {job.skills && job.skills.length > 3 && (
                 <Badge variant="secondary" className="font-normal text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80">+{job.skills.length - 3}</Badge>
             )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 border-t border-border flex justify-between items-center bg-muted/30 rounded-b-lg">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
             <Clock className="w-3 h-3" />
             {job.updatedAt ? format(new Date(job.updatedAt), "dd/MM/yyyy") : "N/A"}
        </span>
        <Badge variant={job.isHot?.isHotJob ? "destructive" : "outline"} className={job.isHot?.isHotJob ? "bg-red-500 hover:bg-red-600" : "border-border text-muted-foreground"}>
            {job.isHot?.isHotJob ? "Hot" : "Mới"}
        </Badge>
      </CardFooter>
    </Card>
  );
}
