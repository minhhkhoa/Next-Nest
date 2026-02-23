"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Briefcase,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetTreeIndustry } from "@/queries/useIndustry";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ADDRESS_OPTIONS } from "@/lib/constant";
import IndustrySelector from "./IndustrySelector";

export default function SearchSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [openLocation, setOpenLocation] = useState(false);
  const [industry, setIndustry] = useState(searchParams.get("industry") || "");

  const { data: industryData } = useGetTreeIndustry({});

  const industries = industryData?.data || [];

  useEffect(() => {
    // Sync URL params to state on load/change
    if (searchParams.get("keyword")) setKeyword(searchParams.get("keyword")!);
    if (searchParams.get("location"))
      setLocation(searchParams.get("location")!);
    if (searchParams.get("industry"))
      setIndustry(searchParams.get("industry")!);
  }, [searchParams]);

  const handleSearch = (
    keywordOverride?: string,
    industryOverride?: string,
  ) => {
    const params = new URLSearchParams();
    const currentKeyword =
      typeof keywordOverride === "string" ? keywordOverride : keyword;
    const currentIndustry =
      typeof industryOverride === "string" ? industryOverride : industry;

    if (currentKeyword) params.set("keyword", currentKeyword);
    if (location) params.set("location", location);
    if (currentIndustry) params.set("industry", currentIndustry);

    const queryString = params.toString();
    router.push(`/jobs${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="bg-background py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 pointer-events-none dark:opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-bold text-primary mb-6"
        >
          Tìm kiếm công việc mơ ước của bạn <br className="hidden md:block" />
          với hàng nghìn cơ hội hấp dẫn
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground max-w-2xl mb-10"
        >
          Khám phá cơ hội nghề nghiệp tốt nhất từ các công ty hàng đầu. Kết nối
          với nhà tuyển dụng uy tín và phát triển sự nghiệp của bạn ngay hôm
          nay.
        </motion.p>

        <motion.div
          className="bg-card p-4 rounded-xl shadow-lg w-full max-w-4xl flex flex-col md:flex-row gap-4 md:gap-0 items-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Keyword Search */}
          <div className="flex-1 w-full flex items-center md:border-r border-border md:pr-4 relative">
            <Search className="text-muted-foreground w-5 h-5 mr-2" />
            <Input
              placeholder="Vị trí, Từ khóa..."
              className="border-none shadow-none focus-visible:ring-0 px-2 text-base pr-8"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {keyword && (
              <X
                className="w-4 h-4 text-muted-foreground absolute right-4 cursor-pointer hover:text-foreground"
                onClick={() => setKeyword("")}
              />
            )}
          </div>

          {/* Industry Select */}
          <div className="hidden md:flex-1 w-full md:flex items-center md:border-r border-border md:px-4 relative">
            <Briefcase className="text-muted-foreground w-5 h-5 mr-2" />
            <IndustrySelector
              industries={industries}
              value={industry}
              onSelect={(id) => {
                setIndustry(id);
              }}
            />
            {industry && (
              <X
                className="w-4 h-4 text-muted-foreground absolute right-8 cursor-pointer hover:text-foreground z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndustry("");
                }}
              />
            )}
          </div>

          {/* Location Select */}
          <div className="flex-1 w-full flex items-center px-2 relative">
            <MapPin className="text-muted-foreground w-5 h-5 mr-2" />
            <Popover open={openLocation} onOpenChange={setOpenLocation}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={openLocation}
                  className={cn(
                    "w-full justify-between hover:bg-transparent px-2 text-base font-normal border-none shadow-none focus-visible:ring-0 pr-8",
                    !location && "text-muted-foreground",
                  )}
                >
                  {location && location !== "all"
                    ? ADDRESS_OPTIONS.find(
                        (framework) => framework === location,
                      )
                    : "Địa điểm"}
                  {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Tìm địa điểm..." />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setLocation("");
                          setOpenLocation(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            location === "" ? "opacity-100" : "opacity-0",
                          )}
                        />
                        Tất cả địa điểm
                      </CommandItem>
                      {ADDRESS_OPTIONS.map((framework) => (
                        <CommandItem
                          key={framework}
                          value={framework}
                          onSelect={() => {
                            setLocation(
                              framework === location ? "" : framework,
                            );
                            setOpenLocation(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              location === framework
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {framework}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {location && location !== "all" ? (
              <X
                className="w-4 h-4 text-muted-foreground absolute right-4 cursor-pointer hover:text-foreground z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation("");
                }}
              />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 absolute right-4 pointer-events-none" />
            )}
          </div>

          <Button
            className="w-full md:w-auto px-8 py-6 rounded-lg text-lg font-medium transition-all"
            onClick={() => handleSearch()}
          >
            Tìm kiếm
          </Button>
        </motion.div>

        <div className="mt-8 flex gap-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
          <span>Phổ biến:</span>
          <span
            className="font-medium text-primary cursor-pointer hover:underline"
            onClick={() => {
              setKeyword("Marketing");
              handleSearch("Marketing");
            }}
          >
            Marketing
          </span>
          <span
            className="font-medium text-primary cursor-pointer hover:underline"
            onClick={() => {
              setKeyword("Developer");
              handleSearch("Developer");
            }}
          >
            Developer
          </span>
          <span
            className="font-medium text-primary cursor-pointer hover:underline"
            onClick={() => {
              setKeyword("Designer");
              handleSearch("Designer");
            }}
          >
            Designer
          </span>
        </div>
      </div>
    </div>
  );
}
