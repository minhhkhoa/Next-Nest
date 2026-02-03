"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
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
import { useGetAllSkills } from "@/queries/useSkill";
import { SkillResType } from "@/schemasvalidation/skill";
interface MultiSelectSkillsProps {
  selected: string[]; // Mảng các ID
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelectSkills({
  selected,
  onChange,
  placeholder = "Chọn kỹ năng...",
}: MultiSelectSkillsProps) {
  const [open, setOpen] = React.useState(false);

  const { data: skillsData } = useGetAllSkills();
  const skills = skillsData?.data || [];

  const handleUnselect = (id: string) => {
    onChange(selected.filter((s) => s !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="skills-listbox"
          className="flex min-h-10 w-full flex-wrap items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((id) => {
                const skill = skills?.find((s: SkillResType) => s._id === id);
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="hover:bg-secondary"
                  >
                    {skill?.name?.vi || id}
                    <button
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUnselect(id);
                      }}
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
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Tìm kiếm kỹ năng..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy kỹ năng nào.</CommandEmpty>
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
