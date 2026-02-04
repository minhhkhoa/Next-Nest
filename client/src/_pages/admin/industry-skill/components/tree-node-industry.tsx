"use client";

import { ChevronRight, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IndustryResType } from "@/schemasvalidation/industry";

//- Kiểm tra đệ quy xem node này hoặc bất kỳ con cháu nào có khớp search không
const hasAnyChildMatch = (node: any, searchTerm: string): boolean => {
  if (!searchTerm) return false;
  const s = searchTerm.toLowerCase();

  //- Kiểm tra chính nó
  if (node.name.vi.toLowerCase().includes(s)) return true;

  //- Kiểm tra đệ quy xuống các con
  if (node.children && node.children.length > 0) {
    return node.children.some((child: any) =>
      hasAnyChildMatch(child, searchTerm),
    );
  }

  return false;
};

//- Hàm Highlight chữ
const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) return text;

  const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeHighlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={i}
            className="bg-primary text-primary-foreground px-1 rounded-sm font-bold"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
};

interface TreeNodeData {
  _id: string;
  name: {
    vi: string;
    en: string;
  };
  children?: TreeNodeData[];
  isParent?: boolean;
}

interface TreeNodeProps {
  node: TreeNodeData;
  level?: number;
  onEdit?: (industry: IndustryResType) => void;
  onDelete?: (nodeId: string) => void;
  onSelect?: (nodeId: string) => void;
  onAddChild?: (parentId: string) => void;
  selected: string[];
  searchTerm?: string;
}

export default function TreeNode({
  node,
  searchTerm,
  level = 0,
  onEdit,
  onDelete,
  onSelect,
  onAddChild,
  selected,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Tự động mở khi search
  useEffect(() => {
    if (searchTerm && searchTerm.trim() !== "") {
      //- Chỉ cần "đám đàn em" phía dưới có thằng khớp là anh phải "mở cửa"
      if (hasAnyChildMatch(node, searchTerm)) {
        setIsExpanded(true);
      }
    }
  }, [searchTerm, node]);

  if (!node) return null;

  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = level * 28; // tăng lên 28px cho dễ nhìn

  return (
    <div>
      {/* Node chính */}
      <div
        className={cn(
          "group flex justify-between items-center gap-2 py-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer",
          isHovered && "bg-muted/80",
          selected.includes(node._id) &&
            "bg-primary/10 border-l-4 border-primary",
        )}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect?.(node._id)}
      >
        {/* Nút mở rộng/thu gọn */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-7 h-7 rounded hover:bg-background/80 transition-colors"
            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
          >
            <ChevronRight
              size={18}
              className={cn(
                "transition-transform duration-200 text-muted-foreground",
                isExpanded && "rotate-90",
              )}
            />
          </button>
        )}

        {/* Tên node */}
        <span className="flex-1 font-medium text-foreground select-none">
          {highlightText(node.name.vi, searchTerm || "")}
        </span>

        {/* Nút hành động (chỉ hiện khi hover) */}
        <div
          className={cn(
            "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isHovered && "opacity-100",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:cursor-pointer rounded hover:!bg-background/80 transition-colors text-blue-500 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild?.(node._id);
            }}
            title="Thêm ngành nghề con"
          >
            <Plus size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:cursor-pointer rounded hover:!bg-background/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(node as any);
            }}
          >
            <Edit size={16} className="text-muted-foreground" />
          </Button>

          {/* Không cho xóa nếu là node cha có con hoặc isParent = true */}
          {!node.isParent && (!node.children || node.children.length === 0) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:!bg-background/80 rounded  hover:cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(node._id);
              }}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Render con */}
      {hasChildren && isExpanded && (
        <div className="border-l-2 border-muted/30 ml-6">
          {node.children!.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              searchTerm={searchTerm}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              onAddChild={onAddChild}
              selected={selected}
            />
          ))}
        </div>
      )}
    </div>
  );
}
