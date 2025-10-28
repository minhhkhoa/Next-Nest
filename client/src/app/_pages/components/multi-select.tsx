"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiLang {
  vi: string;
  en: string;
}

interface Option {
  label: MultiLang;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Chọn...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (option) =>
      option.label.vi.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selected.some((s) => s.value === option.value)
  );


  const handleSelect = (option: Option) => {
    onChange([...selected, option]);
    setSearchTerm("");
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item.value !== value));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className="border border-input rounded-md bg-background p-2 min-h-10 flex flex-wrap gap-2 items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length > 0 ? (
          selected.map((item) => {
            return (
              <span
                key={item.value}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary text-primary-foreground text-sm"
              >
                {item.label.vi}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.value);
                  }}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        ) : (
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        )}
        <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-input rounded-md bg-background shadow-lg z-50">
          <Input
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 border-b rounded-none"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                >
                  {option.label.vi}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Không có tùy chọn
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
