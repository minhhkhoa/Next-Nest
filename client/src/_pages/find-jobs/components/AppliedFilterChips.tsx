"use client";

import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface AppliedChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface AppliedFilterChipsProps {
  chips: AppliedChip[];
  onClearAll: () => void;
}

export default function AppliedFilterChips({
  chips,
  onClearAll,
}: AppliedFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Bộ lọc đang áp dụng</p>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={onClearAll}
        >
          Xóa tất cả
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Badge
            key={chip.key}
            variant="secondary"
            className="gap-1 rounded-full px-3 py-1 text-xs"
          >
            {chip.label}
            <button
              type="button"
              className="ml-1 rounded-full p-0.5 hover:bg-foreground/10"
              onClick={chip.onRemove}
              aria-label={`Xóa ${chip.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
