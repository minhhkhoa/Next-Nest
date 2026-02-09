import { SearchBar } from "../../NewsCategory/components/search-bar";
import React from "react";

type SearchValue = {
  name: string;
  email: string;
  address: string;
  companyName: string;
};

type Props = {
  searchValue: SearchValue;
  setSearchValue: React.Dispatch<React.SetStateAction<SearchValue>>;
};

const FILTERS = [
  {
    key: "name",
    label: "Tìm theo tên",
    placeholder: "Nhập tên...",
  },
  {
    key: "email",
    label: "Tìm theo email",
    placeholder: "Nhập email...",
  },
  {
    key: "address",
    label: "Tìm theo địa chỉ",
    placeholder: "Nhập địa chỉ...",
  },
  {
    key: "companyName",
    label: "Tìm theo công ty",
    placeholder: "Nhập công ty...",
  },
] as const;

export function UserSearchFilters({ searchValue, setSearchValue }: Props) {
  return (
    <div
      className="
        grid gap-4
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        rounded-lg
      "
    >
      {FILTERS.map((filter) => (
        <div key={filter.key} className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            {filter.label}
          </label>

          <SearchBar
            value={searchValue[filter.key] || ""}
            onChange={(value) =>
              setSearchValue({
                ...searchValue,
                [filter.key]: value,
              })
            }
            placeholder={filter.placeholder}
          />
        </div>
      ))}
    </div>
  );
}
