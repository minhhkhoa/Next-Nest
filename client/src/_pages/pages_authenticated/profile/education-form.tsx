import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GraduationCap, Award, Calendar } from "lucide-react";
import { formatDateInput } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Education {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  setValidateForm: (isValid: boolean) => void;
}

export function EducationForm({ education, onChange, setValidateForm }: EducationFormProps) {
  const t = useTranslations("Candidate.Profile");
  const [errors, setErrors] = useState<Record<number, string>>({});

  const handleEducationChange = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };

    //- logic kiểm tra ngày bắt đầu và ngày kết thúc
    const start = new Date(updated[index].startDate);
    const end = new Date(updated[index].endDate);

    if (updated[index].startDate && updated[index].endDate && end < start) {
      setValidateForm(false);
      setErrors((prev) => ({
        ...prev,
        [index]: t("DateOrderError"),
      }));
    } else {
      setValidateForm(true);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }

    onChange(updated);
  };

  const handleAddEducation = () => {
    onChange([
      ...education,
      { school: "", degree: "", startDate: "", endDate: "" },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  useEffect(() => {
    let valid = true;
    education.forEach((edu, index) => {
      const start = new Date(edu.startDate);
      const end = new Date(edu.endDate);
      if (edu.startDate && edu.endDate && end < start) {
        valid = false;
        setErrors((prev) => ({
          ...prev,
          [index]: t("DateOrderError"),
        }));
      }
    });

    setValidateForm(valid);
  }, [education, setValidateForm, t]);

  return (
    <div className="space-y-6">
      {education.map((edu, index) => (
        <Card 
          key={index} 
          className="p-4 md:p-6 border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs rounded-2xl relative space-y-5 shadow-xs transition-all hover:shadow-md hover:border-primary/20"
        >
          {/*- thanh tiêu đề phụ và nút xóa học vấn có nền gradient nhẹ */}
          <div className="flex justify-between items-center pb-3 -mx-4 -mt-4 md:-mx-6 md:-mt-6 px-4 md:px-6 py-3 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/80 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {t("EduTitle", { index: index + 1 })}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveEducation(index)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full shrink-0 transition-colors"
              title={t("DeleteEdu")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/*- hiển thị dạng lưới 2 cột đối xứng trên màn lớn và 1 cột trên mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Trường học */}
            <div className="space-y-1.5">
              <Label htmlFor={`school-${index}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("SchoolLabel")}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <Input
                  id={`school-${index}`}
                  value={edu.school}
                  onChange={(e) =>
                    handleEducationChange(index, "school", e.target.value)
                  }
                  placeholder={t("SchoolPlaceholder")}
                  className="pl-10 h-10 rounded-xl bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {/* Bằng cấp */}
            <div className="space-y-1.5">
              <Label htmlFor={`degree-${index}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("DegreeLabel")}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Award className="w-4 h-4" />
                </div>
                <Input
                  id={`degree-${index}`}
                  value={edu.degree}
                  onChange={(e) =>
                    handleEducationChange(index, "degree", e.target.value)
                  }
                  placeholder={t("DegreePlaceholder")}
                  className="pl-10 h-10 rounded-xl bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Ngày bắt đầu */}
            <div className="space-y-1.5">
              <Label htmlFor={`start-${index}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("StartDate")}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Calendar className="w-4 h-4" />
                </div>
                <Input
                  id={`start-${index}`}
                  type="date"
                  value={formatDateInput(edu.startDate)}
                  onChange={(e) =>
                    handleEducationChange(index, "startDate", e.target.value)
                  }
                  className="pl-10 h-10 rounded-xl bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {/* Ngày kết thúc */}
            <div className="space-y-1.5">
              <Label htmlFor={`end-${index}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("EndDate")}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Calendar className="w-4 h-4" />
                </div>
                <Input
                  id={`end-${index}`}
                  type="date"
                  value={formatDateInput(edu.endDate)}
                  onChange={(e) =>
                    handleEducationChange(index, "endDate", e.target.value)
                  }
                  className="pl-10 h-10 rounded-xl bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {errors[index] && (
            <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
              {errors[index]}
            </p>
          )}
        </Card>
      ))}

      {/*- nút thêm học vấn có viền đứt nét phong cách hiện đại */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddEducation}
        className="w-full gap-2 bg-transparent border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/60 hover:text-primary rounded-2xl h-11 font-semibold transition-all hover:scale-[1.01]"
      >
        <Plus className="w-4.5 h-4.5" /> {t("AddEducation")}
      </Button>
    </div>
  );
}
