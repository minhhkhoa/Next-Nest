"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import {
  useCreateBookmark,
  useDeleteBookmarkByItemId,
  useGetBookmarkedIds,
} from "@/queries/useBookmark";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "./TanstackProvider";

interface BookmarkButtonProps {
  jobId: string;
  className?: string;
}

export default function BookmarkJobButton({
  jobId,
  className,
}: BookmarkButtonProps) {
  const { isLogin } = useAppStore();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: bookmarkResponse, isSuccess } = useGetBookmarkedIds(
    "job",
    isLogin,
  );

  useEffect(() => {
    const apiResponse = bookmarkResponse?.data;

    if (isSuccess && apiResponse) {
      if (Array.isArray(apiResponse)) {
        const found = apiResponse.some((b) => b.itemId === jobId);
        setIsBookmarked(found);
        return;
      }
    }
  }, [bookmarkResponse, isSuccess, jobId]);

  const createBookmarkMutation = useCreateBookmark();
  const deleteBookmarkMutation = useDeleteBookmarkByItemId();

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    //- Nếu đã bookmark, gọi mutation xóa bookmark
    if (isBookmarked) {
      deleteBookmarkMutation.mutate(jobId, {
        onSuccess: () => {
          setIsBookmarked(false);
          toast.success("Đã bỏ lưu công việc");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Có lỗi xảy ra");
        },
      });
    } else {
      //- Nếu chưa bookmark, gọi mutation tạo bookmark
      createBookmarkMutation.mutate(
        {
          itemId: jobId,
          itemType: "job",
        },
        {
          onSuccess: () => {
            setIsBookmarked(true);
            toast.success("Đã lưu công việc");
          },
          onError: (error: any) => {
            toast.error(error?.message || "Có lỗi xảy ra");
          },
        },
      );
    }
  };

  const isLoading =
    createBookmarkMutation.isPending || deleteBookmarkMutation.isPending;

  //- chưa login thì không hiển thị nút bookmark
  if (!isLogin) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "hover:bg-transparent hover:text-primary transition-colors",
        isBookmarked && "text-primary fill-current",
        className,
      )}
      onClick={handleToggleBookmark}
      disabled={isLoading}
    >
      <Bookmark className={cn("w-5 h-5", isBookmarked ? "fill-current" : "")} />
      <span className="sr-only">Bookmark</span>
    </Button>
  );
}
