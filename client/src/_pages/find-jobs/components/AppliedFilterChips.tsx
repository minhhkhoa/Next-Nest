"use client";

import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("PageFindJobs");

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">{t("AppliedFilters")}</p>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={onClearAll}
        >
          {t("ClearAll")}
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
              aria-label={t("DeleteFilter", { label: chip.label })}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
