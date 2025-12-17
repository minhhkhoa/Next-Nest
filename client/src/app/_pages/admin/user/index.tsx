"use client";

import { useGetAllUserByFilter } from "@/queries/useUser";
import React from "react";
import TableUser from "./TableUser";
import { UserColumns } from "./UserColumns";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function UserPageManagement() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchName, setSearchName] = React.useState("");
  const [searchEmail, setSearchEmail] = React.useState("");
  const [searchAddress, setSearchAddress] = React.useState("");

  const [debouncedSearchName] = useDebounce(searchName, 500);
  const [debouncedSearchEmail] = useDebounce(searchEmail, 500);
  const [debouncedSearchAddress] = useDebounce(searchAddress, 500);

  const { data: listUser, isLoading: isLoadingUser } = useGetAllUserByFilter({
    currentPage,
    pageSize: 5,
    name: debouncedSearchName,
    email: debouncedSearchEmail,
    address: debouncedSearchAddress,
  });

  const changeTypeSearch = (type: string, value: string) => {
    switch (type) {
      case "name":
        setSearchName(value);
        break;
      case "email":
        setSearchEmail(value);
        break;
      case "address":
        setSearchAddress(value);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-balance">
            Quản Lý Người Dùng
          </h1>
        </div>
        <p className="text-muted-foreground">
          Tổng cộng {listUser?.data?.meta.totalItems} người dùng
        </p>
      </div>

      <div className="flex mb-3 flex-row-reverse">
        <Button onClick={() => {}} className="w-full sm:w-auto flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <Card className="mb-6 border border-border !p-0">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Tìm theo tên
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nhập tên..."
                  value={searchName}
                  onChange={(e) => changeTypeSearch("name", e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Tìm theo email
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nhập email..."
                  value={searchEmail}
                  onChange={(e) => changeTypeSearch("email", e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Tìm theo địa chỉ
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nhập địa chỉ..."
                  value={searchAddress}
                  onChange={(e) => changeTypeSearch("address", e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {!isLoadingUser ? (
        <TableUser
          data={listUser?.data?.result ?? []}
          columns={UserColumns}
          meta={
            listUser?.data?.meta ?? {
              current: 0,
              pageSize: 0,
              totalPages: 0,
              totalItems: 0,
            }
          }
          setCurrentPage={setCurrentPage}
        />
      ) : (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
