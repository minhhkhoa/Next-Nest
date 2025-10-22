"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BasicInfoSection } from "@/app/_pages/client/profile/basic-info-section";
import { DetailedInfoSection } from "@/app/_pages/client/profile/detailed-info-section";
import { useAppStore } from "@/components/TanstackProvider";

export default function ProfilePage() {
  const { user } = useAppStore();
  const [profileData, setProfileData] = useState({
    // Basic Info
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    avatar:
      "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80",

    // Detailed Info
    summary: "Lập trình viên Full Stack với 5 năm kinh nghiệm",
    gender: "male",
    industry: ["Technology", "Software"],
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    desiredSalary: { min: 30000000, max: 50000000 },
    education: [
      {
        school: "Đại học Bách Khoa Hà Nội",
        degree: "Cử nhân Khoa học Máy tính",
        startDate: "2018-09-01",
        endDate: "2022-06-30",
      },
    ],
    level: "senior",
    address: "Hà Nội",
  });

  return (
    <main className="min-h-screen bg-background py-8 px-2">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Thông tin cá nhân
          </h1>
        </div>

        {/* Basic Info Section */}
        <Card className="p-6">
          <BasicInfoSection />
        </Card>

        {/* Detailed Info Section */}
        <Card className="p-6">
          <DetailedInfoSection
            data={{
              summary: profileData.summary,
              gender: profileData.gender,
              industry: profileData.industry,
              skills: profileData.skills,
              desiredSalary: profileData.desiredSalary,
              education: profileData.education,
              level: profileData.level,
              address: profileData.address,
            }}
          />
        </Card>
      </div>
    </main>
  );
}
