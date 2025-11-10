"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Plus, Trash2, Edit2, Search, X } from "lucide-react";
import { CategoryNewsResType } from "@/schemasvalidation/NewsCategory";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CategoriesSidebarProps {
  categories: CategoryNewsResType[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onEditCategory: (category: CategoryNewsResType) => void;
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.name.vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.summary.vi.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* <ScrollArea className="h-80 w-full rounded-md border p-5"> */}
      <div className="h-auto w-full rounded-md border p-5">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          className="w-full justify-start cursor-pointer"
          onClick={() => onSelectCategory(null)}
        >
          Tất Cả Tin Tức
        </Button>

        <div className="space-y-2 mt-2">
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
                  className="w-full justify-start cursor-pointer"
                  onClick={() => onSelectCategory(category._id)}
                >
                  <span className="truncate">{category.name.vi}</span>
                </Button>

                <div className="absolute right-1 top-1/2 -translate-y-1/2 group-hover:opacity-100 transition-opacity z-index-50">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-secondary rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                      <div className="flex flex-col justify-items-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditCategory(category)}
                          className="flex gap-2 !justify-start"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Chỉnh sửa</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteCategory(category._id)}
                          className="text-destructive hover:text-destructive flex gap-2 !justify-start"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="hidden group-hover:block absolute left-full ml-2 top-0 w-48 bg-popover border border-border rounded-md p-2 shadow-md z-40">
                  <p className="text-xs text-muted-foreground">
                    {category.summary.vi}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* </ScrollArea> */}
    </div>
  );
}
