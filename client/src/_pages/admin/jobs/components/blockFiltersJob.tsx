import { Button } from '@/components/ui/button';
import React from 'react'
import { SearchBar } from '../../NewsCategory/components/search-bar';

//- trạng thái
const statusFilters = [
  { label: "Tất cả", value: "" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Dừng hoạt động", value: "inactive" },
];

//- kích hoạt
const isActiveFilters = [
  { label: "Tất cả", value: "" },
  { label: "Được phép", value: "true" },
  { label: "Chờ duyệt", value: "false" },
];

//- lọc hot
const isHotFilters = [
  { label: "Tất cả", value: "" },
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

      {/* Filter section active */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Lọc theo trạng thái:
        </span>

        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((item) => (
            <Button
              key={item.value}
              variant={filtersJob.status === item.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleChooseFilter("status", item.value)}
              className="rounded-full px-4"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter section isActive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Lọc theo kích hoạt:
        </span>

        <div className="flex gap-2 flex-wrap">
          {isActiveFilters.map((item) => (
            <Button
              key={item.value}
              variant={
                filtersJob.isActive === item.value ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleChooseFilter("isActive", item.value)}
              className="rounded-full px-4"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter section isHot */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Lọc theo hot:
        </span>

        <div className="flex gap-2 flex-wrap">
          {isHotFilters.map((item) => (
            <Button
              key={item.value}
              variant={filtersJob.isHot === item.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleChooseFilter("isHot", item.value)}
              className="rounded-full px-4"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
