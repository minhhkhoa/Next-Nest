// components/SelectSearchIndustry.tsx (phiên bản tốt nhất)
"use client";

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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useGetIndustryFilter } from "@/queries/useIndustry";
import { useDebounce } from "use-debounce";
import { envConfig } from "../../../../../../config";

interface SelectSearchIndustryProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  currentIndustryId?: string;
}

export default function SelectSearchIndustry({
  value,
  onChange,
  placeholder = "Chọn danh mục cha",
  currentIndustryId,
}: SelectSearchIndustryProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const { data, isLoading } = useGetIndustryFilter({
    currentPage: 1,
    pageSize: 100,
    name: debouncedSearch,
  });

  const industries = data?.data?.result || [];

  //- ngành nghề được chọn khi edit
  const selectedLabel =
    value === envConfig.NEXT_PUBLIC_ROOT_PARENT_INDUSTRY_ID
      ? "Danh mục gốc"
      : industries.find((i) => i._id === value)?.name.vi || placeholder;

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm kiếm ngành nghề..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Đang tải...</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>Không tìm thấy</CommandEmpty>

                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onChange(envConfig.NEXT_PUBLIC_ROOT_PARENT_INDUSTRY_ID);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === envConfig.NEXT_PUBLIC_ROOT_PARENT_INDUSTRY_ID
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    Danh mục gốc
                  </CommandItem>

                  {industries
                    .filter((i) => i._id !== currentIndustryId)
                    .map((industry) => (
                      <CommandItem
                        key={industry._id}
                        onSelect={() => {
                          onChange(industry._id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === industry._id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {industry.name.vi}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
