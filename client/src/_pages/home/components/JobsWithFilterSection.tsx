"use client";

import React, { useState } from "react";
import { useGetJobsFilterPublic } from "@/queries/useJob";
import JobCard from "./JobCard";
import DataTablePagination from "@/components/DataTablePagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useDebounce } from "use-debounce";
import ListJobSkeleton from "@/components/skeletons/list-job";
import { ADDRESS_OPTIONS, LEVEL_OPTIONS } from "@/lib/constant";
import { cn } from "@/lib/utils";

export default function JobsWithFilterSection() {
  const [page, setPage] = useState(1);
  const [openLocation, setOpenLocation] = useState(false);

  // Filter states
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("all");
  const [level, setLevel] = useState("all");

  const [keywordDebounce] = useDebounce(keyword, 500);

  const { data, isLoading } = useGetJobsFilterPublic({
    currentPage: page,
    pageSize: 8,
    title: keywordDebounce,
    address: location === "all" ? undefined : location,
    level: level === "all" ? undefined : level,
  });

  const jobs = data?.data?.result || [];
  const meta = data?.data?.meta || {
    current: 1,
    pageSize: 8,
    totalPages: 1,
    totalItems: 0,
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              Việc làm mới nhất
            </h2>
            <p className="text-muted-foreground">
              Cập nhật liên tục các cơ hội nghề nghiệp mới nhất
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative min-w-[200px] flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên..."
                className="pl-9 pr-8 bg-background"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
              />
              {keyword && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                  onClick={() => {
                    setKeyword("");
                    setPage(1);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="relative w-full md:w-auto">
              <Popover open={openLocation} onOpenChange={setOpenLocation}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLocation}
                    className="w-full md:w-[200px] justify-between bg-background font-normal"
                  >
                    {location === "all"
                      ? "Tất cả địa điểm"
                      : ADDRESS_OPTIONS.find(
                          (framework) => framework === location,
                        )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm địa điểm..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setLocation("all");
                            setPage(1);
                            setOpenLocation(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              location === "all" ? "opacity-100" : "opacity-0",
                            )}
                          />
                          Tất cả địa điểm
                        </CommandItem>
                        {ADDRESS_OPTIONS.map((framework) => (
                          <CommandItem
                            key={framework}
                            value={framework}
                            onSelect={(currentValue) => {
                              setLocation(
                                currentValue === location
                                  ? "all"
                                  : currentValue,
                              );
                              setPage(1);
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
              {location !== "all" && (
                <div
                  className="absolute right-8 top-1/2 -translate-y-1/2 z-10 cursor-pointer p-1 rounded-full hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation("all");
                    setPage(1);
                  }}
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="relative w-full md:w-auto">
              <Select
                value={level}
                onValueChange={(val) => {
                  setLevel(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px] bg-background">
                  <SelectValue placeholder="Cấp bậc" />
                </SelectTrigger>
                <SelectContent className="w-[200px]">
                  <SelectItem value="all">Tất cả cấp bậc</SelectItem>
                  {LEVEL_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {level !== "all" && (
                <div
                  className="absolute right-8 top-1/2 -translate-y-1/2 z-10 cursor-pointer p-1 rounded-full hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLevel("all");
                    setPage(1);
                  }}
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <ListJobSkeleton />
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {jobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <DataTablePagination
                meta={meta}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-background rounded-lg border border-dashed">
            Không tìm thấy công việc phù hợp.
          </div>
        )}
      </div>
    </section>
  );
}
