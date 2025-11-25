"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkillItem {
  _id: string;
  name: {
    vi: string;
    en: string;
  };
  industryID: string[];
}

interface SkillListProps {
  data: SkillItem[];
  onEdit: (id: string, nameVi: string, nameEn: string) => void;
  onDelete: (id: string) => void;
}

export default function SkillList({ data, onEdit, onDelete }: SkillListProps) {
  const [editingItem, setEditingItem] = useState<SkillItem | null>(null);
  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");

  const handleOpenEditDialog = (item: SkillItem) => {
    setEditingItem(item);
    setNameVi(item.name.vi);
    setNameEn(item.name.en);
  };

  const handleSave = () => {
    if (!nameVi.trim() || !nameEn.trim()) return;

    if (editingItem) {
      onEdit(editingItem._id, nameVi, nameEn);
    } else {
      // onAdd(nameVi, nameEn);
    }

    setNameVi("");
    setNameEn("");
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn chắc chắn muốn xóa?")) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
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
                onClick={() => handleOpenEditDialog(item)}
              >
                <Edit size={16} className="text-muted-foreground" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 hover:cursor-pointer rounded hover:!bg-background/80 transition-colors"
                onClick={() => handleDelete(item._id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
