"use client";

import { Card } from "@/components/ui/card";
import { BasicInfoSection } from "@/app/_pages/client/profile/basic-info-section";
import { DetailedInfoSection } from "@/app/_pages/client/profile/detailed-info-section";

export default function ProfilePage() {
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
          <DetailedInfoSection />
        </Card>
      </div>
    </main>
  );
}
