"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetCompanies } from "@/queries/useCompany";

export default function TopBrandsSection() {
  const { data: listCompanies, isLoading } = useGetCompanies({
    page: 1,
    pageSize: 12,
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

          <Link href="/companies">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              Xem tất cả <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companies.map((company: any) => (
              <div key={company._id} className="group relative">
                <Link href={`/companies/${company._id}`}>
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
