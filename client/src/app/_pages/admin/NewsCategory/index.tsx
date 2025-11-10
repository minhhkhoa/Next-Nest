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
import { CategoryNewsResType } from "@/schemasvalidation/NewsCategory";
import { useGetListCategories } from "@/queries/useNewsCategory";

interface News {
  _id: string;
  title: string;
  cateNewsID: string;
  description: string;
  image: string;
  summary: string;
  status: "active" | "inactive";
  isDelete: boolean;
}

export default function NewsCate() {
  const { data: categories } = useGetListCategories();

  const [news, setNews] = useState<News[]>([
    {
      _id: "1",
      title: "AI Đã Thay Đổi Thế Giới Công Nghệ",
      cateNewsID: "1",
      description:
        "Trí tuệ nhân tạo đang trở thành một phần không thể tách rời của cuộc sống hàng ngày.",
      image: "/ai-technology.png",
      summary: "AI đang cách mạng hóa ngành công nghệ toàn cầu",
      status: "active",
      isDelete: false,
    },
    {
      _id: "2",
      title: "Thị Trường Chứng Khoán Đạt Đỉnh Mới",
      cateNewsID: "3",
      description: "Chứng chỉ lợi suất cao nhất trong 5 năm qua",
      image: "/stock-market-analysis.png",
      summary: "Thị trường chứng khoán tăng mạnh trong quý này",
      status: "active",
      isDelete: false,
    },
    {
      _id: "3",
      title: "AI Đã Thay Đổi Thế Giới Công Nghệ",
      cateNewsID: "1",
      description:
        "Trí tuệ nhân tạo đang trở thành một phần không thể tách rời của cuộc sống hàng ngày.",
      image: "/ai-technology.png",
      summary: "AI đang cách mạng hóa ngành công nghệ toàn cầu",
      status: "active",
      isDelete: false,
    },
    {
      _id: "4",
      title: "Thị Trường Chứng Khoán Đạt Đỉnh Mới",
      cateNewsID: "2",
      description: "Chứng chỉ lợi suất cao nhất trong 5 năm qua",
      image: "/stock-market-analysis.png",
      summary: "Thị trường chứng khoán tăng mạnh trong quý này",
      status: "active",
      isDelete: false,
    },
    {
      _id: "5",
      title: "AI Đã Thay Đổi Thế Giới Công Nghệ",
      cateNewsID: "2",
      description:
        "Trí tuệ nhân tạo đang trở thành một phần không thể tách rời của cuộc sống hàng ngày.",
      image: "/ai-technology.png",
      summary: "AI đang cách mạng hóa ngành công nghệ toàn cầu",
      status: "active",
      isDelete: false,
    },
    {
      _id: "6",
      title: "Thị Trường Chứng Khoán Đạt Đỉnh Mới",
      cateNewsID: "3",
      description: "Chứng chỉ lợi suất cao nhất trong 5 năm qua",
      image: "/stock-market-analysis.png",
      summary: "Thị trường chứng khoán tăng mạnh trong quý này",
      status: "active",
      isDelete: false,
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [newsModalState, setNewsModalState] = useState<{
    isOpen: boolean;
    data?: News;
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
  const itemsPerPage = 10;

  const filteredNews = useMemo(() => {
    return news
      .filter((item) => !item.isDelete)
      .filter((item) => {
        if (selectedCategory && item.cateNewsID !== selectedCategory)
          return false;
        if (statusFilter !== "all" && item.status !== statusFilter)
          return false;
        if (
          searchQuery &&
          !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.summary.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      });
  }, [news, selectedCategory, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  const handleDeleteNews = (id: string) => {
    setNews(
      news.map((item) => (item._id === id ? { ...item, isDelete: true } : item))
    );
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

  const handleStatusFilterChange = (status: "all" | "active" | "inactive") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <NewsLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-80">
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
        <main className="flex-1">
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
                      }`
                    : `Tổng: ${filteredNews.length} bài viết`}
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
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilterChange("all")}
                >
                  Tất Cả ({news.filter((n) => !n.isDelete).length})
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilterChange("active")}
                >
                  Hoạt Động (
                  {
                    news.filter((n) => !n.isDelete && n.status === "active")
                      .length
                  }
                  )
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilterChange("inactive")}
                >
                  Dừng Hoạt Động (
                  {
                    news.filter((n) => !n.isDelete && n.status === "inactive")
                      .length
                  }
                  )
                </Button>
              </div>
            </div>

            {/* News table */}
            {/* <NewsTable
              news={paginatedNews}
              categories={categories.filter((c) => !c.isDelete)}
              onEdit={(item) => setNewsModalState({ isOpen: true, data: item })}
              onDelete={(id) => {
                setDeleteModal({ isOpen: true, type: "news", id });
              }}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredNews.length}
              onPageChange={setCurrentPage}
            /> */}
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
