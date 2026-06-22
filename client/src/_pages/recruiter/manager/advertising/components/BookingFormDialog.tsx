"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdSlotResType } from "@/schemasvalidation/adSlot";
import AdCalendarPicker from "./AdCalendarPicker";
import { useGetBusyDatesQuery } from "@/queries/useAdBooking";
import { useMemo } from "react";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import { useTranslations } from "next-intl";
import { useGetLang } from "@/hooks/use-get-lang";

interface BookingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: AdSlotResType | null;
  formData: {
    adType: string;
    imageUrl: string;
    targetUrl: string;
    startAt: string;
    duration: number;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export default function BookingFormDialog({
  isOpen,
  onClose,
  selectedSlot,
  formData,
  setFormData,
  onSubmit,
  isPending,
}: BookingFormDialogProps) {
  const t = useTranslations("Recruiter.Advertising");
  const tButtons = useTranslations("Common.Buttons");
  const { locale } = useGetLang();
  //- Lấy lịch bận của slot này
  const { data: busyDatesRes, isLoading: isLoadingBusy } = useGetBusyDatesQuery(
    selectedSlot?.code || "",
    isOpen,
  );

  const busyDates = busyDatesRes?.data || [];

  //- Kiểm tra xung đột lịch (Client-side validation)
  const isConflict = useMemo(() => {
    if (!formData.startAt || !formData.duration || busyDates.length === 0)
      return false;

    const start = startOfDay(new Date(formData.startAt));
    const end = addDays(start, formData.duration - 1);

    const intervals = busyDates.map((b) => ({
      start: startOfDay(new Date(b.startAt)),
      end: startOfDay(new Date(b.endAt)),
    }));

    for (let i = 0; i < formData.duration; i++) {
      const currentDay = addDays(start, i);
      if (
        intervals.some((interval) => isWithinInterval(currentDay, interval))
      ) {
        return true;
      }
    }
    return false;
  }, [formData.startAt, formData.duration, busyDates]);

  if (!selectedSlot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("SetupAd")}</DialogTitle>
          <DialogDescription>
            {t("PositionLabel")}{" "}
            <span className="font-bold text-primary">{selectedSlot.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="adType">{t("AdMode")}</Label>
            <Select
              disabled={selectedSlot.adModeAllowed !== "BOTH"}
              value={formData.adType}
              onValueChange={(v) => setFormData({ ...formData, adType: v })}
            >
              <SelectTrigger
                className={
                  selectedSlot.adModeAllowed !== "BOTH" ? "bg-muted" : ""
                }
              >
                <SelectValue placeholder={t("AdModePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {selectedSlot.adModeAllowed !== "DISMISSIBLE" && (
                  <SelectItem value="NON_DISMISSIBLE">
                    {t("FixedAd")}
                  </SelectItem>
                )}
                {selectedSlot.adModeAllowed !== "NON_DISMISSIBLE" && (
                  <SelectItem value="DISMISSIBLE">{t("DismissibleAd")}</SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedSlot.adModeAllowed !== "BOTH" && (
              <p className="text-[10px] text-primary italic font-medium">
                {t("AdModeRequired", {
                  mode: selectedSlot.adModeAllowed === "NON_DISMISSIBLE"
                    ? t("FixedAd")
                    : t("DismissibleAd")
                })}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startAt">{t("StartDate")}</Label>
              <AdCalendarPicker
                date={formData.startAt ? new Date(formData.startAt) : undefined}
                setDate={(date) =>
                  setFormData({ ...formData, startAt: date?.toISOString() })
                }
                busyDates={busyDates}
                duration={formData.duration}
                maxDuration={selectedSlot.maxDurationDays}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">
                {t("DurationDays", { count: formData.duration })}
              </Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={selectedSlot.maxDurationDays || 30}
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageUrl">{t("AdImageUrl")}</Label>
            <Input
              id="imageUrl"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
            />
            <p className="text-[10px] text-muted-foreground italic bg-muted p-1 px-2 rounded">
              {t("SuggestedSize", { size: `${selectedSlot.width}x${selectedSlot.height}` })}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="targetUrl">{t("TargetUrl")}</Label>
            <Input
              id="targetUrl"
              placeholder="https://..."
              value={formData.targetUrl}
              onChange={(e) =>
                setFormData({ ...formData, targetUrl: e.target.value })
              }
            />
          </div>

          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2 mt-2 shadow-inner text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t("UnitPrice")}</span>
              <span>
                {t("PricePerDay", {
                  price: selectedSlot.pricePerDay.toLocaleString(
                    locale === "vi" ? "vi-VN" : "en-US",
                  ),
                })}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-primary/10 pt-2">
              <span>{t("TotalPrice")}</span>
              <span className="text-primary">
                {(selectedSlot.pricePerDay * formData.duration).toLocaleString(
                  locale === "vi" ? "vi-VN" : "en-US",
                )}{" "}
                VND
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            {tButtons("cancel")}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isPending || isConflict || isLoadingBusy || !formData.startAt
            }
            className="min-w-[150px]"
          >
            {isPending ? t("Processing") : t("CreateAndPay")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
