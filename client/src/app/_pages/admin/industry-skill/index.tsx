"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateIndustry,
  useDeleteIndustry,
  useGetTreeIndustry,
} from "@/queries/useIndustry";
import TreeNode from "./components/tree-node-industry";
import { SearchBar } from "../NewsCategory/components/search-bar";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import SkillList from "./components/list-skill";
import { useGetSkillFilter } from "@/queries/useSkill";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { IndustryResType } from "@/schemasvalidation/industry";
import IndustryModalForm from "./components/modals/industry-modal-form";
import { DeleteConfirmModal } from "../NewsCategory/components/modals/delete-confirm-modal";
import { toast } from "sonner";

export default function PageIndustrySkill() {
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    type: "industry" | "skill" | null;
    id: string | null;
  }>({ isOpen: false, type: null, id: null });

  //- state industry
  const [searchIndustry, setSearchIndustry] = React.useState("");
  const [debouncedSearchIndustry] = useDebounce(searchIndustry, 500);
  const [industryModalState, setIndustryModalState] = React.useState<{
    isOpen: boolean;
    data?: IndustryResType;
  }>({ isOpen: false });
  const { data: dataIndustry, isLoading: treeLoading } = useGetTreeIndustry({
    name: debouncedSearchIndustry,
  });
  const industries = dataIndustry?.data;

  //- state skill
  const [searchSkill, setSearchSkill] = React.useState("");
  const [debouncedSearchSkill] = useDebounce(searchSkill, 500);
  const { data: dataSkills, isLoading: skillLoading } = useGetSkillFilter({
    currentPage: 1,
    pageSize: 100,
    name: debouncedSearchSkill,
    industryID: [],
  });

  const skills = dataSkills?.data?.result;

  const { mutateAsync: deleteIndustry, isPending: isDeleting } =
    useDeleteIndustry();

  const handleDeleteIndustry = async (id: string) => {
    try {
      const res = await deleteIndustry(id);
      if (res.isError) return;
      toast.success(res.message);
    } catch (error) {
      console.log("error handle Delete industry: ", error);
    } finally {
      setDeleteModal({ isOpen: false, type: null, id: null });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === "industry" && deleteModal.id) {
      handleDeleteIndustry(deleteModal.id);
    } else if (deleteModal.type === "skill" && deleteModal.id) {
      // handleDeleteCategory(deleteModal.id);
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Industries Section */}
      <div className="space-y-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Ngành nghề</CardTitle>
            <CardDescription>Quản lý toàn bộ ngành nghề</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-end pb-3">
              <Button onClick={() => setIndustryModalState({ isOpen: true })}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm ngành nghề
              </Button>
            </div>

            <div className="pb-4">
              <SearchBar value={searchIndustry} onChange={setSearchIndustry} />
            </div>

            <div className="px-6 pb-6">
              {" "}
              {treeLoading ? (
                /* Đang loading lần đầu hoặc đang search */
                <div className="flex flex-col items-center justify-center">
                  <Spinner className="w-8 h-8" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {debouncedSearchIndustry
                      ? "Đang tìm kiếm..."
                      : "Đang tải danh sách ngành nghề..."}
                  </p>
                </div>
              ) : industries && industries.length > 0 ? (
                /* Có dữ liệu → render tree */
                <div className="space-y-1">
                  {/* phải map qua từng con để vẽ tree */}
                  {industries.map((node) => (
                    <TreeNode
                      key={node._id}
                      node={node}
                      level={0}
                      onEdit={(item) =>
                        setIndustryModalState({ isOpen: true, data: item })
                      }
                      onDelete={(id) => {
                        setDeleteModal({ isOpen: true, type: "industry", id });
                      }}
                    />
                  ))}
                </div>
              ) : (
                /* Không có kết quả tìm kiếm */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-muted/50 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground font-medium">
                    Không tìm thấy ngành nghề nào
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Thử thay đổi từ khóa tìm kiếm
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Quản lý toàn bộ kỹ năng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-end pb-3">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm kỹ năng
              </Button>
            </div>
            <div className="pb-4">
              <SearchBar value={searchSkill} onChange={setSearchSkill} />
            </div>
            {skillLoading ? (
              /* Đang loading lần đầu hoặc đang search */
              <div className="flex flex-col items-center justify-center">
                <Spinner className="w-8 h-8" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {debouncedSearchSkill
                    ? "Đang tìm kiếm..."
                    : "Đang tải danh sách kỹ năng..."}
                </p>
              </div>
            ) : (
              <SkillList
                data={skills || []}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
          </CardContent>
        </Card>

        {industryModalState.isOpen && (
          <IndustryModalForm
            industry={industryModalState.data}
            onCancel={() => setIndustryModalState({ isOpen: false })}
          />
        )}

        {deleteModal.isOpen && (
          <DeleteConfirmModal
            isDeleting={isDeleting}
            title={
              deleteModal.type === "industry" ? "Xóa ngành nghề" : "Xóa kỹ năng"
            }
            onConfirm={handleConfirmDelete}
            onCancel={() =>
              setDeleteModal({ isOpen: false, type: null, id: null })
            }
          />
        )}
      </div>
    </div>
  );
}
