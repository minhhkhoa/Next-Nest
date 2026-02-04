"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { useGetSkillFilter } from "@/queries/useSkill";
import { SkillResType } from "@/schemasvalidation/skill";
import { useDebounce } from "use-debounce";

interface MultiSelectSkillsProps {
  selected: string[];
  onChange: (value: string[]) => void;
  industryIDs: string[];
  placeholder?: string;
}

export function MultiSelectSkills({
  selected,
  onChange,
  industryIDs,
  placeholder = "Chọn kỹ năng...",
}: MultiSelectSkillsProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  //- ID duy nhất để liên kết Combobox với Listbox (fix lỗi ARIA)
  const listboxId = React.useId();

  // Debounce text nhập vào để tránh spam API liên tục khi user gõ
  const [debouncedSearchSkill] = useDebounce(searchTerm, 500);

  // Gọi API lọc skill theo ngành nghề và tên
  const { data: skillsData, isLoading } = useGetSkillFilter({
    currentPage: 1,
    pageSize: 100,
    name: debouncedSearchSkill,
    industryIDs: industryIDs,
  });

  const skills = skillsData?.data?.result || [];

  const handleUnselect = (id: string) => {
    onChange(selected.filter((s) => s !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex min-h-10 w-full flex-wrap items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((id) => {
                // Lưu ý: Nếu skill đã chọn không nằm trong danh sách filter mới,
                // Badge vẫn nên hiển thị ID hoặc ta cần một cơ chế cache tên skill cũ.
                const skill = skills?.find((s: SkillResType) => s._id === id);
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="hover:bg-secondary"
                  >
                    {skill?.name?.vi || "Đang tải..."}
                    <button
                      className="ml-1 rounded-full outline-none ring-offset-background"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(id)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center">
            {isLoading && (
              <Loader2 className="h-3 w-3 animate-spin mr-2 opacity-50" />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          {/* shouldFilter={false} vì ta đã lọc từ API (Server side) */}
          <CommandInput
            placeholder="Tìm kiếm kỹ năng..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && skills.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <CommandEmpty>Không tìm thấy kỹ năng nào phù hợp.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {skills.map((skill: SkillResType) => (
                    <CommandItem
                      key={skill._id}
                      onSelect={() => {
                        onChange(
                          selected.includes(skill._id)
                            ? selected.filter((s) => s !== skill._id)
                            : [...selected, skill._id],
                        );
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selected.includes(skill._id)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className={cn("h-4 w-4")} color="white" />
                      </div>
                      <span>{skill.name.vi}</span>
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
