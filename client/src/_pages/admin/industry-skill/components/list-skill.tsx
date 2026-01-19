"use client";

import { Edit, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IndustryResType } from "@/schemasvalidation/industry";

interface SkillItem {
  _id: string;
  name: {
    vi: string;
    en: string;
  };
  industryID: IndustryResType[];
}

interface SkillListProps {
  data: SkillItem[];
  onEdit: (industry: SkillItem) => void;
  onDelete: (id: string) => void;
  setOnSelectedIndustry: (id: string) => void;
}

export default function SkillList({
  data,
  onEdit,
  onDelete,
  setOnSelectedIndustry,
}: SkillListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setOnSelectedIndustry("")}>
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
      {data.length > 0 ? (
        <div className="space-y-2">
          {data.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors group"
            >
              {/* Item content */}
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.name.vi}</p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 hover:cursor-pointer rounded hover:!bg-background/80 transition-colors"
                  onClick={() => onEdit(item)}
                >
                  <Edit size={16} className="text-muted-foreground" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 hover:cursor-pointer rounded hover:!bg-background/80 transition-colors"
                  onClick={() => onDelete(item._id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
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
            Không tìm thấy kỹ năng nào
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Bạn hãy thử thay đổi từ khóa tìm kiếm
          </p>
        </div>
      )}
    </div>
  );
}
