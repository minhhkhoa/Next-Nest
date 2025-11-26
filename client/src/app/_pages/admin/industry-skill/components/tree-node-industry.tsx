"use client";

import { ChevronRight, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IndustryResType } from "@/schemasvalidation/industry";

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
}

export default function TreeNode({
  node,
  level = 0,
  onEdit,
  onDelete,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  if (!node) return null;

  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = level * 28; // tăng lên 28px cho dễ nhìn

  return (
    <div>
      {/* Node chính */}
      <div
        className={cn(
          "group flex justify-between items-center gap-2 py-2.5 px-3 rounded-lg transition-all duration-200",
          isHovered && "bg-muted/80"
        )}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
                isExpanded && "rotate-90"
              )}
            />
          </button>
        )}

        {/* Tên node */}
        <span className="flex-1 font-medium text-foreground select-none">
          {node.name.vi || node.name.en || "Không có tên"}
        </span>

        {/* Nút hành động (chỉ hiện khi hover) */}
        <div
          className={cn(
            "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isHovered && "opacity-100"
          )}
        >
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
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
