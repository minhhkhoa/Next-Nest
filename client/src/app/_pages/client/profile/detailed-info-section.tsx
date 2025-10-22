"use client";

import { useState } from "react";
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


interface DetailedInfoSectionProps {
  data: {
    summary: string;
    gender: string;
    industry: string[];
    skills: string[];
    desiredSalary: { min: number; max: number };
    education: Array<{
      school: string;
      degree: string;
      startDate: string;
      endDate: string;
    }>;
    level: string;
    address: string;
  };
}

const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const INDUSTRY_OPTIONS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Software",
  "Consulting",
];

const SKILLS_OPTIONS = [
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "TypeScript",
  "JavaScript",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Kubernetes",
];

const LEVEL_OPTIONS = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const ADDRESS_OPTIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Biên Hòa",
  "Nha Trang",
  "Quảng Ninh",
];

export function DetailedInfoSection({
  data,
}: DetailedInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalaryChange = (field: "min" | "max", value: string) => {
    setFormData((prev) => ({
      ...prev,
      desiredSalary: {
        ...prev.desiredSalary,
        [field]: Number.parseInt(value) || 0,
      },
    }));
  };

  const handleEducationChange = (education: any[]) => {
    setFormData((prev) => ({ ...prev, education }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(data);
    setIsEditing(false);
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(salary);
  };

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
              value={formData.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              placeholder="Mô tả ngắn về bản thân..."
              className="mt-2 min-h-24"
            />
          ) : (
            <p className="mt-2 text-foreground whitespace-pre-wrap">
              {formData.summary}
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
                value={formData.gender}
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
                {GENDER_OPTIONS.find((o) => o.value === formData.gender)?.label}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="level" className="text-sm font-medium">
              Cấp độ
            </Label>
            {isEditing ? (
              <Select
                value={formData.level}
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
                {LEVEL_OPTIONS.find((o) => o.value === formData.level)?.label}
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
            <Select
              value={formData.address}
              onValueChange={(value) => handleChange("address", value)}
            >
              <SelectTrigger id="address" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADDRESS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="mt-2 text-foreground">{formData.address}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <Label className="text-sm font-medium">Ngành công nghiệp</Label>
          {isEditing ? (
            <MultiSelect
              options={INDUSTRY_OPTIONS}
              selected={formData.industry}
              onChange={(value) => handleChange("industry", value)}
              placeholder="Chọn ngành công nghiệp..."
              className="mt-2"
            />
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.industry.length > 0 ? (
                formData.industry.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground"
                  >
                    {item}
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
              options={SKILLS_OPTIONS}
              selected={formData.skills}
              onChange={(value) => handleChange("skills", value)}
              placeholder="Chọn kỹ năng..."
              className="mt-2"
            />
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.skills.length > 0 ? (
                formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground"
                  >
                    {skill}
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
                  value={formData.desiredSalary.min}
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
                  value={formData.desiredSalary.max}
                  onChange={(e) => handleSalaryChange("max", e.target.value)}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
            </div>
          ) : (
            <p className="mt-2 text-foreground">
              {formatSalary(formData.desiredSalary.min)} -{" "}
              {formatSalary(formData.desiredSalary.max)}
            </p>
          )}
        </div>

        {/* Education */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Học vấn</Label>
          {isEditing ? (
            <EducationForm
              education={formData.education}
              onChange={handleEducationChange}
            />
          ) : (
            <div className="space-y-3">
              {formData.education.length > 0 ? (
                formData.education.map((edu, index) => (
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
            <Button onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              Lưu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
