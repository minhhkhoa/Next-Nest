"use client";

import React from "react";
import { BasicInfoSection } from "@/_pages/pages_authenticated/profile/basic-info-section";
import { DetailedInfoSection } from "@/_pages/pages_authenticated/profile/detailed-info-section";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/components/TanstackProvider";
import { handleInitName } from "@/lib/utils";
import { Mail, Shield, CheckCircle2, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const { user } = useAppStore();
  const t = useTranslations("Candidate.Profile");

  //- tính toán độ hoàn thiện hồ sơ ước tính dựa trên thông tin đã nhập
  const calculateCompletion = () => {
    let score = 20; // mặc định đã có tài khoản
    if (user?.name) score += 20;
    if (user?.avatar) score += 20;
    if (user?.email) score += 20;
    if (user?.roleCodeName) score += 20;
    return score;
  };

  const completionScore = calculateCompletion();

  return (
    <main className="min-h-screen bg-slate-50/30 dark:bg-transparent py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          {/*- tiêu đề trang có đường kẻ primary đặc trưng của dự án */}
          <h1 className="text-3xl font-extrabold text-foreground mb-2 pl-4 border-l-4 border-primary">
            {t("PageTitle")}
          </h1>
          <p className="text-xs text-muted-foreground ml-4">
            {t("PageDesc")}
          </p>
        </div>

        {/*- bố cục 2 cột: bên trái là card tóm tắt profile, bên phải là form chỉnh sửa dùng tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/*- cột trái: thẻ tóm tắt profile */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs shadow-xs relative">
              {/*- phần cover banner gradient mờ tinh tế */}
              <div className="h-24 w-full bg-gradient-to-r from-primary/25 to-indigo-500/15" />

              <CardContent className="p-6 pt-0 relative flex flex-col items-center text-center">
                {/*- avatar tròn nổi lên đè trên banner cover */}
                <div className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden -mt-12 bg-white dark:bg-slate-800 shadow-md">
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={user?.avatar || ""}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="text-lg font-bold">
                      {user?.name ? handleInitName(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/*- hiển thị tên người dùng và icon tick xanh nếu đạt 100% */}
                <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 justify-center">
                  {user?.name || t("DefaultUser")}
                  {completionScore === 100 && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                  )}
                </h3>

                {/*- badge hiển thị vai trò */}
                <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <UserCheck className="w-3.5 h-3.5" />
                  {user?.roleCodeName === "CANDIDATE"
                    ? t("RoleCandidate")
                    : user?.roleCodeName === "RECRUITER"
                      ? t("RoleRecruiter")
                      : t("RoleAdmin")}
                </span>

                {/*- thanh progress đo độ hoàn thiện hồ sơ */}
                <div className="w-full mt-6 space-y-2 text-left pt-5 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">{t("ProfileCompletion")}</span>
                    <span className="text-primary">{completionScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${completionScore}%` }}
                    />
                  </div>
                </div>

                {/*- thông tin liên lạc nhanh dưới profile */}
                <div className="w-full mt-6 space-y-3 text-left text-xs text-slate-600 dark:text-slate-400 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span
                      className="truncate"
                      title={user?.email ? t("EmailVerified") : t("EmailNotVerified")}
                    >
                      {user?.email || t("EmailNotUpdated")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{t("UserId", { id: user?._id || "N/A" })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/*- cột phải: bộ Tabs chỉnh sửa thông tin */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="w-full">
              {/*- thanh chuyển đổi tab sử dụng class mặc định chuẩn của dự án để tránh xung đột layout */}
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="basic" className="font-semibold text-sm">
                  {t("BasicInfo")}
                </TabsTrigger>
                <TabsTrigger value="detailed" className="font-semibold text-sm">
                  {t("DetailedInfo")}
                </TabsTrigger>
              </TabsList>

              {/*- nội dung tab 1: thông tin cơ bản */}
              <TabsContent
                value="basic"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs shadow-xs rounded-2xl">
                  <BasicInfoSection />
                </Card>
              </TabsContent>

              {/*- nội dung tab 2: thông tin chi tiết */}
              <TabsContent
                value="detailed"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs shadow-xs rounded-2xl">
                  <DetailedInfoSection />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}
