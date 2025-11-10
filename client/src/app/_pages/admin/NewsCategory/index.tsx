"use client";

import { useState, useMemo } from "react";
import { NewsLayout } from "./components/news-layout";
import { CategoriesSidebar } from "./components/categories-sidebar";
import { NewsTable } from "./components/news-table";
import { NewsModal } from "./components/modals/news-modal";
import { CategoryModal } from "./components/modals/category-modal";
import { DeleteConfirmModal } from "./components/modals/delete-confirm-modal";
import { SearchBar } from "./components/search-bar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  CategoryNewsResType,
  NewsResFilterType,
  NewsResType,
} from "@/schemasvalidation/NewsCategory";
import {
  useGetListCategories,
  useGetListNews,
  useGetListNewsFilter,
} from "@/queries/useNewsCategory";
import { envConfig } from "../../../../../config";
import { useDebounce } from "use-debounce";

const pageSize = Number(envConfig.NEXT_PUBLIC_PAGE_SIZE);

export default function NewsCate() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    ""
  );
  const [newsModalState, setNewsModalState] = useState<{
    isOpen: boolean;
    data?: NewsResFilterType;
  }>({ isOpen: false });
  const [categoryModalState, setCategoryModalState] = useState<{
    isOpen: boolean;
    data?: CategoryNewsResType;
  }>({
    isOpen: false,
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "news" | "category" | null;
    id: string | null;
  }>({ isOpen: false, type: null, id: null });
  const [currentPage, setCurrentPage] = useState(1);

  //- Debounce 500ms sau khi người dùng dừng gõ
  const [debouncedSearch] = useDebounce(searchQuery, 500); //- vlaue, time

  const { data: categories } = useGetListCategories();
  const { data: news } = useGetListNewsFilter({
    currentPage,
    pageSize: pageSize,
    title: debouncedSearch,
    cateNewsID: selectedCategory,
    status: statusFilter,
  });

  const handleDeleteNews = (id: string) => {
    // setNews(
    //   news.map((item) => (item._id === id ? { ...item, isDelete: true } : item))
    // );
  };

  const handleDeleteCategory = (id: string) => {
    // setCategories(
    //   categories.map((item) =>
    //     item._id === id ? { ...item, isDelete: true } : item
    //   )
    // );
    if (selectedCategory === id) {
      setSelectedCategory(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === "news" && deleteModal.id) {
      handleDeleteNews(deleteModal.id);
    } else if (deleteModal.type === "category" && deleteModal.id) {
      handleDeleteCategory(deleteModal.id);
    }
    setDeleteModal({ isOpen: false, type: null, id: null });
  };

  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: "" | "active" | "inactive") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <NewsLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="flex-1">
          <CategoriesSidebar
            categories={categories?.data || []}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onEditCategory={(category) =>
              setCategoryModalState({ isOpen: true, data: category })
            }
            onDeleteCategory={(id) => {
              setDeleteModal({ isOpen: true, type: "category", id });
            }}
            onShowAddCategory={() => setCategoryModalState({ isOpen: true })}
          />
        </aside>

        {/* Main content */}
        <main className="flex-3">
          <div className="space-y-6">
            {/* Header with search and add button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Quản Lý Tin Tức
                </h1>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory
                    ? `Đang xem: ${
                        categories?.data?.find(
                          (c) => c._id === selectedCategory
                        )?.name.vi || "Danh mục"
                      } (${news?.data?.result.length || 0})`
                    : `Tổng: ${news?.data?.result.length} bài viết`}
                </p>
              </div>
              <Button
                onClick={() => setNewsModalState({ isOpen: true })}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Tin Tức
              </Button>
            </div>

            {/* Search and filters */}
            <div className="space-y-4">
              <SearchBar value={searchQuery} onChange={handleSearchChange} />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFilter === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilterChange("")}
                >
                  Tất Cả
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilterChange("active")}
                >
                  Hoạt Động
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilterChange("inactive")}
                >
                  Dừng Hoạt Động
                </Button>
              </div>
            </div>

            {/* News table */}
            <NewsTable
              news={news?.data?.result || []}
              categories={categories?.data || []}
              onEdit={(item) => setNewsModalState({ isOpen: true, data: item })}
              onDelete={(id) => {
                setDeleteModal({ isOpen: true, type: "news", id });
              }}
              metaFilter={news?.data?.meta}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      {/* {newsModalState.isOpen && (
        <NewsModal
          news={newsModalState.data}
          categories={categories.filter((c) => !c.isDelete)}
          onClose={() => setNewsModalState({ isOpen: false })}
        />
      )} */}

      {categoryModalState.isOpen && (
        <CategoryModal
          category={categoryModalState.data}
          onClose={() => setCategoryModalState({ isOpen: false })}
        />
      )}

      {deleteModal.isOpen && (
        <DeleteConfirmModal
          title={
            deleteModal.type === "news" ? "Xóa tin tức" : "Xóa danh mục tin tức"
          }
          onConfirm={handleConfirmDelete}
          onCancel={() =>
            setDeleteModal({ isOpen: false, type: null, id: null })
          }
        />
      )}
    </NewsLayout>
  );
}
