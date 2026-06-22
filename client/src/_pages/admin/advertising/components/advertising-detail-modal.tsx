"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdBookingResType } from "@/schemasvalidation/adBooking";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useGetLang } from "@/hooks/use-get-lang";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: AdBookingResType | null;
  isAdmin?: boolean;
}

export function AdvertisingDetailModal({ isOpen, onClose, data, isAdmin = true }: Props) {
  const t = useTranslations("Admin.Advertising");
  const { locale } = useGetLang();
  if (!data) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 bg-yellow-50 border-yellow-200"
          >
            {t("StatusPendingPayment")}
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge
            variant="outline"
            className="text-blue-600 bg-blue-50 border-blue-200"
          >
            {t("StatusScheduled")}
          </Badge>
        );
      case "RUNNING":
        return (
          <Badge
            variant="outline"
            className="text-green-600 bg-green-50 border-green-200"
          >
            {t("StatusRunning")}
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="text-gray-600 bg-gray-50 border-gray-200"
          >
            {t("StatusCompleted")}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="text-red-600 bg-red-50 border-red-200"
          >
            {t("StatusCancelled")}
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 bg-orange-50 border-orange-200"
          >
            {t("StatusExpired")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="pt-6 px-6 pb-2">
          <DialogTitle className="text-xl">{t("DetailTitle")}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] px-6 pb-6">
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("BookingId")}</span>
              <span className="font-semibold uppercase">
                {data._id.substring(data._id.length - 8)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("Position")}</span>
              <Badge variant="secondary" className="text-base">
                {data.slotId?.name || data.slotId?.code || data.slotId}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("DisplayType")}</span>
              <span className="font-medium text-sm">
                {data.adType === "NON_DISMISSIBLE" ? t("NonDismissible") : t("Dismissible")}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("Time")}</span>
              <span className="font-medium">
                {format(new Date(data.startAt), "dd/MM/yyyy")} -{" "}
                {format(new Date(data.endAt), "dd/MM/yyyy")}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("TotalPrice")}</span>
              <span className="font-bold text-primary">
                {data.amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}{locale === "vi" ? "đ" : " VND"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("Status")}</span>
              {getStatusBadge(data.status)}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">
                  {t("TargetUrlLabel")}
                </span>
                <Link
                  href={data.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline break-all text-sm"
                >
                  {data.targetUrl}
                </Link>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">
                  {t("BannerLabel")}
                </span>
                {data.imageUrl ? (
                  <div className="rounded-md border p-1 bg-muted/30 flex justify-center">
                    <Image
                      src={data.imageUrl}
                      alt="Ad Banner"
                      className="max-h-[200px] object-contain rounded w-auto"
                      width={200}
                      height={200}
                    />
                  </div>
                ) : (
                  <span className="text-sm italic text-muted-foreground">
                    {t("NoImage")}
                  </span>
                )}
              </div>
            </div>

            {isAdmin && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-2">{t("CustomerInfo")}</p>
                  <div className="bg-muted p-3 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t("Company")}</span>
                      <span className="text-sm font-medium">
                        {(data.companyId as any)?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t("OrderedBy")}</span>
                      <span className="text-sm font-medium">
                        {(data.recruiterId as any)?.name || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
