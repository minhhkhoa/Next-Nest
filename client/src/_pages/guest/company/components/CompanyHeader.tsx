"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CompanyResType } from "@/schemasvalidation/company";
import { Button } from "@/components/ui/button";
import { Globe, Users, Plus, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppStore } from "@/components/TanstackProvider";
import {
  useCreateBookmark,
  useDeleteBookmarkByItemId,
} from "@/queries/useBookmark";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { useQueryClient } from "@tanstack/react-query";
import StartChatButton from "@/components/StartChatButton";
import { envConfig } from "../../../../../config";

interface CompanyHeaderProps {
  company: CompanyResType;
}

export default function CompanyHeader({ company }: CompanyHeaderProps) {
  const { isLogin, user } = useAppStore();

  const queryClient = useQueryClient();

  const [isBookmarked, setIsBookmarked] = useState(false);

  const createBookmarkMutation = useCreateBookmark();
  const deleteBookmarkMutation = useDeleteBookmarkByItemId();

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    //- Nếu đã bookmark, gọi mutation xóa bookmark
    if (isBookmarked) {
      deleteBookmarkMutation.mutate(company._id, {
        onSuccess: () => {
          setIsBookmarked(false);
          SoftSuccessSonner("Đã bỏ theo dõi công ty");
          queryClient.invalidateQueries({
            queryKey: ["company-detail", company._id],
          });
        },
        onError: (error: any) => {
          SoftDestructiveSonner(error?.message || "Có lỗi xảy ra");
        },
      });
    } else {
      //- Nếu chưa bookmark, gọi mutation tạo bookmark
      createBookmarkMutation.mutate(
        {
          itemId: company._id,
          itemType: "company",
        },
        {
          onSuccess: () => {
            setIsBookmarked(true);
            SoftSuccessSonner("Đã lưu công ty");
            queryClient.invalidateQueries({
              queryKey: ["company-detail", company._id],
            });
          },
          onError: (error: any) => {
            SoftDestructiveSonner(error?.message || "Có lỗi xảy ra");
          },
        },
      );
    }
  };

  useEffect(() => {
    if (company.userFollow && user?._id) {
      const checkFollow = company.userFollow.includes(user._id);
      setIsBookmarked(checkFollow);
    } else {
      setIsBookmarked(false);
    }
  }, [company.userFollow, user?._id]);

  return (
    <div className="relative w-full mb-20 md:mb-24">
      {/* Banner */}
      <div className="relative w-full h-[200px] md:h-[300px] lg:h-[350px] overflow-hidden rounded-b-lg">
        <Image
          src={company.banner || "/banner.jpg"}
          alt={`${company.name} banner`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Basic Info Container */}
      <div className="container mx-auto px-4 relative">
        <div className="absolute -bottom-16 md:-bottom-20 left-4 md:left-8 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6 w-full pr-8">
          {/* Logo */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-xl border-4 border-primary shadow-lg overflow-hidden bg-white shrink-0">
            <Image
              src={company.logo || "/image_template/default-logo.png"}
              alt={`${company.name} logo`}
              fill
              className="object-contain"
            />
          </div>

          {/* Name & Quick stats */}
          <div className="flex-1 pb-0 md:pb-4 text-white drop-shadow-md space-y-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {company.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-white/90">
              {company.website && (
                <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Globe size={16} />
                  <Link
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Website
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users size={16} />
                <span>{company.totalMember} nhân viên</span>
              </div>
            </div>
          </div>

          {/* Action Buttons (Desktop) */}
          {isLogin && (
            <div className="hidden md:flex pb-4 gap-3">
              {user?.roleCodeName === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE && (
                <StartChatButton
                  receiverId={company._id}
                  label="Nhắn tin"
                  className="gap-2 shadow-lg"
                  variant="outline"
                />
              )}
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 text-white min-w-[140px] shadow-lg"
                onClick={handleToggleBookmark}
              >
                {isBookmarked ? <X size={18} /> : <Plus size={18} />}{" "}
                {isBookmarked ? "Bỏ theo dõi" : "Theo dõi công ty"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Action Buttons (Below Header) */}
      {isLogin && (
        <div className="md:hidden mt-20 px-4">
          <Button
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
            onClick={handleToggleBookmark}
          >
            {isBookmarked ? <X size={18} /> : <Plus size={18} />}{" "}
            {isBookmarked ? "Bỏ theo dõi" : "Theo dõi công ty"}
          </Button>
        </div>
      )}
    </div>
  );
}
