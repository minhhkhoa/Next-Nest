import { Button } from "@/components/ui/button";
import React from "react";
import { SearchBar } from "../../NewsCategory/components/search-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

//- trạng thái
const statusFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Dừng hoạt động", value: "inactive" },
];

//- kích hoạt
const isActiveFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Được phép", value: "true" },
  { label: "Chờ duyệt", value: "false" },
];

//- lọc hot
const isHotFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Hot", value: "true" },
  { label: "Không hot", value: "false" },
];

type FiltersJobType = {
  title: string;
  fieldCompany: string;
  nameCreatedBy: string;
  status: string;
  isActive: string;
  isHot: string;
};

type BlockFiltersJobProps = {
  filtersJob: FiltersJobType;
  setFiltersJob: React.Dispatch<React.SetStateAction<FiltersJobType>>;
  handleChooseFilter: (type: string, value: string) => void;
};

export default function BlockFiltersJob({
  filtersJob,
  setFiltersJob,
  handleChooseFilter,
}: BlockFiltersJobProps) {
  return (
    <div className="mb-6 space-y-4 select-none">
      {/* Search section */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={filtersJob.title}
            onChange={(value) =>
              setFiltersJob((prev) => ({ ...prev, title: value }))
            }
            placeholder="Tìm theo tên công việc"
          />
        </div>

        <div className="flex-1">
          <SearchBar
            value={filtersJob.fieldCompany}
            onChange={(value) =>
              setFiltersJob((prev) => ({ ...prev, fieldCompany: value }))
            }
            placeholder="Tìm theo tên công ty, mst"
          />
        </div>

        <div className="flex-1">
          <SearchBar
            value={filtersJob.nameCreatedBy}
            onChange={(value) =>
              setFiltersJob((prev) => ({ ...prev, nameCreatedBy: value }))
            }
            placeholder="Tìm theo tên người tạo công việc"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:gap-10 gap-3">
        {/* Filter section active */}
        <FilterSelect
          label="Lọc theo trạng thái:"
          value={filtersJob.status}
          options={statusFilters}
          onChange={(value) => handleChooseFilter("status", value)}
        />

        {/* Filter section isActive */}
        <FilterSelect
          label="Lọc theo kích hoạt:"
          value={filtersJob.isActive}
          options={isActiveFilters}
          onChange={(value) => handleChooseFilter("isActive", value)}
        />

        {/* Filter section isHot */}
        <FilterSelect
          label="Lọc theo hot:"
          value={filtersJob.isHot}
          options={isHotFilters}
          onChange={(value) => handleChooseFilter("isHot", value)}
        />
      </div>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string | null;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>

      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tất cả" />
        </SelectTrigger>

        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
