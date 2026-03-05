"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import {
  useCreateBookmark,
  useDeleteBookmarkByItemId,
} from "@/queries/useBookmark";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "./TanstackProvider";
import { JobResType } from "@/schemasvalidation/job";
import { usePathname } from "@/i18n/navigation";

interface BookmarkButtonProps extends React.ComponentProps<typeof Button> {
  job: JobResType;
}

export default function BookmarkJobButton({
  job,
  className,
  children,
  variant = "ghost",
  size = "icon",
  ...props
}: BookmarkButtonProps) {
  const pathName = usePathname();

  const { isLogin } = useAppStore();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (job.hasBookmarked !== undefined) {
      setIsBookmarked(job.hasBookmarked);
    }
  }, [job.hasBookmarked, pathName]);

  useEffect(() => {
    //- Nếu đang ở trang Saved Jobs thì mặc định tất cả đều là bookmarked
    if (pathName === "/saved-jobs") {
      setIsBookmarked(true);
    }
  }, [pathName]);

  const createBookmarkMutation = useCreateBookmark();
  const deleteBookmarkMutation = useDeleteBookmarkByItemId();

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    //- Nếu đã bookmark, gọi mutation xóa bookmark
    if (isBookmarked) {
      deleteBookmarkMutation.mutate(job._id, {
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
          itemId: job._id,
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
      {...props}
      variant={variant}
      size={size}
      className={cn(
        "hover:bg-transparent hover:text-primary transition-colors",
        isBookmarked && "text-primary fill-current",
        className,
      )}
      onClick={handleToggleBookmark}
      disabled={isLoading || props.disabled}
    >
      <Bookmark className={cn("w-5 h-5", isBookmarked ? "fill-current" : "")} />
      {children}
      <span className="sr-only">Bookmark</span>
    </Button>
  );
}
