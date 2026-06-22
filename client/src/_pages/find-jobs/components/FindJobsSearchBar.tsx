"use client";

import React, { useState } from "react";
import { Search, MapPin, Briefcase, Check, ChevronsUpDown, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ADDRESS_OPTIONS } from "@/lib/constant";
import IndustrySelector from "@/_pages/home/components/IndustrySelector";
import { useTranslations } from "next-intl";

interface IndustryNode {
  _id: string;
  name: {
    vi: string;
    en: string;
  };
  children?: IndustryNode[];
}

interface FindJobsSearchBarProps {
  keyword: string;
  location: string;
  industryId: string;
  industries: IndustryNode[];
  isLoadingIndustry?: boolean;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onSearch: () => void;
}

export default function FindJobsSearchBar({
  keyword,
  location,
  industryId,
  industries,
  isLoadingIndustry,
  onKeywordChange,
  onLocationChange,
  onIndustryChange,
  onSearch,
}: FindJobsSearchBarProps) {
  const [openLocation, setOpenLocation] = useState(false);
  const t = useTranslations("PageFindJobs");

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex w-full items-center md:flex-1 md:border-r md:pr-3">
          <Search className="mr-2 h-5 w-5 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder={t("SearchByPosition")}
            className="border-none px-2 pr-8 shadow-none focus-visible:ring-0"
          />
          {keyword && (
            <X
              className="absolute right-1 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onKeywordChange("")}
            />
          )}
        </div>

        <div className="relative hidden w-full items-center md:flex md:flex-1 md:border-r md:px-3">
          <Briefcase className="mr-2 h-5 w-5 text-muted-foreground" />
          <IndustrySelector
            industries={industries}
            value={industryId}
            onSelect={onIndustryChange}
            placeholder={t("Industry")}
            isLoading={isLoadingIndustry}
          />
          {industryId && (
            <X
              className="absolute right-2 z-10 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onIndustryChange("");
              }}
            />
          )}
        </div>

        <div className="relative flex w-full items-center md:flex-1">
          <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
          <Popover open={openLocation} onOpenChange={setOpenLocation}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={openLocation}
                className={cn(
                  "w-full justify-between px-2 pr-8 text-base font-normal hover:bg-transparent",
                  !location && "text-muted-foreground",
                )}
              >
                {location || t("Location")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder={t("SearchLocation")} />
                <CommandList>
                  <CommandEmpty>{t("NoData")}</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        onLocationChange("");
                        setOpenLocation(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          location === "" ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {t("AllLocations")}
                    </CommandItem>
                    {ADDRESS_OPTIONS.map((item) => (
                      <CommandItem
                        key={item}
                        value={item}
                        onSelect={() => {
                          onLocationChange(item === location ? "" : item);
                          setOpenLocation(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            location === item ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {item}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {location ? (
            <X
              className="absolute right-1 z-10 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onLocationChange("");
              }}
            />
          ) : (
            <ChevronsUpDown className="pointer-events-none absolute right-1 h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <Button className="w-full md:w-auto" onClick={onSearch}>
          {t("SearchBtn")}
        </Button>
      </div>
    </div>
  );
}
