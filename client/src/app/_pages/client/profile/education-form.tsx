"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Education {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const handleAddEducation = () => {
    onChange([
      ...education,
      {
        school: "",
        degree: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  const handleEducationChange = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <Card key={index} className="p-4 border border-input">
          <div className="space-y-3">
            <div>
              <Label
                htmlFor={`school-${index}`}
                className="text-xs font-medium"
              >
                Trường học
              </Label>
              <Input
                id={`school-${index}`}
                value={edu.school}
                onChange={(e) =>
                  handleEducationChange(index, "school", e.target.value)
                }
                placeholder="Tên trường học"
                className="mt-1"
              />
            </div>

            <div>
              <Label
                htmlFor={`degree-${index}`}
                className="text-xs font-medium"
              >
                Bằng cấp
              </Label>
              <Input
                id={`degree-${index}`}
                value={edu.degree}
                onChange={(e) =>
                  handleEducationChange(index, "degree", e.target.value)
                }
                placeholder="Cử nhân, Thạc sĩ, ..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor={`start-${index}`}
                  className="text-xs font-medium"
                >
                  Ngày bắt đầu
                </Label>
                <Input
                  id={`start-${index}`}
                  type="date"
                  value={edu.startDate}
                  onChange={(e) =>
                    handleEducationChange(index, "startDate", e.target.value)
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`end-${index}`} className="text-xs font-medium">
                  Ngày kết thúc
                </Label>
                <Input
                  id={`end-${index}`}
                  type="date"
                  value={edu.endDate}
                  onChange={(e) =>
                    handleEducationChange(index, "endDate", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveEducation(index)}
              className="w-full gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </Button>
          </div>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={handleAddEducation}
        className="w-full gap-2 bg-transparent"
      >
        <Plus className="w-4 h-4" />
        Thêm học vấn
      </Button>
    </div>
  );
}
