"use client";

import React from "react";
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { useAppStore } from "./TanstackProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  useDeleteNotification,
  useGetCountUnread,
  useGetNotificationsFilter,
  useMarkAllRead,
  useMarkAsRead,
} from "@/queries/useNotification";
import { handleNotificationNavigation } from "@/lib/utils";
import { NotificationResType } from "@/schemasvalidation/notification";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotificationBell() {

  const t = useTranslations("Header.Bell");
  const router = useRouter();
  const { isLogin } = useAppStore();

  // 1. Lấy số lượng và danh sách thông báo qua Hooks
  const { data: countRes } = useGetCountUnread(isLogin);
  const { data: listRes, isLoading } = useGetNotificationsFilter({
    currentPage: 1,
    pageSize: 10,
    isLogin,
  });

  // 2. Các hành động (Mutations)
  const markAsReadMutation = useMarkAsRead();
  const markAllReadMutation = useMarkAllRead();
  const deleteMutation = useDeleteNotification();

  const unreadCount = countRes?.data?.count || 0;
  const notifications = listRes?.data?.result || [];

  // 3. Xử lý điều hướng khi bấm vào thông báo dựa trên Enum dùng chung
  const onNotifyClick = async (item: NotificationResType) => {
    //- khi bấm vào thì đánh dấu là đã đọc
    if (!item.isRead) await markAsReadMutation.mutateAsync(item._id);

    //- điều hướng
    handleNotificationNavigation(item, router);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer p-2 hover:bg-secondary rounded-full transition-all">
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-bold text-lg">{t("Title")}</h4>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-primary"
            onClick={() => markAllReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-1 h-3 w-3" /> {t("MarkAllAsRead")}
          </Button>
        </div>

        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((item) => (
                <div
                  key={item._id}
                  className={`group relative flex flex-col gap-1 border-b p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !item.isRead
                      ? "bg-primary/5 border-l-4 border-l-primary"
                      : ""
                  }`}
                  onClick={() => onNotifyClick(item)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span
                      className={`text-sm leading-tight ${!item.isRead ? "font-bold" : "font-medium"}`}
                    >
                      {item.title.vi}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(item._id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.content.vi}
                  </p>

                  <span className="text-[10px] text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
              <Bell className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">{t("NoNotifications")}</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-2 text-center">
          <Button
            variant="link"
            size="sm"
            className="w-full text-xs"
            onClick={() => router.push("/admin/notifications")}
          >
            {t("ViewAll")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
