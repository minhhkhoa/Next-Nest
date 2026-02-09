"use client";

import {
  useDeleteUser,
  useGetAllUserByFilter,
  useGetMembersByCompanyId,
  useRestoreUser,
} from "@/queries/useUser";
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
import { useGetAllRole } from "@/queries/useRole";
import { UserDialogForm } from "./components/user-modal-form";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";

interface CompanyMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function UserPageManagement() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchName, setSearchName] = React.useState("");
  const [searchEmail, setSearchEmail] = React.useState("");
  const [searchAddress, setSearchAddress] = React.useState("");
  const [selectedNewOwner, setSelectedNewOwner] = React.useState<
    string | undefined
  >();

  const [userModalState, setUserModalState] = React.useState<{
    isOpen: boolean;
    data?: apiUserResType;
  }>({ isOpen: false });

  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    id: string;
    isOwner?: boolean;
    companyId?: string;
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

  //- khôi phục
  const { mutateAsync: restoreMutation, isPending: isRestoring } =
    useRestoreUser();

  const { data: companyMembers } = useGetMembersByCompanyId(
    deleteModal.isOwner ? deleteModal.companyId : undefined,
  );

  // 2. Lọc bỏ người bị xóa khỏi danh sách gợi ý
  const potentialSuccessors = React.useMemo(() => {
    return (
      companyMembers?.data?.filter(
        (m: CompanyMember) => m._id !== deleteModal.id,
      ) ?? []
    );
  }, [companyMembers, deleteModal.id]);

  const { data: listRoles } = useGetAllRole();

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
    //- check nếu là owner thì phải chọn người tiếp quản
    if (
      deleteModal.isOwner &&
      potentialSuccessors.length > 0 &&
      !selectedNewOwner
    ) {
      SoftDestructiveSonner(
        "Vui lòng chọn người tiếp quản quyền sở hữu công ty",
      );
      return;
    }

    try {
      const res = await deleteUserMutation({
        id: deleteModal.id,
        newOwnerID: selectedNewOwner || undefined,
      });

      if (res.isError) return;

      SoftSuccessSonner(res.message);
      setDeleteModal({ isOpen: false, id: "" });
      setSelectedNewOwner("");
    } catch (error) {
      console.log("error delete: ", error);
    }
  };

  const handleOpenEditModal = (user: apiUserResType) => {
    setUserModalState({ isOpen: true, data: user });
  };

  const handleOpenDeleteModal = (user: apiUserResType) => {
    setDeleteModal({
      isOpen: true,
      id: user.user._id,
      isOwner: user.user.employerInfo?.isOwner,
      companyId: user.user.employerInfo?.companyID?.toString(),
    });
  };

  const handleRestoreUser = async (id: string) => {
    console.log("id restore: ", id);
    try {
      const res = await restoreMutation(id);

      if (res.isError) return;

      SoftSuccessSonner("Khôi phục tài khoản thành công");
    } catch (error) {
      console.log("error restore: ", error);
    }
  };

  const columns = getUserColumns(
    handleOpenEditModal,
    handleOpenDeleteModal,
    handleRestoreUser,
  );

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
          title="Khóa tài khoản người dùng"
          isDeleting={isDeleteRole}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteModal({ isOpen: false, id: "" });
            setSelectedNewOwner("");
          }}
        >
          {/* Phần logic hiển thị thêm nếu là Owner */}
          {deleteModal.isOwner && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-destructive">
                Người dùng này là Chủ sở hữu. Bạn cần chuyển quyền cho nhân viên
                khác:
              </p>

              {potentialSuccessors.length > 0 ? (
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={selectedNewOwner}
                  onChange={(e) => setSelectedNewOwner(e.target.value)}
                >
                  <option value="">-- Chọn người nhận quyền quản trị --</option>
                  {potentialSuccessors.map((m: CompanyMember) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  (Không có thành viên nào khác trong công ty. Công ty sẽ bị
                  đóng cửa.)
                </p>
              )}

              {potentialSuccessors.length > 0 && !selectedNewOwner && (
                <p className="text-[12px] text-red-500 animate-pulse">
                  * Bắt buộc chọn người thay thế để tiếp tục
                </p>
              )}
            </div>
          )}
        </DeleteConfirmModal>
      )}
    </div>
  );
}
