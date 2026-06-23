"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMPLOYEE_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LEVEL_OPTIONS,
} from "@/lib/constant";
import { MultiSelectSkills } from "@/_pages/components/multi-select-skills";
import { useTranslations } from "next-intl";

export interface FindJobsAdvancedFilters {
  company: string;
  level: string;
  employeeType: string;
  experience: string;
  minSalary: string;
  maxSalary: string;
  currency: string;
  skillIDs: string[];
  isHot: boolean;
}

interface AdvancedFilterPanelProps {
  value: FindJobsAdvancedFilters;
  industryIDs: string[];
  onChange: (value: FindJobsAdvancedFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function AdvancedFilterPanel({
  value,
  industryIDs,
  onChange,
  onApply,
  onReset,
}: AdvancedFilterPanelProps) {
  const t = useTranslations("PageFindJobs");
  const tCommon = useTranslations("Common");

  const update = <K extends keyof FindJobsAdvancedFilters>(
    key: K,
    nextValue: FindJobsAdvancedFilters[K],
  ) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>{t("CompanyName")}</Label>
        <Input
          value={value.company}
          onChange={(e) => update("company", e.target.value)}
          placeholder={t("PlaceholderCompany")}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("Level")}</Label>
        <Select
          value={value.level || "all"}
          onValueChange={(next) => update("level", next === "all" ? "" : next)}
        >
          {/*- thêm className="w-full" để Select rộng bằng các input khác */}
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("AllLevels")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("AllLevels")}</SelectItem>
            {LEVEL_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {tCommon(`Level.${item.value}` as any)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("EmployeeType")}</Label>
        <Select
          value={value.employeeType || "all"}
          onValueChange={(next) =>
            update("employeeType", next === "all" ? "" : next)
          }
        >
          {/*- thêm className="w-full" để Select rộng bằng các input khác */}
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("AllTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("AllTypes")}</SelectItem>
            {EMPLOYEE_TYPE_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {tCommon(`EmployeeType.${item.value}` as any)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("Experience")}</Label>
        <Select
          value={value.experience || "all"}
          onValueChange={(next) =>
            update("experience", next === "all" ? "" : next)
          }
        >
          {/*- thêm className="w-full" để Select rộng bằng các input khác */}
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("AllExperiences")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("AllExperiences")}</SelectItem>
            {EXPERIENCE_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {tCommon(`Experience.${item.value}` as any)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("Skills")}</Label>
        <MultiSelectSkills
          selected={value.skillIDs}
          onChange={(next) => update("skillIDs", next)}
          industryIDs={industryIDs}
          placeholder={t("SelectSkills")}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("MinSalary")}</Label>
          <Input
            type="number"
            value={value.minSalary}
            onChange={(e) => update("minSalary", e.target.value)}
            placeholder={t("EgMinSalary")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("MaxSalary")}</Label>
          <Input
            type="number"
            value={value.maxSalary}
            onChange={(e) => update("maxSalary", e.target.value)}
            placeholder={t("EgMaxSalary")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("Currency")}</Label>
        <Select
          value={value.currency || "all"}
          onValueChange={(next) => update("currency", next === "all" ? "" : next)}
        >
          {/*- thêm className="w-full" để Select rộng bằng các input khác */}
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("All")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All")}</SelectItem>
            <SelectItem value="VND">VND</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
        <Label htmlFor="isHot">{t("ShowOnlyHot")}</Label>
        <Switch
          id="isHot"
          checked={value.isHot}
          onCheckedChange={(checked) => update("isHot", checked)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onReset}>
          {tCommon("Buttons.reset")}
        </Button>
        <Button onClick={onApply}>{tCommon("Buttons.apply")}</Button>
      </div>
    </div>
  );
}
