"use client";

import { useDeleteUser, useGetAllUserByFilter } from "@/queries/useUser";
import React from "react";
import TableUser from "./TableUser";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { apiUserResType } from "@/schemasvalidation/user";
import { getUserColumns } from "./UserColumns";
import { DeleteConfirmModal } from "../NewsCategory/components/modals/delete-confirm-modal";
import { useGetAllRole } from "@/queries/role";
import { UserDialogForm } from "./components/user-modal-form";

export default function UserPageManagement() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchName, setSearchName] = React.useState("");
  const [searchEmail, setSearchEmail] = React.useState("");
  const [searchAddress, setSearchAddress] = React.useState("");

  const [userModalState, setUserModalState] = React.useState<{
    isOpen: boolean;
    data?: apiUserResType;
  }>({ isOpen: false });

  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });

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

  const { data: listRoles, isLoading: isLoadingRoles } = useGetAllRole();

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

  const { mutateAsync: deleteUserMutation, isPending: isDeleteRole } =
    useDeleteUser();

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteUserMutation(deleteModal.id);

      if (res.isError) return;

      SoftSuccessSonner(res.message);
      setDeleteModal({ isOpen: false, id: "" });
    } catch (error) {
      console.log("error delete permission: ", error);
    }
  };

  const handleOpenEditModal = (user: apiUserResType) => {
    setUserModalState({ isOpen: true, data: user });
  };

  const handleOpenDeleteModal = (user: apiUserResType) => {
    setDeleteModal({ isOpen: true, id: user.user._id });
  };

  const columns = getUserColumns(handleOpenEditModal, handleOpenDeleteModal);

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
          columns={columns}
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

      {userModalState.isOpen && (
        <UserDialogForm
          onClose={() => setUserModalState({ isOpen: false })}
          data={userModalState.data!}
          listRoles={listRoles?.data ?? []}
        />
      )}

      {/* modal confirm delete */}
      {deleteModal.isOpen && (
        <DeleteConfirmModal
          title="Xóa vai trò"
          isDeleting={isDeleteRole}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, id: "" })}
        />
      )}
    </div>
  );
}
