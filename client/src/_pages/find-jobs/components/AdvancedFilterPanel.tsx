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
  const update = <K extends keyof FindJobsAdvancedFilters>(
    key: K,
    nextValue: FindJobsAdvancedFilters[K],
  ) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Tên công ty</Label>
        <Input
          value={value.company}
          onChange={(e) => update("company", e.target.value)}
          placeholder="Nhập tên công ty hoặc mã số thuế"
        />
      </div>

      <div className="space-y-2">
        <Label>Cấp bậc</Label>
        <Select
          value={value.level || "all"}
          onValueChange={(next) => update("level", next === "all" ? "" : next)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả cấp bậc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cấp bậc</SelectItem>
            {LEVEL_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Loại hình làm việc</Label>
        <Select
          value={value.employeeType || "all"}
          onValueChange={(next) =>
            update("employeeType", next === "all" ? "" : next)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả loại hình" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại hình</SelectItem>
            {EMPLOYEE_TYPE_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kinh nghiệm</Label>
        <Select
          value={value.experience || "all"}
          onValueChange={(next) =>
            update("experience", next === "all" ? "" : next)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả mức kinh nghiệm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả mức kinh nghiệm</SelectItem>
            {EXPERIENCE_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kỹ năng</Label>
        <MultiSelectSkills
          selected={value.skillIDs}
          onChange={(next) => update("skillIDs", next)}
          industryIDs={industryIDs}
          placeholder="Chọn kỹ năng"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Mức lương từ</Label>
          <Input
            type="number"
            value={value.minSalary}
            onChange={(e) => update("minSalary", e.target.value)}
            placeholder="VD: 10000000"
          />
        </div>
        <div className="space-y-2">
          <Label>Mức lương đến</Label>
          <Input
            type="number"
            value={value.maxSalary}
            onChange={(e) => update("maxSalary", e.target.value)}
            placeholder="VD: 30000000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Đơn vị tiền tệ</Label>
        <Select
          value={value.currency || "all"}
          onValueChange={(next) => update("currency", next === "all" ? "" : next)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="VND">VND</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
        <Label htmlFor="isHot">Chỉ hiển thị việc làm Hot</Label>
        <Switch
          id="isHot"
          checked={value.isHot}
          onCheckedChange={(checked) => update("isHot", checked)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onReset}>
          Đặt lại
        </Button>
        <Button onClick={onApply}>Áp dụng</Button>
      </div>
    </div>
  );
}
