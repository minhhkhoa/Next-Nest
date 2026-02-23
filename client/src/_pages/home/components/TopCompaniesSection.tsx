"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetCompanies } from "@/queries/useCompany";
import ListJobSkeleton from "@/components/skeletons/list-job";
import { generateSlugUrl } from "@/lib/utils";

export default function TopCompaniesSection() {
  const { data: listCompanies, isLoading } = useGetCompanies({
    page: 1,
    pageSize: 8,
  });
  const companies = listCompanies?.data?.result || [];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-primary pl-4 border-l-4 border-primary">
              Nhà tuyển dụng hàng đầu
            </h2>
            <p className="text-muted-foreground">
              Khám phá các công ty hàng đầu đang tuyển dụng
            </p>
          </div>

          <Link href="/company">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              Xem tất cả <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <ListJobSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companies.map((company) => (
              <div key={company._id} className="group relative">
                <Link
                  href={`/company/${generateSlugUrl({
                    name: company.slug || company.name,
                    id: company._id,
                  })}`}
                >
                  <Card className="h-full border hover:border-primary transition-all duration-300 hover:shadow-lg bg-card">
                    <CardContent className="p-4 flex flex-col items-center justify-center h-40 text-center">
                      <div className="relative w-20 h-20 mb-3 grayscale group-hover:grayscale-0 transition-all duration-300">
                        {company.logo ? (
                          <Image
                            src={company.logo}
                            alt={company.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted rounded-full flex items-center justify-center text-xs">
                            No Logo
                          </div>
                        )}
                      </div>
                      <h3
                        className="text-sm font-semibold truncate w-full px-2"
                        title={company.name}
                      >
                        {company.name}
                      </h3>
                      <span className="text-xs text-muted-foreground mt-1">
                        {company.totalJob || 0} việc làm
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
