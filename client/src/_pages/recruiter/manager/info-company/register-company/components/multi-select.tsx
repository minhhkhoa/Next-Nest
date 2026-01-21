"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((v) => v !== value));
  };

  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  return (
    <div className="relative" ref={containerRef}>
      {/* Input Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-input bg-background rounded-md text-sm text-left hover:bg-accent/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label) => {
              const value = selected[selectedLabels.indexOf(label) || 0];
              return (
                <span
                  key={value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded text-xs"
                >
                  {label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(value);
                    }}
                    className="hover:text-accent/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-muted-foreground">Chọn ngành nghề</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 border border-input bg-background rounded-md shadow-lg z-50">
          <div className="max-h-56 overflow-y-auto p-2 space-y-1">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent/5 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => handleSelect(option.value)}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
