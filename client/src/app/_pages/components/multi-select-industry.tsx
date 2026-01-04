"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, ChevronRight, Check, Search } from "lucide-react";
import { useGetTreeIndustry } from "@/queries/useIndustry";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MultiLang {
  vi: string;
  en: string;
}

interface IndustryNode {
  _id: string;
  name: MultiLang;
  parentId: string;
  isParent: boolean;
  children: IndustryNode[];
  createdAt?: string;
  updatedAt?: string;
}

interface Option {
  value: string;
  label: MultiLang;
}

interface MultiSelectTreeProps {
  selected: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectTree({
  selected,
  onChange,
  placeholder = "Chọn ngành nghề...",
  className,
}: MultiSelectTreeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: treeData } = useGetTreeIndustry({ name: debouncedSearch });

  // Toggle mở rộng/thu gọn node
  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Kiểm tra node có được chọn không
  const isSelected = (id: string) => selected.some((s) => s.value === id);

  // Xử lý chọn/bỏ chọn
  const handleSelect = (node: IndustryNode) => {
    const option: Option = {
      value: node._id,
      label: node.name,
    };

    if (isSelected(node._id)) {
      onChange(selected.filter((s) => s.value !== node._id));
    } else {
      onChange([...selected, option]);
    }
  };

  // Render đệ quy cây
  const renderTree = (nodes: IndustryNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node._id}>
        {/* Node hiện tại */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (node.isParent) toggleNode(node._id);
            handleSelect(node);
          }}
          className={cn(
            "w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 transition-colors",
            isSelected(node._id) && "bg-accent text-accent-foreground"
          )}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          <div className="flex items-center gap-1 flex-1">
            {node.isParent && (
              <span className="w-4 h-4">
                {expandedNodes.has(node._id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            )}
            {!node.isParent && <span className="w-4" />}
            <span className="flex-1">{node.name.vi}</span>
            {isSelected(node._id) && <Check className="w-4 h-4 ml-auto" />}
          </div>
        </button>

        {/* Render con nếu mở rộng */}
        {node.isParent &&
          expandedNodes.has(node._id) &&
          node.children.length > 0 && (
            <div>{renderTree(node.children, level + 1)}</div>
          )}
      </div>
    ));
  };

  // Danh sách hiển thị
  const displayNodes = useMemo(() => {
    const dataRender = treeData?.data || [];
    return dataRender.length > 0 ? renderTree(dataRender) : [];
  }, [treeData, expandedNodes, renderTree]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      {/* modal={true}: Khi bật chế độ này, Radix UI sẽ coi Popover là một "lớp phủ" độc lập (giống như một Modal nhỏ nằm trên Modal to). Nó sẽ thiết lập lại cơ chế quản lý sự kiện và focus, cho phép con lăn chuột hoạt động bên trong nó thay vì bị Dialog phía dưới chặn lại */}
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <div className="border border-input rounded-md bg-background p-2 min-h-10 flex flex-wrap gap-2 items-center cursor-pointer">
            {selected.length ? (
              selected.map((item) => (
                <span
                  key={item.value}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary text-primary-foreground text-sm"
                >
                  {item.label.vi}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(selected.filter((s) => s.value !== item.value));
                    }}
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">
                {placeholder}
              </span>
            )}

            <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-80 md:!w-114 p-0">
          {/* Search box */}
          <div className="flex items-center border-b">
            <Input
              placeholder="Tìm kiếm ngành nghề..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setExpandedNodes(new Set());
              }}
              className="border-0 rounded-none focus-visible:ring-0"
              autoFocus
            />

            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-4 h-4 absolute right-2 top-2 text-muted-foreground" />
            )}
          </div>

          <ScrollArea className="h-40 w-full">
            <div className="py-2">
              {displayNodes.length > 0 ? (
                displayNodes
              ) : (
                <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Không tìm thấy ngành nghề nào
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
