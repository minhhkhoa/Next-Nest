"use client";

import React, { useState, useMemo } from "react";
import { ChevronRight, Check, ChevronLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Industry {
  _id: string;
  name: {
    vi: string;
    en: string;
  };
  children?: Industry[];
  parentId?: string;
}

interface IndustrySelectorProps {
  industries: Industry[];
  value?: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  className?: string;
}

const ITEMS_PER_PAGE = 5;

const PaginatedIndustryList = ({
  items,
  selectedValue,
  onSelect,
}: {
  items: Industry[];
  selectedValue?: string;
  onSelect: (id: string) => void;
  parentId?: string;
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  return (
    <>
      <div className="space-y-1">
        {currentItems.map((industry) => (
          <IndustryItem
            key={industry._id}
            industry={industry}
            selectedValue={selectedValue}
            onSelect={onSelect}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2 border-t border-border mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handlePrev}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
};

const IndustryItem = ({
  industry,
  selectedValue,
  onSelect,
}: {
  industry: Industry;
  selectedValue?: string;
  onSelect: (id: string) => void;
}) => {
  const hasChildren = industry.children && industry.children.length > 0;
  const isSelected = selectedValue === industry._id;

  if (hasChildren) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          className={cn(
            "flex items-center w-full cursor-pointer py-2.5",
            isSelected && "bg-accent",
          )}
        >
          <span className="truncate mr-2 font-medium">
            {industry.name.vi || industry.name.en}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent
            className="w-[280px] z-50 p-1"
            sideOffset={12}
            alignOffset={-5}
          >
            <DropdownMenuItem
              className={cn(
                "cursor-pointer font-semibold text-primary mb-1 pl-4",
                isSelected && "bg-accent",
              )}
              onClick={() => onSelect(industry._id)}
            >
              <span className="truncate">
                Tất cả {industry.name.vi || industry.name.en}
              </span>
              {isSelected && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-border/50" />

            <PaginatedIndustryList
              items={industry.children!}
              selectedValue={selectedValue}
              onSelect={onSelect}
            />
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem
      className={cn("cursor-pointer", isSelected && "bg-accent")}
      onClick={() => onSelect(industry._id)}
    >
      <span className="truncate">{industry.name.vi || industry.name.en}</span>
      {isSelected && <Check className="ml-auto h-4 w-4" />}
    </DropdownMenuItem>
  );
};

export default function IndustrySelector({
  industries,
  value,
  onSelect,
  placeholder = "Ngành nghề",
  className,
}: IndustrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const findIndustryName = (
    items: Industry[],
    id: string,
  ): string | undefined => {
    for (const item of items) {
      if (item._id === id) return item.name.vi || item.name.en;
      if (item.children) {
        const found = findIndustryName(item.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedName = value ? findIndustryName(industries, value) : undefined;

  // Flatten for search
  const allIndustries = useMemo(() => {
    const flat: Industry[] = [];
    const traverse = (items: Industry[]) => {
      for (const item of items) {
        flat.push(item);
        if (item.children) traverse(item.children);
      }
    };
    traverse(industries);
    return flat;
  }, [industries]);

  const filteredIndustries = useMemo(() => {
    if (!searchTerm) return [];

    // Normalize string for better matching (remove accents, lowercase)
    const normalize = (str: string) => {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    };

    const searchLower = normalize(searchTerm);

    return allIndustries.filter((item) => {
      const nameVi = normalize(item.name.vi || "");
      const nameEn = normalize(item.name.en || "");
      return nameVi.includes(searchLower) || nameEn.includes(searchLower);
    });
  }, [allIndustries, searchTerm]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setSearchTerm("");
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between hover:bg-transparent px-2 text-base font-normal border-none shadow-none focus-visible:ring-0 pr-8",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate block text-left">
            {selectedName || placeholder}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[300px] z-50 p-0"
        sideOffset={8}
      >
        <div className="p-2 border-b border-border sticky top-0 bg-popover z-10">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm ngành nghề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8 h-9 text-base md:text-sm"
              onKeyDown={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <X
                className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>
        </div>

        <div className="p-1">
          {!searchTerm ? (
            <PaginatedIndustryList
              items={industries}
              selectedValue={value}
              onSelect={(id) => {
                onSelect(id);
                setOpen(false);
              }}
            />
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {filteredIndustries.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy kết quả
                </div>
              ) : (
                filteredIndustries.map((industry) => (
                  <DropdownMenuItem
                    key={industry._id}
                    className={cn(
                      "cursor-pointer",
                      value === industry._id && "bg-accent",
                    )}
                    onClick={() => {
                      onSelect(industry._id);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">
                      {industry.name.vi || industry.name.en}
                    </span>
                    {value === industry._id && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
