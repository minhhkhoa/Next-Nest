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
import { Card } from "@/components/ui/card";
import { Edit2, Check, X } from "lucide-react";
import { MultiSelect } from "../../components/multi-select";
import { EducationForm } from "./education-form";
import { useAppStore } from "@/components/TanstackProvider";
import {
  useGetDetailProfile,
  useUpdateDetailProfileMutate,
} from "@/queries/useDetailProfile";
import { ADDRESS_OPTIONS, GENDER_OPTIONS, LEVEL_OPTIONS } from "@/lib/constant";
import { useGetDetaiSkill } from "@/queries/useSkill";
import { SkillResType } from "@/schemasvalidation/skill";
import { useGetDetaiIndustry } from "@/queries/useIndustry";
import { IndustryResType } from "@/schemasvalidation/industry";
import { CustomizeSelect } from "../../components/CustomizeSelect";
import { toast } from "sonner";

export function DetailedInfoSection() {
  const { user } = useAppStore();
  const { data: detailProfileData } = useGetDetailProfile({ id: user?._id });
  const { data: skillData } = useGetDetaiSkill();
  const { data: industryData } = useGetDetaiIndustry();
  const { mutateAsync: updateDetailProfileMutate } =
    useUpdateDetailProfileMutate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(detailProfileData?.data);
  const [validateForm, setValidateForm] = useState(false);

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
        ? formData?.industryID.map((ind) => ind?._id)
        : [],
      skillID: Array.isArray(formData?.skillID)
        ? formData?.skillID.map((skill) => skill?._id)
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
      level: formData?.level,
      address: formData?.address,
    };

    const res = await updateDetailProfileMutate({ id: idUserUpdate, payload });

    if(res.isError) return;

    toast.success(res.message);
    console.log("res: ", res);

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

  const fomatDataIndustry = (industries: IndustryResType[]) => {
    return industries.map((industry) => ({
      label: industry.name,
      value: industry._id,
    }));
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
              onChange={(e) => handleChange("summary", e.target.value)}
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
                value={formData?.level}
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
            <MultiSelect
              options={
                Array.isArray(industryData?.data?.result)
                  ? fomatDataIndustry(industryData.data.result)
                  : []
              }
              selected={
                formData?.industryID.map((item) => {
                  return {
                    label: item.name,
                    value: item._id,
                  };
                }) || []
              }
              onChange={(options) => {
                const industryDataArray = Array.isArray(
                  industryData?.data?.result
                )
                  ? industryData?.data?.result
                  : [];
                const selectedIndustries =
                  industryDataArray.filter((industry) =>
                    options.some((option) => option.value === industry._id)
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
                Array.isArray(skillData?.data)
                  ? fomatDataSkill(skillData?.data)
                  : []
              }
              selected={
                formData?.skillID?.map((item) => {
                  // console.log("item: ", item);
                  return {
                    label: item.name,
                    value: item._id,
                  };
                }) || []
              }
              onChange={(options) => {
                const skillDataArray = Array.isArray(skillData?.data)
                  ? skillData?.data
                  : [];
                const selectedSkills =
                  skillDataArray.filter((skill) =>
                    options.some((option) => option.value === skill._id)
                  ) ?? [];

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
                  value={formData?.desiredSalary.min}
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
                  value={formData?.desiredSalary.max}
                  onChange={(e) => handleSalaryChange("max", e.target.value)}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
            </div>
          ) : (
            <p className="mt-2 text-foreground">
              {formatSalary(formData?.desiredSalary?.min ?? 0)} -{" "}
              {formatSalary(formData?.desiredSalary.max ?? 0)}
            </p>
          )}
        </div>

        {/* Education */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Học vấn</Label>
          {isEditing ? (
            <EducationForm
              education={formData?.education || []}
              onChange={handleEducationChange}
              setValidateForm={setValidateForm}
            />
          ) : (
            <div className="space-y-3">
              {formData?.education && formData?.education.length > 0 ? (
                formData?.education.map((edu, index) => (
                  <Card key={index} className="p-4 bg-muted">
                    <p className="font-medium text-foreground">{edu.school}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.degree}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(edu.startDate).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(edu.endDate).toLocaleDateString("vi-VN")}
                    </p>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">Chưa cập nhật</p>
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
            <Button onClick={handleSave} className="gap-2" disabled={!validateForm}>
              <Check className="w-4 h-4" />
              Lưu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
