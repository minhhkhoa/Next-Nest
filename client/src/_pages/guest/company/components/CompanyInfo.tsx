"use client";

import React, { useState } from "react";
import { CompanyResType } from "@/schemasvalidation/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Building2,
  Ticket,
  Network,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADHorizontal, ADVertical } from "@/_pages/home/components/ad";
import { useGetLang } from "@/hooks/use-get-lang";

interface CompanyInfoProps {
  company: CompanyResType;
}

export default function CompanyInfo({ company }: CompanyInfoProps) {
  const { getLang } = useGetLang();

  const industries = Array.isArray(company.industryID)
    ? company.industryID
    : [];

  const [isExpanded, setIsExpanded] = useState(false);
  const description = getLang(company.description) || "";
  const shouldTruncate = description.length > 500;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Left Column: Description & Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm border-none bg-background/50 backdrop-blur-sm">
          <CardHeader className="!px-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="text-primary" size={20} />
              Giới thiệu công ty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 !p-0">
            <div className="relative">
              <div
                className={cn(
                  "prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line transition-all duration-300 overflow-hidden",
                  !isExpanded && shouldTruncate
                    ? "max-h-[200px]"
                    : "max-h-full",
                )}
              >
                {description}
              </div>
              {!isExpanded && shouldTruncate && (
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent" />
              )}
            </div>

            {shouldTruncate && (
              <div className="flex justify-center mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-primary hover:text-primary/80 hover:bg-transparent"
                >
                  {isExpanded ? (
                    <span className="flex items-center gap-1">
                      Thu gọn <ChevronUp size={16} />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      Xem thêm <ChevronDown size={16} />
                    </span>
                  )}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t mt-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Ticket size={16} /> Mã số thuế
                </span>
                <span className="font-semibold">{company.taxCode}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Network size={16} /> Lĩnh vực hoạt động
                </span>
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry: any, index) => (
                    <Badge
                      key={typeof industry === "string" ? index : industry._id}
                      variant="secondary"
                      className="font-normal"
                    >
                      {typeof industry === "string"
                        ? industry
                        : getLang(industry.name)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <ADHorizontal />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Contact & Map */}
      <div className="space-y-6">
        <Card className="shadow-sm border-none bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-3 !px-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MapIcon className="text-primary" size={20} />
              Vị trí công ty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 !px-0">
            <div className="flex items-start gap-2 text-sm">
              <MapPin
                className="text-muted-foreground shrink-0 mt-0.5"
                size={16}
              />
              <span className="font-medium text-foreground/90">
                {company.address}
              </span>
            </div>

            <div className="w-full h-[300px] rounded-lg overflow-hidden border shadow-sm">
              <iframe
                title="Company Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(company.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="filter grayscale-[20%] hover:grayscale-0 transition-all duration-300"
              ></iframe>
            </div>
          </CardContent>
        </Card>

        {/* Advertisement Block */}
        <ADVertical />
      </div>
    </div>
  );
}
