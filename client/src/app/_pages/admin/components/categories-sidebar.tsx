"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Plus, Trash2, Edit2, Search, X } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  summary: string;
  isDelete: boolean;
}

interface CategoriesSidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onShowAddCategory: () => void;
}

export function CategoriesSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  onShowAddCategory,
}: CategoriesSidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Danh Mục Tin Tức</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowAddCategory}
          className="h-8 w-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm danh mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        className="w-full justify-start"
        onClick={() => onSelectCategory(null)}
      >
        Tất Cả Tin Tức
      </Button>

      <div className="space-y-2">
        {filteredCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Không tìm thấy danh mục
          </p>
        ) : (
          filteredCategories.map((category) => (
            <div key={category._id} className="group relative">
              <Button
                variant={
                  selectedCategory === category._id ? "default" : "outline"
                }
                className="w-full justify-start"
                onClick={() => onSelectCategory(category._id)}
              >
                <span className="truncate">{category.name}</span>
              </Button>

              <button
                onClick={() =>
                  setOpenMenu(openMenu === category._id ? null : category._id)
                }
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-secondary rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {openMenu === category._id && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-md z-50">
                  <button
                    onClick={() => {
                      onEditCategory(category);
                      setOpenMenu(null);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => {
                      onDeleteCategory(category._id);
                      setOpenMenu(null);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              )}

              <div className="hidden group-hover:block absolute left-full ml-2 top-0 w-48 bg-popover border border-border rounded-md p-2 shadow-md z-40">
                <p className="text-xs text-muted-foreground">
                  {category.summary}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
