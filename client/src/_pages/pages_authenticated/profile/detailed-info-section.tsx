"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Check, X, GraduationCap, Calendar, Award } from "lucide-react";
import { MultiSelect } from "../../components/multi-select";

//- helper định dạng lại ngày tháng học vấn dạng mm/yyyy an toàn
const formatEducationDate = (dateStr: string) => {
  if (!dateStr) return "chưa cập nhật";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
};
import { EducationForm } from "./education-form";
import { useAppStore } from "@/components/TanstackProvider";
import {
  useGetDetailProfile,
  useUpdateDetailProfileMutate,
} from "@/queries/useDetailProfile";
import { ADDRESS_OPTIONS, GENDER_OPTIONS, LEVEL_OPTIONS } from "@/lib/constant";
import { useGetSkillFilter } from "@/queries/useSkill";
import { SkillResType } from "@/schemasvalidation/skill";
import { useGetDetaiIndustry } from "@/queries/useIndustry";
import { CustomizeSelect } from "../../components/CustomizeSelect";
import { MultiSelectTree } from "../../components/multi-select-industry";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";

export function DetailedInfoSection() {
  const { user } = useAppStore();
  const { data: detailProfileData } = useGetDetailProfile({ id: user?._id });
  const { data: industryData } = useGetDetaiIndustry();
  const { mutateAsync: updateDetailProfileMutate } =
    useUpdateDetailProfileMutate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(detailProfileData?.data);
  const [validateForm, setValidateForm] = useState(false);

  const selectedIndustryIds = Array.isArray(formData?.industryID)
    ? formData?.industryID.map((ind: any) => ind?._id).filter(Boolean)
    : [];

  const { data: skillData } = useGetSkillFilter({
    currentPage: 1,
    pageSize: 200,
    industryIDs: selectedIndustryIds,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev!, [field]: value }));
  };

  const handleSalaryChange = (field: "min" | "max", value: string) => {
    setFormData((prev) => ({
      ...prev!,
      desiredSalary: {
        ...prev!.desiredSalary,
        [field]: Number.parseInt(value) || 0,
      },
    }));
  };

  const handleEducationChange = (education: any[]) => {
    setFormData((prev) => ({ ...prev!, education }));
  };

  const handleSave = async () => {
    const idUserUpdate = formData && formData?._id;

    if (!idUserUpdate) {
      console.error("Thiếu ID người dùng để cập nhật");
      return;
    }

    const payload = {
      sumary: formData?.sumary?.trim() || "",
      gender: formData?.gender || "Nam",
      industryID: Array.isArray(formData?.industryID)
        ? formData?.industryID?.map((ind) => ind?._id)
        : [],
      skillID: Array.isArray(formData?.skillID)
        ? formData?.skillID?.map((skill) => skill?._id)
        : [],
      desiredSalary: {
        min: Number(formData?.desiredSalary?.min) || 0,
        max: Number(formData?.desiredSalary?.max) || 0,
      },
      education: Array.isArray(formData?.education)
        ? formData?.education.map((edu) => ({
            school: edu.school?.trim(),
            degree: edu.degree?.trim(),
            startDate: edu.startDate,
            endDate: edu.endDate,
          }))
        : [],
      level: formData?.level || LEVEL_OPTIONS[0].value,
      address: formData?.address,
    };

    const res = await updateDetailProfileMutate({ id: idUserUpdate, payload });

    if (res.isError) return;

    SoftSuccessSonner(res.message);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(detailProfileData?.data);
    setIsEditing(false);
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const fomatDataSkill = (skills: SkillResType[]) => {
    return skills?.map((skill) => {
      return {
        label: skill?.name,
        value: skill?._id,
      };
    });
  };

  useEffect(() => {
    if (detailProfileData?.data) setFormData(detailProfileData?.data);
  }, [detailProfileData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Thông tin chi tiết
        </h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Summary */}
        <div>
          <Label htmlFor="summary" className="text-sm font-medium">
            Tóm tắt
          </Label>
          {isEditing ? (
            <Textarea
              id="summary"
              value={formData?.sumary}
              onChange={(e) => handleChange("sumary", e.target.value)}
              placeholder="Mô tả ngắn về bản thân..."
              className="mt-2 min-h-24"
            />
          ) : (
            <p className="mt-2 text-foreground whitespace-pre-wrap">
              {formData?.sumary}
            </p>
          )}
        </div>

        {/* Gender and Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gender" className="text-sm font-medium">
              Giới tính
            </Label>
            {isEditing ? (
              <Select
                value={formData?.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger id="gender" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-2 text-foreground">
                {
                  GENDER_OPTIONS.find((o) => o.label === formData?.gender)
                    ?.label
                }
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="level" className="text-sm font-medium">
              Cấp độ
            </Label>
            {isEditing ? (
              <Select
                value={formData?.level || LEVEL_OPTIONS[0].value}
                onValueChange={(value) => handleChange("level", value)}
              >
                <SelectTrigger id="level" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-2 text-foreground">
                {LEVEL_OPTIONS.find((o) => o.value === formData?.level)?.label}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="text-sm font-medium">
            Địa chỉ
          </Label>
          {isEditing ? (
            <CustomizeSelect
              data={ADDRESS_OPTIONS}
              value={formData?.address as string}
              onChange={(value) => handleChange("address", value)}
            />
          ) : (
            <p className="mt-2 text-foreground">{formData?.address}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <Label className="text-sm font-medium">Chuyên ngành</Label>

          {isEditing ? (
            <MultiSelectTree
              selected={
                formData?.industryID?.map((item) => {
                  return {
                    label: item.name,
                    value: item._id,
                  };
                }) || []
              }
              onChange={(options) => {
                const industryDataArray = Array.isArray(
                  industryData?.data?.result,
                )
                  ? industryData?.data?.result
                  : [];
                const selectedIndustries =
                  industryDataArray?.filter((industry) =>
                    options.some((option) => option.value === industry._id),
                  ) ?? [];

                handleChange("industryID", selectedIndustries);
              }}
              placeholder="Chọn Chuyên ngành..."
              className="mt-2"
            />
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData?.industryID && formData?.industryID?.length > 0 ? (
                formData?.industryID.map((item) => (
                  <span
                    key={item._id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground"
                  >
                    {item.name.vi}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground">Chưa cập nhật</p>
              )}
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
          <Label className="text-sm font-medium">Kỹ năng</Label>

          {isEditing ? (
            <MultiSelect
              options={
                Array.isArray(skillData?.data?.result)
                  ? fomatDataSkill(skillData?.data?.result)
                  : []
              }
              selected={
                formData?.skillID?.map((item) => {
                  //- item: _id, name
                  return {
                    label: item.name,
                    value: item._id,
                  };
                }) || []
              }
              onChange={(options) => {
                const selectedSkills = options.map((option) => ({
                  _id: option.value,
                  name: option.label,
                }));

                handleChange("skillID", selectedSkills);
              }}
              placeholder="Chọn kỹ năng..."
              className="mt-2"
            />
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData?.skillID && formData?.skillID?.length > 0 ? (
                formData?.skillID.map((skill) => (
                  <span
                    key={skill._id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground"
                  >
                    {skill.name.vi}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground">Chưa cập nhật</p>
              )}
            </div>
          )}
        </div>

        {/* Desired Salary */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Lương mong muốn
          </Label>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="salary-min"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Tối thiểu
                </Label>
                <Input
                  id="salary-min"
                  type="number"
                  value={formData?.desiredSalary?.min}
                  onChange={(e) => handleSalaryChange("min", e.target.value)}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="salary-max"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Tối đa
                </Label>
                <Input
                  id="salary-max"
                  type="number"
                  value={formData?.desiredSalary?.max}
                  onChange={(e) => handleSalaryChange("max", e.target.value)}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
            </div>
          ) : (
            <p className="mt-2 text-foreground">
              {formatSalary(formData?.desiredSalary?.min ?? 0)} -{" "}
              {formatSalary(formData?.desiredSalary?.max ?? 0)}
            </p>
          )}
        </div>

        {/* Education */}
        <div>
          <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 block">
            Học vấn
          </Label>
          {isEditing ? (
            <EducationForm
              education={formData?.education || []}
              onChange={handleEducationChange}
              setValidateForm={setValidateForm}
            />
          ) : (
            <div className="pl-3">
              {formData?.education && formData?.education?.length > 0 ? (
                <div className="relative border-l border-slate-200/80 dark:border-slate-800/80 space-y-6 py-1">
                  {formData?.education.map((edu, index) => (
                    <div key={index} className="relative pl-6 group">
                      {/*- chấm tròn biểu thị mốc thời gian trên timeline */}
                      <div className="absolute left-0 -translate-x-1/2 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-white dark:bg-slate-900 text-primary shadow-xs transition-colors group-hover:border-primary group-hover:bg-primary/5">
                        <GraduationCap className="h-4 w-4" />
                      </div>

                      {/*- thông tin chi tiết học vấn */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight tracking-tight group-hover:text-primary transition-colors">
                          {edu.school || "Trường học chưa cập nhật"}
                        </h4>

                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>{edu.degree || "Bằng cấp chưa cập nhật"}</span>
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5 pt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>
                            {formatEducationDate(edu.startDate)} —{" "}
                            {formatEducationDate(edu.endDate)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-transparent">
                  <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chưa có thông tin học vấn
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2 bg-transparent"
            >
              <X className="w-4 h-4" />
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2"
              disabled={!validateForm}
            >
              <Check className="w-4 h-4" />
              Lưu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
